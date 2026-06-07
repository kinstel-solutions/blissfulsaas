import { Injectable, ConflictException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, NotificationType, ConsultationMode, PaymentStatus } from '@prisma/client';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private emailService: EmailService,
  ) {}

  async book(
    patientUserId: string,
    data: {
      therapistId: string;
      scheduledAt: string; // UTC ISO string e.g. "2026-10-14T09:00:00.000Z"
      notes?: string;
      mode?: ConsultationMode;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get the patient profile
      const patient = await tx.patient.findUnique({
        where: { userId: patientUserId },
        include: { user: { select: { email: true } } },
      });
      if (!patient) throw new NotFoundException('Patient profile not found');

      // 2. Parse the scheduledAt datetime (UTC)
      const scheduledAt = new Date(data.scheduledAt);

      // 3. Conflict check: therapist already has a booking that overlaps this slot
      //    (sessions are 50 min; buffer is 10 min → 1-hour block total)
      const slotEnd = new Date(scheduledAt.getTime() + 50 * 60 * 1000);
      
      // Fetch potential overlapping appointments (within 60 min lookback and lookforward to slotEnd)
      const candidates = await tx.appointment.findMany({
        where: {
          therapistId: data.therapistId,
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
          scheduledAt: {
            gte: new Date(scheduledAt.getTime() - 60 * 60 * 1000),
            lt: slotEnd,
          },
        },
      });

      const hasConflict = candidates.some((appt) => {
        const apptStart = appt.scheduledAt;
        const apptEnd = new Date(apptStart.getTime() + appt.duration * 60 * 1000);
        return apptStart < slotEnd && apptEnd > scheduledAt;
      });

      if (hasConflict) {
        throw new ConflictException('This time slot is no longer available');
      }

      // 4. Get the therapist details for notifications
      const therapist = await tx.therapist.findUnique({
        where: { id: data.therapistId },
        include: { user: { select: { email: true } } },
      });
      if (!therapist) throw new NotFoundException('Therapist not found');

      const mode = data.mode ?? ConsultationMode.ONLINE;

      // 5. Create the appointment
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          therapistId: data.therapistId,
          scheduledAt,
          patientNotes: data.notes,
          status: AppointmentStatus.PENDING,
          mode,
        },
      });

      // 6. Emit notifications (fire-and-forget after tx)
      const therapistName = `Dr. ${therapist.firstName ?? ''} ${therapist.lastName ?? ''}`.trim();
      const dateStr = scheduledAt.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata',
      });
      const timeStr = scheduledAt.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
      });
      const isClinic = mode === ConsultationMode.IN_CLINIC;
      const locationNote = isClinic
        ? ` (In-Clinic${therapist.clinicAddress ? ` at ${therapist.clinicAddress}` : ''})`
        : ' (Online)';

      setImmediate(() => {
        const patientTitle = 'Appointment Received';
        const patientBody = `Your ${isClinic ? 'in-clinic visit' : 'session'} with ${therapistName} has been received for ${dateStr} at ${timeStr} IST${locationNote}. Your payment has been confirmed. Pending therapist confirmation.`;

        this.notifications
          .create({
            userId: patientUserId,
            type: NotificationType.BOOKING_CONFIRMED,
            title: patientTitle,
            body: patientBody,
            metadata: { appointmentId: appointment.id, therapistName, scheduledAt: data.scheduledAt, mode },
          })
          .catch((err) => this.logger.error(err));

        if (patient.user?.email) {
          const patientAppUrl = process.env.PATIENT_APP_URL || 'http://localhost:3000';
          this.emailService
            .sendAppointmentNotification(patient.user.email, patientTitle, patientBody, 'View Appointments', `${patientAppUrl}/appointments`)
            .catch((err) => this.logger.error(err));
        }

        if (therapist.userId) {
          const therapistTitle = 'New Appointment Request';
          const therapistBody = `A patient has booked a ${isClinic ? 'in-clinic visit' : 'session'} with you on ${dateStr} at ${timeStr} IST.`;

          this.notifications
            .create({
              userId: therapist.userId,
              type: NotificationType.BOOKING_CONFIRMED,
              title: therapistTitle,
              body: therapistBody,
              metadata: { appointmentId: appointment.id, scheduledAt: data.scheduledAt, mode },
            })
            .catch((err) => this.logger.error(err));

          if (therapist.user?.email) {
            const therapistAppUrl = process.env.THERAPIST_APP_URL || 'http://localhost:3001';
            this.emailService
              .sendAppointmentNotification(therapist.user.email, therapistTitle, therapistBody, 'Review Booking', `${therapistAppUrl}/dashboard`)
              .catch((err) => this.logger.error(err));
          }
        }
      });

      return appointment;
    });
  }

  async getUpcomingSessions(userId: string, role: string) {
    const filter = {
      scheduledAt: { gte: new Date() },
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
    };

    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      if (!patient) return [];
      return this.prisma.appointment.findMany({
        where: { patientId: patient.id, ...filter },
        include: { therapist: true },
        orderBy: { scheduledAt: 'asc' }
      });
    } else if (role === 'THERAPIST') {
      const therapist = await this.prisma.therapist.findUnique({ where: { userId } });
      if (!therapist) return [];
      return this.prisma.appointment.findMany({
        where: { therapistId: therapist.id, ...filter },
        include: { patient: true },
        orderBy: { scheduledAt: 'asc' }
      });
    }
    return [];
  }

  async getAllSessions(userId: string, role: string) {
    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      if (!patient) return [];
      return this.prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: { therapist: true, feedback: true },
        orderBy: { scheduledAt: 'desc' }
      });
    } else if (role === 'THERAPIST') {
      const therapist = await this.prisma.therapist.findUnique({ where: { userId } });
      if (!therapist) return [];
      return this.prisma.appointment.findMany({
        where: { therapistId: therapist.id },
        include: { 
          patient: { 
            include: { 
              user: { select: { email: true } }
            } 
          },
        },
        orderBy: { scheduledAt: 'desc' }
      });
    }
    return [];
  }

  async getSessionById(userId: string, id: string, role: string) {
    const where: any = { id };
    
    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      if (!patient) throw new NotFoundException('Patient profile not found');
      where.patientId = patient.id;
    } else if (role === 'THERAPIST') {
      let therapist = await this.prisma.therapist.findUnique({ where: { userId } });
      if (!therapist) {
        // Self-healing: Create missing profile if accessed via a session
        therapist = await this.prisma.therapist.create({
          data: {
            userId,
            firstName: 'Therapist',
            lastName: '',
            isVerified: false,
            hourlyRate: 0,
          }
        });
      }
      where.therapistId = therapist.id;
    }

    const appointment = await this.prisma.appointment.findFirst({
      where,
      include: {
        patient: {
          include: {
            user: { select: { email: true } }
          }
        },
        therapist: {
          include: {
            user: { select: { email: true } }
          }
        },
        feedback: true,
      }
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async getAdminAllSessions() {
    return this.prisma.appointment.findMany({
      include: {
        patient: {
          include: {
            user: { select: { email: true } },
          },
        },
        therapist: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getAdminStats() {
    const [
      totalSessions,
      completedSessions,
      cancelledSessions,
      revenueData,
      therapistAggregates,
      therapists
    ] = await Promise.all([
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.CANCELLED } }),
      this.prisma.appointment.aggregate({
        _sum: { amountPaid: true },
        where: { paymentStatus: PaymentStatus.PAID }
      }),
      this.prisma.appointment.groupBy({
        by: ['therapistId'],
        _count: { _all: true },
        _sum: { amountPaid: true },
      }),
      this.prisma.therapist.findMany({
        include: { user: { select: { email: true } } }
      })
    ]);

    const therapistStats = therapists.map(t => {
      const stats = therapistAggregates.find(a => a.therapistId === t.id);
      return {
        therapistId: t.id,
        therapistName: `Dr. ${t.firstName || ''} ${t.lastName || ''}`.trim(),
        email: t.user?.email || '',
        totalConsultations: stats?._count?._all || 0,
        revenue: stats?._sum?.amountPaid || 0,
        specialities: t.specialities || [],
        qualifications: t.qualifications || '',
        yearsOfExperience: t.yearsOfExperience || 0,
        profileImageUrl: t.profileImageUrl || null,
      };
    });

    const totalRevenue = revenueData._sum.amountPaid || 0;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const cancellationRate = totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      totalRevenue,
      completionRate,
      cancellationRate,
      therapistStats,
    };
  }

  async cancelSession(userId: string, appointmentId: string, role: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        therapist: { include: { user: true } },
      }
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    // Security check: must be a participant
    if (role === 'PATIENT' && appointment.patient.userId !== userId) throw new ForbiddenException();
    if (role === 'THERAPIST' && appointment.therapist.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED }
    });

    // Notify the other party
    const dateStr = appointment.scheduledAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
    const therapistName = `Dr. ${appointment.therapist.firstName ?? ''} ${appointment.therapist.lastName ?? ''}`.trim();

    setImmediate(() => {
      if (role === 'PATIENT') {
        // Patient cancelled → notify therapist
        const title = 'Appointment Cancelled';
        const body = `A patient has cancelled their session scheduled for ${dateStr}.`;

        this.notifications.create({
          userId: appointment.therapist.userId,
          type: NotificationType.BOOKING_CANCELLED,
          title,
          body,
          metadata: { appointmentId },
        }).catch(err => this.logger.error(err));

        if (appointment.therapist.user?.email) {
          const emailBody = `The session scheduled for ${dateStr} with your patient has been cancelled.`;
          this.emailService.sendAppointmentNotification(appointment.therapist.user.email, title, emailBody, 'Contact Support', 'mailto:support@theblissfulstation.com').catch(err => this.logger.error(err));
        }
      } else {
        // Therapist cancelled → notify patient
        const title = 'Appointment Cancelled';
        const body = `Your session with ${therapistName} on ${dateStr} has been cancelled.`;

        this.notifications.create({
          userId: appointment.patient.userId,
          type: NotificationType.BOOKING_CANCELLED,
          title,
          body,
          metadata: { appointmentId, therapistName },
        }).catch(err => this.logger.error(err));

        if (appointment.patient.user?.email) {
          const emailBody = `Your session with ${therapistName} on ${dateStr} has been cancelled. If a payment was made, a refund will be processed in accordance with our cancellation policy.`;
          this.emailService.sendAppointmentNotification(appointment.patient.user.email, title, emailBody, 'Contact Support', 'mailto:support@theblissfulstation.com').catch(err => this.logger.error(err));
        }
      }
    });

    return updated;
  }

  async completeSession(therapistUserId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        therapist: true,
        patient: { include: { user: true } },
      }
    });

    if (!appointment || appointment.therapist.userId !== therapistUserId) {
      throw new ForbiddenException('Not your appointment to complete');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.COMPLETED }
    });

    // Notify patient session is complete + request feedback
    const therapistName = `Dr. ${appointment.therapist.firstName ?? ''} ${appointment.therapist.lastName ?? ''}`.trim();
    setImmediate(() => {
      const title = 'Session Completed';
      const body = `Your session with ${therapistName} has been marked as complete. We hope it went well!`;

      this.notifications.create({
        userId: appointment.patient.userId,
        type: NotificationType.SESSION_COMPLETED,
        title,
        body,
        metadata: { appointmentId, therapistName },
      }).catch(err => this.logger.error(err));

      if (appointment.patient.user?.email) {
        const patientAppUrl = process.env.PATIENT_APP_URL || 'http://localhost:3000';
        const emailTitle = 'Session Completed — Tell us how it went!';
        const emailBody = `Dear Patient,\n\nYour session with **${therapistName}** has been completed. We hope you found it helpful!\n\nPlease take a brief moment to rate your experience and provide feedback. Your input helps us maintain high quality care.`;
        this.emailService.sendAppointmentNotification(appointment.patient.user.email, emailTitle, emailBody, 'Leave Feedback', `${patientAppUrl}/appointments`).catch(err => this.logger.error(err));
      }

      // Prompt patient to leave a review
      this.notifications.create({
        userId: appointment.patient.userId,
        type: NotificationType.FEEDBACK_REQUEST,
        title: 'How was your session?',
        body: `Please take a moment to rate your experience with ${therapistName}.`,
        metadata: { appointmentId, therapistName },
      }).catch(err => this.logger.error(err));
    });

    return updated;
  }

  async confirmSession(therapistUserId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        therapist: true,
        patient: { include: { user: true } },
      }
    });

    if (!appointment || appointment.therapist.userId !== therapistUserId) {
      throw new ForbiddenException('Not your appointment to confirm');
    }

    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new ConflictException('Only pending appointments can be confirmed');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CONFIRMED }
    });

    // Notify patient session is confirmed
    const therapistName = `Dr. ${appointment.therapist.firstName ?? ''} ${appointment.therapist.lastName ?? ''}`.trim();
    const dateStr = appointment.scheduledAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
    
    setImmediate(() => {
      const title = 'Appointment Confirmed';
      const body = `Your session with ${therapistName} on ${dateStr} has been confirmed.`;

      this.notifications.create({
        userId: appointment.patient.userId,
        type: NotificationType.BOOKING_CONFIRMED,
        title,
        body,
        metadata: { appointmentId, therapistName },
      }).catch(err => this.logger.error(err));

      if (appointment.patient.user?.email) {
        const patientAppUrl = process.env.PATIENT_APP_URL || 'http://localhost:3000';
        const emailBody = `Dear Patient,\n\nGood news! Your session with **${therapistName}** scheduled for **${dateStr}** has been confirmed by the therapist.\n\nFor online sessions, you can join the video consultation room directly from your dashboard 5 minutes prior to the start time.`;
        this.emailService.sendAppointmentNotification(appointment.patient.user.email, title, emailBody, 'Go to Dashboard', `${patientAppUrl}/dashboard`).catch(err => this.logger.error(err));
      }
    });

    return updated;
  }

  async getNotes(therapistUserId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId, therapist: { userId: therapistUserId } },
      select: { therapistNotes: true }
    });

    if (!appointment) throw new ForbiddenException('Not your appointment');
    return { notes: appointment.therapistNotes || "" };
  }

  async updateNotes(therapistUserId: string, appointmentId: string, notes: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId, therapist: { userId: therapistUserId } }
    });

    if (!appointment) throw new ForbiddenException('Not your appointment');

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { therapistNotes: notes }
    });
  }

  // Placeholder for Agora Token logic - will be fully implemented in Phase 4
  async generateToken(userId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, therapist: true }
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    
    // Check participation
    const isPatient = appointment.patient.userId === userId;
    const isTherapist = appointment.therapist.userId === userId;

    if (!isPatient && !isTherapist) {
      throw new ForbiddenException('Not a participant of this appointment');
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const channelName = appointment.videoRoomId;
    const uid = 0; // Use 0 to let Agora assign a UID
    const role = RtcRole.PUBLISHER; // Both participants must be publishers for two-way video
    
    // Token expires in 2 hours
    const expirationTimeInSeconds = 3600 * 2;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    if (!appId || !appCertificate) {
      throw new Error('Agora configuration missing');
    }

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    return {
      token,
      channel: channelName,
      appId,
      uid
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleAppointmentExpiryAndReminders() {
    const now = new Date();
    
    // 1. Send reminders 10 minutes before the session starts
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    const upcomingSessions = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.CONFIRMED,
        scheduledAt: {
          gte: now,
          lte: tenMinutesFromNow,
        },
        reminderSent: false,
      },
      include: {
        patient: {
          include: {
            user: { select: { email: true } },
          },
        },
        therapist: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    for (const session of upcomingSessions) {
      try {
        const therapistName = `Dr. ${session.therapist.firstName ?? ''} ${session.therapist.lastName ?? ''}`.trim();
        const patientName = `${session.patient.firstName ?? ''} ${session.patient.lastName ?? ''}`.trim() || 'Patient';
        
        const patientTitle = 'Upcoming Session Reminder';
        const patientBody = `Your session with ${therapistName} is starting in 10 minutes.`;

        const therapistTitle = 'Upcoming Session Reminder';
        const therapistBody = `Your session with ${patientName} is starting in 10 minutes.`;

        // Create notification for patient
        await this.notifications.create({
          userId: session.patient.userId,
          type: NotificationType.GENERAL,
          title: patientTitle,
          body: patientBody,
          metadata: { appointmentId: session.id, therapistName, scheduledAt: session.scheduledAt },
        });

        if (session.patient.user?.email) {
          const patientAppUrl = process.env.PATIENT_APP_URL || 'http://localhost:3000';
          const emailTitle = 'Your Blissful SaaS session starts in 10 minutes!';
          const emailBody = `Your session with ${therapistName} is starting in 10 minutes. Please prepare your video connection and join when ready.`;
          await this.emailService.sendAppointmentNotification(
            session.patient.user.email,
            emailTitle,
            emailBody,
            'Join Video Room',
            `${patientAppUrl}/dashboard`
          );
        }

        // Create notification for therapist
        if (session.therapist.userId) {
          await this.notifications.create({
            userId: session.therapist.userId,
            type: NotificationType.GENERAL,
            title: therapistTitle,
            body: therapistBody,
            metadata: { appointmentId: session.id, scheduledAt: session.scheduledAt },
          });

          if (session.therapist.user?.email) {
            const therapistAppUrl = process.env.THERAPIST_APP_URL || 'http://localhost:3001';
            await this.emailService.sendAppointmentNotification(
              session.therapist.user.email,
              therapistTitle,
              therapistBody,
              'Join Video Room',
              `${therapistAppUrl}/dashboard`
            );
          }
        }

        // Mark as sent
        await this.prisma.appointment.update({
          where: { id: session.id },
          data: { reminderSent: true },
        });
      } catch (err) {
        this.logger.error(`Failed to send reminder for appointment ${session.id}:`, err);
      }
    }

    // 2. Update status to EXPIRED for ended appointments
    const activeAppointments = await this.prisma.appointment.findMany({
      where: {
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        scheduledAt: { lt: now },
      },
    });

    const expiredAppts = activeAppointments.filter(
      (appt) => appt.scheduledAt.getTime() + appt.duration * 60 * 1000 <= now.getTime()
    );

    for (const appt of expiredAppts) {
      try {
        await this.prisma.appointment.update({
          where: { id: appt.id },
          data: { status: AppointmentStatus.EXPIRED },
        });
        this.logger.log(`Appointment ${appt.id} status updated to EXPIRED`);
      } catch (err) {
        this.logger.error(`Failed to update status to EXPIRED for appointment ${appt.id}:`, err);
      }
    }
  }
}

import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, NotificationType, ConsultationMode, PaymentStatus } from '@prisma/client';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async book(patientUserId: string, data: { slotId: string; date: string; notes?: string; mode?: ConsultationMode }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get the patient profile
      const patient = await tx.patient.findUnique({
        where: { userId: patientUserId }
      });
      if (!patient) throw new NotFoundException('Patient profile not found');

      // 2. Check if the slot is already booked for this specific date
      const scheduledAt = new Date(data.date);
      
      const existing = await tx.appointment.findFirst({
        where: {
          slotId: data.slotId,
          scheduledAt,
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        },
      });

      if (existing) {
        throw new ConflictException('This slot is already booked for the selected date');
      }

      // 3. Get the slot details
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: data.slotId, isActive: true },
        include: { therapist: { include: { user: true } } }
      });

      if (!slot) throw new NotFoundException('Availability slot not found or inactive');

      // Inherit mode from slot if not explicitly provided
      const mode = data.mode ?? slot.mode ?? ConsultationMode.ONLINE;

      // 4. Create the appointment
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          therapistId: slot.therapistId,
          slotId: data.slotId,
          scheduledAt,
          patientNotes: data.notes,
          status: AppointmentStatus.PENDING,
          mode,
        },
      });

      // 5. Emit notifications (fire-and-forget after tx)
      const therapistName = `Dr. ${slot.therapist.firstName ?? ''} ${slot.therapist.lastName ?? ''}`.trim();
      const dateStr = scheduledAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = `${slot.startTime} – ${slot.endTime}`;
      const isClinic = mode === ConsultationMode.IN_CLINIC;
      const locationNote = isClinic
        ? ` (In-Clinic${slot.therapist.clinicAddress ? ` at ${slot.therapist.clinicAddress}` : ''})`
        : ' (Online)';

      // Patient: booking confirmed
      setImmediate(() => {
        this.notifications.create({
          userId: patientUserId,
          type: NotificationType.BOOKING_CONFIRMED,
          title: 'Appointment Booked ✓',
          body: `Your ${isClinic ? 'in-clinic visit' : 'session'} with ${therapistName} is confirmed for ${dateStr} at ${timeStr}${locationNote}.`,
          metadata: { appointmentId: appointment.id, therapistName, scheduledAt: data.date, mode },
        }).catch(console.error);

        // Therapist: new appointment
        if (slot.therapist.userId) {
          this.notifications.create({
            userId: slot.therapist.userId,
            type: NotificationType.BOOKING_CONFIRMED,
            title: 'New Appointment Request',
            body: `A patient has booked a ${isClinic ? 'in-clinic visit' : 'session'} with you on ${dateStr} at ${timeStr}.`,
            metadata: { appointmentId: appointment.id, scheduledAt: data.date, mode },
          }).catch(console.error);
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
        include: { therapist: true, slot: true },
        orderBy: { scheduledAt: 'asc' }
      });
    } else if (role === 'THERAPIST') {
      const therapist = await this.prisma.therapist.findUnique({ where: { userId } });
      if (!therapist) return [];
      return this.prisma.appointment.findMany({
        where: { therapistId: therapist.id, ...filter },
        include: { patient: true, slot: true },
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
        include: { therapist: true, slot: true, feedback: true },
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
          slot: true 
        },
        orderBy: { scheduledAt: 'desc' }
      });
    }
    return [];
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
        slot: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getAdminStats() {
    const appointments = await this.prisma.appointment.findMany({
      include: {
        therapist: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    });

    const totalSessions = appointments.length;
    const completedSessions = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;
    const cancelledSessions = appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length;
    
    // Calculate total revenue (Gross revenue from paid sessions)
    const paidAppointments = appointments.filter(a => a.paymentStatus === PaymentStatus.PAID && a.amountPaid);
    const totalRevenue = paidAppointments.reduce((sum, a) => sum + (a.amountPaid || 0), 0);

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const cancellationRate = totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0;

    // Revenue per therapist
    const therapistStatsMap = new Map();

    for (const appt of appointments) {
      if (!appt.therapist) continue;
      
      const tId = appt.therapist.id;
      if (!therapistStatsMap.has(tId)) {
        therapistStatsMap.set(tId, {
          therapistId: tId,
          therapistName: `Dr. ${appt.therapist.firstName || ''} ${appt.therapist.lastName || ''}`.trim(),
          email: appt.therapist.user?.email || '',
          totalConsultations: 0,
          revenue: 0,
          specialities: appt.therapist.specialities || [],
          qualifications: appt.therapist.qualifications || '',
          yearsOfExperience: appt.therapist.yearsOfExperience || 0,
        });
      }

      const stats = therapistStatsMap.get(tId);
      stats.totalConsultations += 1;
      if (appt.paymentStatus === PaymentStatus.PAID && appt.amountPaid) {
        stats.revenue += appt.amountPaid;
      }
    }

    const therapistStats = Array.from(therapistStatsMap.values());

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
        slot: true,
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
    const dateStr = appointment.scheduledAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const therapistName = `Dr. ${appointment.therapist.firstName ?? ''} ${appointment.therapist.lastName ?? ''}`.trim();

    setImmediate(() => {
      if (role === 'PATIENT') {
        // Patient cancelled → notify therapist
        this.notifications.create({
          userId: appointment.therapist.userId,
          type: NotificationType.BOOKING_CANCELLED,
          title: 'Appointment Cancelled',
          body: `A patient has cancelled their session scheduled for ${dateStr}.`,
          metadata: { appointmentId },
        }).catch(console.error);
      } else {
        // Therapist cancelled → notify patient
        this.notifications.create({
          userId: appointment.patient.userId,
          type: NotificationType.BOOKING_CANCELLED,
          title: 'Appointment Cancelled',
          body: `Your session with ${therapistName} on ${dateStr} has been cancelled.`,
          metadata: { appointmentId, therapistName },
        }).catch(console.error);
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
      this.notifications.create({
        userId: appointment.patient.userId,
        type: NotificationType.SESSION_COMPLETED,
        title: 'Session Completed',
        body: `Your session with ${therapistName} has been marked as complete. We hope it went well!`,
        metadata: { appointmentId, therapistName },
      }).catch(console.error);

      // Prompt patient to leave a review
      this.notifications.create({
        userId: appointment.patient.userId,
        type: NotificationType.FEEDBACK_REQUEST,
        title: 'How was your session?',
        body: `Please take a moment to rate your experience with ${therapistName}.`,
        metadata: { appointmentId, therapistName },
      }).catch(console.error);
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
}

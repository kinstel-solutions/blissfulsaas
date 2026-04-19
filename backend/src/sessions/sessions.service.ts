import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus, NotificationType } from '@prisma/client';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async book(patientUserId: string, data: { slotId: string; date: string; notes?: string }) {
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

      // 4. Create the appointment
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          therapistId: slot.therapistId,
          slotId: data.slotId,
          scheduledAt,
          patientNotes: data.notes,
          status: AppointmentStatus.PENDING,
        },
      });

      // 5. Emit notifications (fire-and-forget after tx)
      const therapistName = `Dr. ${slot.therapist.firstName ?? ''} ${slot.therapist.lastName ?? ''}`.trim();
      const dateStr = scheduledAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = `${slot.startTime} – ${slot.endTime}`;

      // Patient: booking confirmed
      setImmediate(() => {
        this.notifications.create({
          userId: patientUserId,
          type: NotificationType.BOOKING_CONFIRMED,
          title: 'Appointment Booked ✓',
          body: `Your session with ${therapistName} is confirmed for ${dateStr} at ${timeStr}.`,
          metadata: { appointmentId: appointment.id, therapistName, scheduledAt: data.date },
        }).catch(console.error);

        // Therapist: new appointment
        if (slot.therapist.userId) {
          this.notifications.create({
            userId: slot.therapist.userId,
            type: NotificationType.BOOKING_CONFIRMED,
            title: 'New Appointment Request',
            body: `A patient has booked a session with you on ${dateStr} at ${timeStr}.`,
            metadata: { appointmentId: appointment.id, scheduledAt: data.date },
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
        include: { therapist: true, slot: true },
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

    // Notify patient session is complete
    const therapistName = `Dr. ${appointment.therapist.firstName ?? ''} ${appointment.therapist.lastName ?? ''}`.trim();
    setImmediate(() => {
      this.notifications.create({
        userId: appointment.patient.userId,
        type: NotificationType.SESSION_COMPLETED,
        title: 'Session Completed',
        body: `Your session with ${therapistName} has been marked as complete. We hope it went well!`,
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

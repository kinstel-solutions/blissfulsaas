import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async book(patientUserId: string, data: { slotId: string; date: string; notes?: string }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get the patient profile
      const patient = await tx.patient.findUnique({
        where: { userId: patientUserId }
      });
      if (!patient) throw new NotFoundException('Patient profile not found');

      // 2. Check if the slot is already booked for this specific date
      // We parse the date to ensure we are looking at the right day
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
        include: { therapist: true }
      });

      if (!slot) throw new NotFoundException('Availability slot not found or inactive');

      // 4. Create the appointment
      return tx.appointment.create({
        data: {
          patientId: patient.id,
          therapistId: slot.therapistId,
          slotId: data.slotId,
          scheduledAt,
          patientNotes: data.notes,
          status: AppointmentStatus.PENDING,
        },
      });
    });
  }

  async getUpcomingSessions(userId: string, role: string) {
    if (role === 'PATIENT') {
      const patient = await this.prisma.patient.findUnique({ where: { userId } });
      if (!patient) return [];
      return this.prisma.appointment.findMany({
        where: { 
          patientId: patient.id, 
          scheduledAt: { gte: new Date() },
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
        },
        include: { therapist: true, slot: true },
        orderBy: { scheduledAt: 'asc' }
      });
    } else if (role === 'THERAPIST') {
      const therapist = await this.prisma.therapist.findUnique({ where: { userId } });
      if (!therapist) return [];
      return this.prisma.appointment.findMany({
        where: { 
          therapistId: therapist.id, 
          scheduledAt: { gte: new Date() },
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
        },
        include: { patient: true, slot: true },
        orderBy: { scheduledAt: 'asc' }
      });
    }
    return [];
  }

  async cancelSession(userId: string, appointmentId: string, role: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, therapist: true }
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    // Security check: must be a participant
    if (role === 'PATIENT' && appointment.patient.userId !== userId) throw new ForbiddenException();
    if (role === 'THERAPIST' && appointment.therapist.userId !== userId) throw new ForbiddenException();

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED }
    });
  }

  async completeSession(therapistUserId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId, therapist: { userId: therapistUserId } }
    });

    if (!appointment) throw new ForbiddenException('Not your appointment to complete');

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.COMPLETED }
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
    const role = isTherapist ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
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

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderUserId: string, appointmentId: string, content: string) {
    // 1. Verify the appointment exists
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, therapist: true },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    // 2. Security: only participants can send messages
    const isPatient = appointment.patient.userId === senderUserId;
    const isTherapist = appointment.therapist.userId === senderUserId;
    if (!isPatient && !isTherapist) {
      throw new ForbiddenException('Not a participant of this appointment');
    }

    // 2.2 Status check: cannot chat on cancelled appointments
    if (appointment.status === 'CANCELLED') {
      throw new ForbiddenException('Cannot send messages to a cancelled appointment');
    }

    // 2.5 Security: Ensure we are within the 7-day Post-Consultation Chat Window
    const sessionEndTime = new Date(appointment.scheduledAt).getTime() + (appointment.duration * 60000);
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() > sessionEndTime + SEVEN_DAYS_MS) {
      throw new ForbiddenException('Chat window has closed (7 days after consultation)');
    }

    // 3. Insert the message
    return this.prisma.message.create({
      data: {
        appointmentId,
        senderId: senderUserId,
        content,
      },
      include: {
        sender: { select: { id: true, email: true, role: true } },
      },
    });
  }

  async getMessages(requesterUserId: string, appointmentId: string) {
    // Verify participation first
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, therapist: true },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    const isParticipant =
      appointment.patient.userId === requesterUserId ||
      appointment.therapist.userId === requesterUserId;

    if (!isParticipant) throw new ForbiddenException('Not a participant');

    return this.prisma.message.findMany({
      where: { appointmentId },
      include: {
        sender: { select: { id: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markAsRead(requesterUserId: string, appointmentId: string) {
    // Mark as read all messages in this appointment NOT sent by the requester
    return this.prisma.message.updateMany({
      where: {
        appointmentId,
        senderId: { not: requesterUserId },
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async getUnreadCounts(userId: string) {
    // Find all appointments involving the user
    // Then count unread messages in those where sender is NOT the user
    console.log(`fetching unread counts for userId: ${userId}`);
    const unreadMessages = await this.prisma.message.findMany({
      where: {
        appointment: {
          OR: [
            { patient: { userId } },
            { therapist: { userId } }
          ]
        },
        senderId: { not: userId },
        isRead: false,
      },
      select: {
        appointmentId: true
      }
    });
    
    console.log(`Found ${unreadMessages.length} total unread messages for user: ${userId}`);

    // Transform to a map of appointmentId -> count
    const countMap: Record<string, number> = {};
    for (const msg of unreadMessages) {
      countMap[msg.appointmentId] = (countMap[msg.appointmentId] || 0) + 1;
    }
    
    return countMap;
  }
}

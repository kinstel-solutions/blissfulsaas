import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {}

  async sendMessage(senderUserId: string, appointmentId: string, content: string) {
    // 1. Verify the appointment exists
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { 
        patient: { include: { user: true } }, 
        therapist: { include: { user: true } } 
      },
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
    const duration = appointment.duration ?? 60;
    const sessionEndTime = new Date(appointment.scheduledAt).getTime() + (duration * 60000);
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() > sessionEndTime + SEVEN_DAYS_MS) {
      throw new ForbiddenException('Chat window has closed (7 days after consultation)');
    }

    // 3. Insert the message
    const message = await this.prisma.message.create({
      data: {
        appointmentId,
        senderId: senderUserId,
        content,
      },
      include: {
        sender: { select: { id: true, email: true, role: true } },
      },
    });

    // 4. Emit Notification to the recipient
    const recipientUserId = isPatient ? appointment.therapist.userId : appointment.patient.userId;
    const senderName = isPatient 
      ? `${appointment.patient.firstName ?? 'Patient'}` 
      : `Dr. ${appointment.therapist.lastName ?? 'Therapist'}`;

    setImmediate(() => {
      this.notifications.create({
        userId: recipientUserId,
        type: NotificationType.NEW_MESSAGE,
        title: 'New Message',
        body: `${senderName}: ${content.length > 40 ? content.substring(0, 37) + '...' : content}`,
        metadata: { appointmentId, senderId: senderUserId, senderName },
      }).catch(err => this.logger.error(err));
    });

    return message;
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
    // 1. Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        appointmentId,
        senderId: { not: requesterUserId },
        isRead: false,
      },
      data: { isRead: true },
    });

    // 2. Mark notifications as read using a reliable in-memory filter + updateMany
    const unreadNotifs = await this.prisma.notification.findMany({
      where: {
        userId: requesterUserId,
        type: 'NEW_MESSAGE',
        isRead: false,
      },
    });

    const targetNotifIds = unreadNotifs
      .filter(n => (n.metadata as any)?.appointmentId === appointmentId)
      .map(n => n.id);

    if (targetNotifIds.length > 0) {
      await this.prisma.notification.updateMany({
        where: { id: { in: targetNotifIds } },
        data: { isRead: true },
      });
    }

    return { success: true };
  }

  async getUnreadCounts(userId: string) {
    // Find all appointments involving the user
    // Then count unread messages in those where sender is NOT the user
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
    
    // Transform to a map of appointmentId -> count
    const countMap: Record<string, number> = {};
    for (const msg of unreadMessages) {
      countMap[msg.appointmentId] = (countMap[msg.appointmentId] || 0) + 1;
    }
    
    return countMap;
  }

  async getMessagesByPatient(therapistUserId: string, patientId: string) {
    // 1. Find the therapist profile
    let therapist = await this.prisma.therapist.findUnique({
      where: { userId: therapistUserId },
    });
    if (!therapist) {
      // Self-healing: Create missing profile
      therapist = await this.prisma.therapist.create({
        data: {
          userId: therapistUserId,
          firstName: 'Therapist',
          lastName: '',
          isVerified: false,
          hourlyRate: 0,
        }
      });
    }

    // 2. Fetch all messages for all appointments between this therapist and patient
    return this.prisma.message.findMany({
      where: {
        appointment: {
          therapistId: therapist.id,
          patientId: patientId,
          status: { not: 'CANCELLED' }
        },
      },
      include: {
        sender: { select: { id: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

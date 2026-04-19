import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /** Create a notification for a specific user */
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        metadata: data.metadata ?? {},
      },
    });
  }

  /** Get all notifications for the authenticated user (newest first) */
  async getAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Cap at 50 most recent
    });
  }

  /** Count unread notifications for the authenticated user */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  /** Mark a single notification as read */
  async markRead(userId: string, notificationId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.userId !== userId) throw new ForbiddenException();

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /** Mark ALL notifications for the user as read */
  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  /** Delete a single notification */
  async delete(userId: string, notificationId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.userId !== userId) throw new ForbiddenException();

    await this.prisma.notification.delete({ where: { id: notificationId } });
    return { success: true };
  }
}

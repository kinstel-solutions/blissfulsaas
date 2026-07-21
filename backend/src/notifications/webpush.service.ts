import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(private prisma: PrismaService) {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:admin@blissfulstation.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } else {
      this.logger.warn('VAPID keys not configured. Web Push will not work.');
    }
  }

  async saveSubscription(userId: string, subscription: any) {
    const { endpoint, keys } = subscription;
    if (!endpoint || !keys) {
      throw new Error('Invalid subscription payload');
    }

    return this.prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      update: {
        userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });
  }

  async sendCallNotification(userId: string, callData: { title: string; body: string; url: string }) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title: callData.title,
      body: callData.body,
      url: callData.url,
      type: 'INCOMING_CALL'
    });

    const sendPromises = subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      ).catch((error) => {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription has expired or is no longer valid
          this.logger.log(`Removing invalid push subscription: ${sub.id}`);
          return this.prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
        this.logger.error('Error sending web push notification', error);
      })
    );

    await Promise.all(sendPromises);
  }
}

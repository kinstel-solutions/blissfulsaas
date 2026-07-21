import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

import { WebPushService } from './webpush.service';
import { Body, Post } from '@nestjs/common';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly webPushService: WebPushService,
  ) {}

  /** POST /notifications/push-subscription — save web push subscription */
  @Post('push-subscription')
  async savePushSubscription(@Request() req: any, @Body() subscription: any) {
    await this.webPushService.saveSubscription(req.user.userId, subscription);
    return { success: true };
  }

  /** GET /notifications — list all notifications for the current user */
  @Get()
  getAll(@Request() req: any) {
    return this.notificationsService.getAll(req.user.userId);
  }

  /** GET /notifications/unread/count — get unread count */
  @Get('unread/count')
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  /** PATCH /notifications/read-all — mark all as read */
  @Patch('read-all')
  markAllRead(@Request() req: any) {
    return this.notificationsService.markAllRead(req.user.userId);
  }

  /** PATCH /notifications/:id/read — mark one as read */
  @Patch(':id/read')
  markRead(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markRead(req.user.userId, id);
  }

  /** DELETE /notifications/:id — delete one notification */
  @Delete(':id')
  delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.delete(req.user.userId, id);
  }

  /** DELETE /notifications — delete all notifications */
  @Delete()
  deleteAll(@Request() req: any) {
    return this.notificationsService.deleteAll(req.user.userId);
  }
}

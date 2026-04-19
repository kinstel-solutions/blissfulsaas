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

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

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
  markRead(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.markRead(req.user.userId, id);
  }

  /** DELETE /notifications/:id — delete one notification */
  @Delete(':id')
  delete(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.delete(req.user.userId, id);
  }
}

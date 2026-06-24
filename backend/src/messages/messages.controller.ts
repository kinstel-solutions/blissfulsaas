import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  send(
    @Request() req: any,
    @Body() body: { appointmentId: string; content: string },
  ) {
    return this.messagesService.sendMessage(
      req.user.userId,
      body.appointmentId,
      body.content,
    );
  }

  @Get('unread/counts')
  getUnreadCounts(@Request() req: any) {
    return this.messagesService.getUnreadCounts(req.user.userId);
  }

  @Get(':appointmentId')
  getForAppointment(
    @Request() req: any,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.messagesService.getMessages(req.user.userId, appointmentId);
  }

  @Post(':appointmentId/read')
  markRead(
    @Request() req: any,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.messagesService.markAsRead(req.user.userId, appointmentId);
  }

  @Get('patient/:patientId')
  getForPatient(
    @Request() req: any,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.messagesService.getMessagesByPatient(
      req.user.userId,
      patientId,
    );
  }
}

import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /** POST /feedback/:appointmentId — Patient submits feedback */
  @Post(':appointmentId')
  @Roles('PATIENT')
  submit(
    @Request() req: any,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.feedbackService.submitFeedback(
      req.user.userId,
      appointmentId,
      body.rating,
      body.comment,
    );
  }

  /** GET /feedback/appointment/:appointmentId — Get feedback for one appointment */
  @Get('appointment/:appointmentId')
  getForAppointment(
    @Request() req: any,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  ) {
    return this.feedbackService.getFeedbackForAppointment(
      req.user.userId,
      appointmentId,
    );
  }

  /** GET /feedback/therapist/:therapistId/stats — Public rating aggregate (accessible by any authenticated user) */
  @Get('therapist/:therapistId/stats')
  getTherapistStats(
    @Param('therapistId', ParseUUIDPipe) therapistId: string,
  ) {
    return this.feedbackService.getTherapistRatingStats(therapistId);
  }

  /** GET /feedback/admin/all — Admin: all feedback */
  @Get('admin/all')
  @Roles('ADMIN')
  getAllAdmin() {
    return this.feedbackService.getAllFeedbackAdmin();
  }

  /** PATCH /feedback/admin/:id/toggle — Admin: toggle visibility */
  @Patch('admin/:id/toggle')
  @Roles('ADMIN')
  toggleVisibility(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedbackService.toggleFeedbackVisibility(id);
  }
}

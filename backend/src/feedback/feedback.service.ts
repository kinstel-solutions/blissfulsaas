import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /** Patient submits feedback for a completed appointment */
  async submitFeedback(
    patientUserId: string,
    appointmentId: string,
    rating: number,
    comment?: string,
  ) {
    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be an integer between 1 and 5');
    }

    // Find the appointment and verify ownership + completion
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        therapist: { include: { user: true } },
        feedback: true,
      },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.patient.userId !== patientUserId)
      throw new ForbiddenException('Not your appointment');
    if (appointment.status !== 'COMPLETED')
      throw new BadRequestException(
        'Feedback can only be submitted for completed sessions',
      );
    if (appointment.feedback)
      throw new ConflictException(
        'Feedback has already been submitted for this appointment',
      );

    const feedback = await this.prisma.sessionFeedback.create({
      data: {
        appointmentId,
        therapistId: appointment.therapistId,
        rating,
        comment: comment?.trim() || null,
      },
    });

    // Notify therapist (fire-and-forget)
    const therapistName = `Dr. ${appointment.therapist.firstName ?? ''} ${appointment.therapist.lastName ?? ''}`.trim();
    setImmediate(() => {
      if (appointment.therapist.userId) {
        this.notifications
          .create({
            userId: appointment.therapist.userId,
            type: NotificationType.GENERAL,
            title: 'New Session Review',
            body: `A patient left you a ${rating}-star review after their session.`,
            metadata: { appointmentId, rating },
          })
          .catch(console.error);
      }
    });

    return feedback;
  }

  /** Get feedback for a specific appointment (accessible by patient or therapist participant) */
  async getFeedbackForAppointment(userId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        therapist: true,
        feedback: true,
      },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    const isPatient = appointment.patient.userId === userId;
    const isTherapist = appointment.therapist.userId === userId;
    if (!isPatient && !isTherapist) throw new ForbiddenException();

    return appointment.feedback ?? null;
  }

  /** Get aggregate rating stats for a therapist (public) */
  async getTherapistRatingStats(therapistId: string) {
    const feedbacks = await this.prisma.sessionFeedback.findMany({
      where: { therapistId, isPublic: true },
      select: { rating: true, comment: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const total = feedbacks.length;
    const average =
      total > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / total
        : null;

    // Star distribution
    const distribution = [1, 2, 3, 4, 5].reduce(
      (acc, star) => ({
        ...acc,
        [star]: feedbacks.filter((f) => f.rating === star).length,
      }),
      {} as Record<number, number>,
    );

    // Public reviews with comments (latest 10)
    const reviews = feedbacks
      .filter((f) => f.comment)
      .slice(0, 10)
      .map((f) => ({
        rating: f.rating,
        comment: f.comment,
        createdAt: f.createdAt,
      }));

    return { total, average, distribution, reviews };
  }

  /** Admin: get all feedback with full relations */
  async getAllFeedbackAdmin() {
    return this.prisma.sessionFeedback.findMany({
      include: {
        appointment: {
          include: {
            patient: { select: { firstName: true, lastName: true } },
            therapist: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Admin: toggle visibility of a feedback record */
  async toggleFeedbackVisibility(feedbackId: string) {
    const existing = await this.prisma.sessionFeedback.findUnique({
      where: { id: feedbackId },
    });
    if (!existing) throw new NotFoundException('Feedback not found');

    return this.prisma.sessionFeedback.update({
      where: { id: feedbackId },
      data: { isPublic: !existing.isPublic },
    });
  }
}

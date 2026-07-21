import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaymentStatus,
  AppointmentStatus,
  NotificationType,
  ConsultationMode,
} from '@prisma/client';
import * as crypto from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private emailService: EmailService,
    private sessionsService: SessionsService,
  ) {}

  private get isMock(): boolean {
    return process.env.MOCK_PAYMENT === 'true';
  }

  /**
   * Creates a payment order for a given therapist + time slot.
   * In mock mode: returns a fake order without calling Razorpay.
   * In live mode: calls Razorpay API to create a real order.
   */
  async createOrder(
    patientUserId: string,
    data: {
      therapistId: string;
      scheduledAt: string;
      notes?: string;
      mode?: string;
    },
  ) {
    // Validate therapist exists
    const therapist = await this.prisma.therapist.findUnique({
      where: { id: data.therapistId },
    });
    if (!therapist) throw new NotFoundException('Therapist not found');

    // Check if patient profile exists
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });
    if (!patient) throw new NotFoundException('Patient profile not found');

    // Check if the therapist is already booked at this exact time
    const scheduledAt = new Date(data.scheduledAt);
    const slotEnd = new Date(scheduledAt.getTime() + 50 * 60 * 1000);
    const existing = await this.prisma.appointment.findFirst({
      where: {
        therapistId: data.therapistId,
        scheduledAt: {
          gte: new Date(scheduledAt.getTime() - 59 * 60 * 1000),
          lt: slotEnd,
        },
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'This therapist is already booked for the selected date and time',
      );
    }

    const existingPatient = await this.prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        scheduledAt: {
          gte: new Date(scheduledAt.getTime() - 59 * 60 * 1000),
          lt: slotEnd,
        },
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
    });
    if (existingPatient) {
      throw new BadRequestException(
        'You already have a session booked for the selected date and time',
      );
    }

    const therapistName =
      `${therapist.firstName ?? ''} ${therapist.lastName ?? ''}`.trim();
    const amountInPaise = Math.round((therapist.hourlyRate ?? 1500) * 100);

    if (this.isMock) {
      const mockOrderId = `MOCK_ORDER_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      return {
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: 'INR',
        key: 'MOCK_KEY',
        therapistName,
        therapistId: data.therapistId,
        scheduledAt: data.scheduledAt,
        notes: data.notes,
        mode: data.mode ?? 'ONLINE',
        isMock: true,
      };
    }

    // ── Live Razorpay ──────────────────────────────────────────────
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
      throw new BadRequestException(
        'Razorpay keys not configured. Set MOCK_PAYMENT=true for local dev.',
      );
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new BadRequestException(
        `Razorpay order creation failed: ${JSON.stringify(err)}`,
      );
    }

    const order: any = await response.json();
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      therapistName,
      therapistId: data.therapistId,
      scheduledAt: data.scheduledAt,
      notes: data.notes,
      mode: data.mode ?? 'ONLINE',
      isMock: false,
    };
  }

  /**
   * Verifies a completed payment and atomically creates the appointment.
   * Mock mode: skips HMAC signature check.
   * Live mode: validates Razorpay HMAC signature before booking.
   */
  async verifyAndBook(
    patientUserId: string,
    data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      therapistId: string;
      scheduledAt: string;
      notes?: string;
      mode?: string;
    },
  ) {
    if (!this.isMock) {
      // ── Live: validate HMAC signature ─────────────────────────
      const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
      const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== data.razorpay_signature) {
        throw new BadRequestException('Payment signature verification failed');
      }
    }

    // 0. Idempotency guard: Check if this payment ID has already been used
    const existingPayment = await this.prisma.appointment.findFirst({
      where: { paymentId: data.razorpay_payment_id },
      include: { therapist: { include: { user: true } } },
    });
    if (existingPayment) return existingPayment;

    // ── Book the appointment atomically ──────────────────────────
    return this.prisma.$transaction(async (tx) => {
      const patient = await tx.patient.findUnique({
        where: { userId: patientUserId },
        include: { user: { select: { email: true } } },
      });
      if (!patient) throw new NotFoundException('Patient profile not found');

      const scheduledAt = new Date(data.scheduledAt);
      const slotEnd = new Date(scheduledAt.getTime() + 50 * 60 * 1000);

      const therapist = await tx.therapist.findUnique({
        where: { id: data.therapistId },
      });
      if (!therapist) throw new NotFoundException('Therapist not found');

      // Final safety check: therapist availability for this time
      const hasConflict = await this.sessionsService.checkBookingConflict(
        tx,
        data.therapistId,
        scheduledAt,
      );
      if (hasConflict) {
        throw new BadRequestException(
          'Therapist is already booked for this date and time',
        );
      }

      const hasPatientConflict =
        await this.sessionsService.checkPatientBookingConflict(
          tx,
          patient.id,
          scheduledAt,
        );
      if (hasPatientConflict) {
        throw new BadRequestException(
          'You already have a session booked for this time slot',
        );
      }

      const amountPaid = therapist.hourlyRate ?? 1500;

      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          therapistId: data.therapistId,
          scheduledAt,
          patientNotes: data.notes,
          status: AppointmentStatus.PENDING,
          paymentStatus: PaymentStatus.PAID,
          paymentId: data.razorpay_payment_id,
          amountPaid,
          paidAt: new Date(),
          mode: (data.mode as any) ?? 'ONLINE',
        },
        include: { therapist: { include: { user: true } } },
      });

      const therapistName =
        `${appointment.therapist.firstName ?? ''} ${appointment.therapist.lastName ?? ''}`.trim();
      const dateStr = scheduledAt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Kolkata',
      });
      const timeStr = scheduledAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      });

      // Fire-and-forget notifications after the tx commits
      setImmediate(() => {
        const isClinic = appointment.mode === ConsultationMode.IN_CLINIC;
        const locationNote = isClinic
          ? ` (In-Clinic${appointment.therapist.clinicAddress ? ` at ${appointment.therapist.clinicAddress}` : ''})`
          : ' (Online)';

        // Patient: payment success (in-app)
        this.notifications
          .create({
            userId: patientUserId,
            type: NotificationType.PAYMENT_SUCCESS,
            title: 'Payment Successful 💳',
            body: `Payment of ₹${amountPaid.toLocaleString('en-IN')} confirmed. Your session with ${therapistName} on ${dateStr} at ${timeStr} IST is booked.`,
            metadata: {
              appointmentId: appointment.id,
              amount: amountPaid,
              therapistName,
              scheduledAt: data.scheduledAt,
            },
          })
          .catch((err) => this.logger.error(err));

        // Patient: booking email notification
        if (patient.user?.email) {
          const patientAppUrl =
            process.env.PATIENT_APP_URL || 'http://localhost:3000';
          const patientTitle = 'Appointment Received';
          const patientBody = `Your ${isClinic ? 'in-clinic visit' : 'session'} with ${therapistName} has been received for ${dateStr} at ${timeStr} IST${locationNote}. Your payment has been confirmed. Pending therapist confirmation.`;
          this.emailService
            .sendAppointmentNotification(
              patient.user.email,
              patientTitle,
              patientBody,
              'View Appointments',
              `${patientAppUrl}/appointments`,
            )
            .catch((err) => this.logger.error(err));
        }

        // Therapist: new booking (in-app)
        if (appointment.therapist.userId) {
          this.notifications
            .create({
              userId: appointment.therapist.userId,
              type: NotificationType.BOOKING_CONFIRMED,
              title: 'New Appointment Booked',
              body: `A patient has booked a paid session with you on ${dateStr} at ${timeStr} IST.`,
              metadata: {
                appointmentId: appointment.id,
                scheduledAt: data.scheduledAt,
              },
            })
            .catch((err) => this.logger.error(err));

          // Therapist: booking email notification
          if (appointment.therapist.user?.email) {
            const therapistAppUrl =
              process.env.THERAPIST_APP_URL || 'http://localhost:3001';
            const therapistTitle = 'New Appointment Request';
            const therapistBody = `A patient has booked a ${isClinic ? 'in-clinic visit' : 'session'} with you on ${dateStr} at ${timeStr} IST.`;
            this.emailService
              .sendAppointmentNotification(
                appointment.therapist.user.email,
                therapistTitle,
                therapistBody,
                'Review Booking',
                `${therapistAppUrl}/dashboard`,
              )
              .catch((err) => this.logger.error(err));
          }
        }
      });

      return appointment;
    });
  }
}

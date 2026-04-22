import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, AppointmentStatus, NotificationType } from '@prisma/client';
import * as crypto from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private get isMock(): boolean {
    return process.env.MOCK_PAYMENT === 'true';
  }

  /**
   * Creates a payment order for a given slot.
   * In mock mode: returns a fake order without calling Razorpay.
   * In live mode: calls Razorpay API to create a real order.
   */
  async createOrder(
    patientUserId: string,
    data: { slotId: string; date: string; notes?: string; mode?: string },
  ) {
    // Validate the slot exists and is active
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: data.slotId, isActive: true },
      include: { therapist: true },
    });
    if (!slot) throw new NotFoundException('Availability slot not found or inactive');

    // Check if patient profile exists
    const patient = await this.prisma.patient.findUnique({
      where: { userId: patientUserId },
    });
    if (!patient) throw new NotFoundException('Patient profile not found');

    // Check if the therapist is already booked for this date and time (any mode)
    const scheduledAt = new Date(data.date);
    const existing = await this.prisma.appointment.findFirst({
      where: {
        therapistId: slot.therapistId,
        scheduledAt,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
    });
    if (existing) {
      throw new BadRequestException('This therapist is already booked for the selected date and time');
    }

    const therapistName = `Dr. ${slot.therapist.firstName ?? ''} ${slot.therapist.lastName ?? ''}`.trim();
    const amountInPaise = Math.round((slot.therapist.hourlyRate ?? 1500) * 100);

    if (this.isMock) {
      const mockOrderId = `MOCK_ORDER_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      return {
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: 'INR',
        key: 'MOCK_KEY',
        therapistName,
        slotId: data.slotId,
        date: data.date,
        notes: data.notes,
        mode: data.mode ?? slot.mode ?? 'ONLINE',
        isMock: true,
      };
    }

    // ── Live Razorpay ──────────────────────────────────────────────
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
      throw new BadRequestException('Razorpay keys not configured. Set MOCK_PAYMENT=true for local dev.');
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
      throw new BadRequestException(`Razorpay order creation failed: ${JSON.stringify(err)}`);
    }

    const order: any = await response.json();
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      therapistName,
      slotId: data.slotId,
      date: data.date,
      notes: data.notes,
      mode: data.mode ?? slot.mode ?? 'ONLINE',
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
      slotId: string;
      date: string;
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
    } else {
      // ── Mock: accept any payment ID — just log it ──────────────
      console.log(
        `[MOCK PAYMENT] Auto-verifying payment: order=${data.razorpay_order_id} payment=${data.razorpay_payment_id}`,
      );
    }

    // ── Book the appointment atomically ──────────────────────────
    return this.prisma.$transaction(async (tx) => {
      const patient = await tx.patient.findUnique({ where: { userId: patientUserId } });
      if (!patient) throw new NotFoundException('Patient profile not found');

      const scheduledAt = new Date(data.date);

      const slot = await tx.availabilitySlot.findUnique({
        where: { id: data.slotId, isActive: true },
        include: { therapist: true },
      });
      if (!slot) throw new NotFoundException('Slot not found or inactive');

      // Final safety check: therapist availability for this time
      const existing = await tx.appointment.findFirst({
        where: {
          therapistId: slot.therapistId,
          scheduledAt,
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        },
      });
      if (existing) throw new BadRequestException('Therapist is already booked for this date and time');

      const amountPaid = slot.therapist.hourlyRate ?? 1500;

      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          therapistId: slot.therapistId,
          slotId: data.slotId,
          scheduledAt,
          patientNotes: data.notes,
          status: AppointmentStatus.PENDING,
          paymentStatus: PaymentStatus.PAID,
          paymentId: data.razorpay_payment_id,
          amountPaid,
          paidAt: new Date(),
          mode: (data.mode as any) ?? slot.mode ?? 'ONLINE',
        },
        include: { therapist: { include: { user: true } }, slot: true },
      });

      const therapistName = `Dr. ${appointment.therapist.firstName ?? ''} ${appointment.therapist.lastName ?? ''}`.trim();
      const dateStr = scheduledAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = `${appointment.slot.startTime} – ${appointment.slot.endTime}`;

      // Fire-and-forget notifications after the tx commits
      setImmediate(() => {
        // Patient: payment success
        this.notifications.create({
          userId: patientUserId,
          type: NotificationType.PAYMENT_SUCCESS,
          title: 'Payment Successful 💳',
          body: `Payment of ₹${amountPaid.toLocaleString('en-IN')} confirmed. Your session with ${therapistName} on ${dateStr} at ${timeStr} is booked.`,
          metadata: { appointmentId: appointment.id, amount: amountPaid, therapistName, scheduledAt: data.date },
        }).catch(console.error);

        // Therapist: new booking
        if (appointment.therapist.userId) {
          this.notifications.create({
            userId: appointment.therapist.userId,
            type: NotificationType.BOOKING_CONFIRMED,
            title: 'New Appointment Booked',
            body: `A patient has booked a paid session with you on ${dateStr} at ${timeStr}.`,
            metadata: { appointmentId: appointment.id, scheduledAt: data.date },
          }).catch(console.error);
        }
      });

      return appointment;
    });
  }
}

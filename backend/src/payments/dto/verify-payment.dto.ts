import { IsString, IsNotEmpty, IsISO8601, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ConsultationMode } from './create-order.dto';

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  razorpay_order_id: string;

  @IsString()
  @IsNotEmpty()
  razorpay_payment_id: string;

  @IsString()
  @IsNotEmpty()
  razorpay_signature: string;

  /** Therapist internal UUID */
  @IsUUID()
  @IsNotEmpty()
  therapistId: string;

  /**
   * Exact UTC ISO 8601 datetime for the session.
   * e.g. "2026-10-14T09:00:00.000Z"
   */
  @IsISO8601()
  @IsNotEmpty()
  scheduledAt: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(ConsultationMode)
  @IsOptional()
  mode?: ConsultationMode;
}

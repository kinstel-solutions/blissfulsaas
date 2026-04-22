import { IsString, IsNotEmpty, IsISO8601, IsOptional, IsEnum } from 'class-validator';
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

  @IsString()
  @IsNotEmpty()
  slotId: string;

  @IsISO8601()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(ConsultationMode)
  @IsOptional()
  mode?: ConsultationMode;
}

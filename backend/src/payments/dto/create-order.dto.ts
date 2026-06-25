import {
  IsString,
  IsNotEmpty,
  IsISO8601,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export enum ConsultationMode {
  ONLINE = 'ONLINE',
  IN_CLINIC = 'IN_CLINIC',
}

export class CreateOrderDto {
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

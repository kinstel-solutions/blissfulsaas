import { IsString, IsUUID, IsISO8601, IsOptional, IsEnum } from 'class-validator';

export class CreateBookingDto {
  /** The therapist's internal UUID (from Therapist.id) */
  @IsUUID()
  therapistId: string;

  /**
   * The exact UTC ISO 8601 datetime for the session start.
   * e.g. "2026-10-14T09:00:00.000Z"
   * Must correspond to one of the available slots returned by GET /availability/therapist/:id/slots
   */
  @IsISO8601()
  scheduledAt: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(['ONLINE', 'IN_CLINIC'])
  @IsOptional()
  mode?: 'ONLINE' | 'IN_CLINIC';
}

export class UpdateNotesDto {
  @IsString()
  notes: string;
}

import { IsString, IsUUID, IsISO8601, IsOptional, IsEnum } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  slotId: string;

  @IsISO8601()
  date: string;

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

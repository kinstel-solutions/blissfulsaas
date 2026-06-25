import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------------------------------------
// Weekly Schedule DTOs
// ---------------------------------------------------------------------------

export class UpsertWeeklyScheduleItemDto {
  /** 0 = Sunday … 6 = Saturday */
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  /** "09:00" HH:mm (IST) */
  @IsString()
  startTime: string;

  /** "17:00" HH:mm (IST) */
  @IsString()
  endTime: string;

  @IsEnum(['ONLINE', 'IN_CLINIC'])
  mode: 'ONLINE' | 'IN_CLINIC';

  /** Set to false to mark the therapist as unavailable on this day+mode */
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpsertWeeklyScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertWeeklyScheduleItemDto)
  schedule: UpsertWeeklyScheduleItemDto[];
}

// ---------------------------------------------------------------------------
// Schedule Override DTOs
// ---------------------------------------------------------------------------

export class CreateOverrideDto {
  /** ISO date string, e.g. "2026-10-12" */
  @IsDateString()
  date: string;

  /** false = full day blocked; true = custom hours */
  @IsBoolean()
  isAvailable: boolean;

  /** Required when isAvailable = true */
  @IsString()
  @IsOptional()
  startTime?: string;

  /** Required when isAvailable = true */
  @IsString()
  @IsOptional()
  endTime?: string;

  /** null = override applies to all modes */
  @IsEnum(['ONLINE', 'IN_CLINIC'])
  @IsOptional()
  mode?: 'ONLINE' | 'IN_CLINIC';

  @IsString()
  @IsOptional()
  reason?: string;
}

export class DeleteOverrideDto {
  @IsUUID()
  id: string;
}

// ---------------------------------------------------------------------------
// Slot Generation Query DTO (used internally / by patient-facing endpoints)
// ---------------------------------------------------------------------------

export class GetSlotsQueryDto {
  /** ISO date string, e.g. "2026-10-14" */
  @IsDateString()
  date: string;

  @IsEnum(['ONLINE', 'IN_CLINIC'])
  @IsOptional()
  mode?: 'ONLINE' | 'IN_CLINIC';
}

// ---------------------------------------------------------------------------
// Legacy bulk-update DTO — kept for backward-compatibility with sessions module
// ---------------------------------------------------------------------------

export class CreateSlotDto {
  @IsInt()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsEnum(['ONLINE', 'IN_CLINIC'])
  @IsOptional()
  mode?: 'ONLINE' | 'IN_CLINIC';
}

export class BulkUpdateSlotsDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSlotDto)
  create?: CreateSlotDto[];

  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  delete?: string[];
}

import { IsArray, IsInt, IsString, IsOptional, IsEnum, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

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

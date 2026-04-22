import { IsString, IsNotEmpty, IsISO8601, IsOptional, IsEnum } from 'class-validator';

export enum ConsultationMode {
  ONLINE = 'ONLINE',
  IN_CLINIC = 'IN_CLINIC',
}

export class CreateOrderDto {
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

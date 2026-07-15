import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class UpdateIntakeDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  age?: string;

  @IsString()
  @IsOptional()
  pronouns?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  reasonForSeeking?: string;

  @IsString()
  @IsOptional()
  mentalHealthHistory?: string;

  @IsString()
  @IsOptional()
  currentMedications?: string;

  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;
}

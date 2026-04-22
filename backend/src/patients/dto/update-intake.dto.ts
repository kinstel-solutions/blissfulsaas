import { IsString, IsOptional, IsArray, IsBoolean, MinLength } from 'class-validator';

export class UpdateIntakeDto {
  @IsString()
  @MinLength(10)
  @IsOptional()
  reasonForSeeking?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  primaryConcerns?: string[];

  @IsString()
  @IsOptional()
  mentalHealthHistory?: string;

  @IsString()
  @IsOptional()
  currentMedications?: string;

  @IsBoolean()
  @IsOptional()
  previousTherapy?: boolean;

  @IsString()
  @MinLength(10)
  @IsOptional()
  therapyGoals?: string;

  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;
}

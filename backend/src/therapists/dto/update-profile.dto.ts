import { IsString, IsOptional, IsNumber, IsArray, IsUrl, Min, MaxLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTherapistProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  bio?: string;

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  yearsOfExperience?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  hourlyRate?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialities?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @ValidateIf(o => typeof o.videoUrl === 'string' && o.videoUrl.trim().length > 0)
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  clinicAddress?: string;

  @ValidateIf(o => typeof o.profileImageUrl === 'string' && o.profileImageUrl.trim().length > 0)
  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;
}

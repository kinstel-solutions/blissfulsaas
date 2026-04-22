import { IsString, IsOptional, IsNumber, IsArray, IsUrl, Min, MaxLength } from 'class-validator';

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

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  clinicAddress?: string;

  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;
}

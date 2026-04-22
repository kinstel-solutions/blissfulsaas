import { IsNumber, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator';

export class SubmitFeedbackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}

import { IsString, IsNumber } from 'class-validator';

export class UpdateReviewDto {
  @IsString()
  content?: string;

  @IsNumber()
  rating?: number;
}

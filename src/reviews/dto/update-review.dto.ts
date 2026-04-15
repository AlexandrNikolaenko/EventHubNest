import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    example: 'Great event!',
    description: 'Review content',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Rating from 1 to 5',
  })
  @IsNumber()
  @IsOptional()
  rating?: number;
}

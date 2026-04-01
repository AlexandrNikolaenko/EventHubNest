import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({
    example: 'Great event!',
    description: 'Review content',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    example: 5,
    description: 'Rating from 1 to 5',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  rating?: number;
}

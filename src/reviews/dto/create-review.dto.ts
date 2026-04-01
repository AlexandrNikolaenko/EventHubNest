import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'Great event!', description: 'Review content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 5,
    description: 'Rating from 1 to 5',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({ example: 1, description: 'Author ID' })
  @IsNumber()
  @IsNotEmpty()
  authorId: number;

  @ApiProperty({ example: 1, description: 'Post ID' })
  @IsNumber()
  @IsNotEmpty()
  postId: number;
}

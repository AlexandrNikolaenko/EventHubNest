import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  rating?: number;

  @IsNumber()
  @IsNotEmpty()
  authorId: number;

  @IsNumber()
  @IsNotEmpty()
  postId: number;
}

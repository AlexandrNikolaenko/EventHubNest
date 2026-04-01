import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Summer Event Post', description: 'Post title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Interesting event happening soon...',
    description: 'Post description',
  })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({ example: '2026-04-01T12:00:00Z', description: 'Post date' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Moscow, Russia', description: 'Event location' })
  @IsString()
  @IsNotEmpty()
  place: string;

  @ApiProperty({ example: '/images/event.jpg', description: 'Image URL' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ example: 1, description: 'Author ID' })
  @IsNumber()
  @IsNotEmpty()
  authorId: number;
}

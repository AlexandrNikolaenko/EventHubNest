import { IsString, IsNotEmpty, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  place: string;

  @Type(() => Number)
  @IsInt()
  authorId: number;

  @Type(() => Number)
  @IsInt()
  categoryId: number;
}

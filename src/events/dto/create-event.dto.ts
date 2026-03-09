import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  desc: string;

  @IsString()
  place: string;

  @IsDateString()
  date: string;

  @IsInt()
  categoryId: number;

  @IsArray()
  @IsEmail({}, { each: true })
  users: string[];
}

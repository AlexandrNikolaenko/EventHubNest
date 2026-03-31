import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsString()
  @IsNotEmpty()
  place: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsArray()
  @IsNotEmpty()
  @IsEmail({}, { each: true })
  users: string[];
}

import {
  IsArray,
  IsDateString,
  IsEmail,
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

  @IsArray()
  @IsNotEmpty()
  @IsEmail({}, { each: true })
  users: string[];
}

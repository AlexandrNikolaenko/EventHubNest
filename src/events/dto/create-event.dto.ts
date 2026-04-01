import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Концерт' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Описание события' })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({ example: 'Москва' })
  @IsString()
  @IsNotEmpty()
  place: string;

  @ApiProperty({ example: '2026-04-01T12:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: ['user@mail.com'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  @IsEmail({}, { each: true })
  users: string[];
}

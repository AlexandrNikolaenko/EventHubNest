import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    minLength: 4,
    description: 'User password',
  })
  @IsString()
  @MinLength(4)
  password: string;

  @ApiProperty({
    example: 'Alex',
    minLength: 2,
    description: 'User display name',
  })
  @IsString()
  @MinLength(2)
  name: string;
}

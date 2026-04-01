import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 'New event created',
    description: 'Notification message',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

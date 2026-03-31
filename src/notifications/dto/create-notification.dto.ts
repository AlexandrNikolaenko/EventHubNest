import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}

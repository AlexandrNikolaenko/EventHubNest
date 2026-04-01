import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({ example: true, description: 'Mark notification as read' })
  @IsBoolean()
  isRead?: boolean;
}

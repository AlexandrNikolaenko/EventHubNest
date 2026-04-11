import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  Sse,
  MessageEvent,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Observable } from 'rxjs';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('events')
  @ApiOperation({ summary: 'Subscribe to notification SSE stream' })
  @ApiQuery({
    name: 'userId',
    required: true,
    type: Number,
    description: 'User id',
  })
  @ApiOkResponse({
    description: 'SSE stream of notifications',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example: 'data: {"id":1,"message":"..."}\n\n',
        },
      },
    },
  })
  sse(@Query('userId', ParseIntPipe) userId: number): Observable<MessageEvent> {
    return this.notificationsService.getUserStream(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiCreatedResponse({
    description: 'Notification created',
    type: CreateNotificationDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid notification data' })
  @ApiInternalServerErrorResponse({ description: 'Internal error' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get notifications by user id' })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Notifications list',
    type: CreateNotificationDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'User not found or no notifications' })
  findAll(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.notificationsService.findAll(
      userId,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Notification data',
    type: CreateNotificationDto,
  })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification state' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: 200,
    description: 'Notification updated',
    type: UpdateNotificationDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiNoContentResponse({ description: 'Deleted successfully' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationsService.remove(id, userId);
  }
}

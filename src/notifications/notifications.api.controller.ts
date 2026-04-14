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
  UseGuards,
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
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';
import { UserRole } from '@prisma/client';

@ApiTags('Notifications')
@ApiCookieAuth('sAccessToken')
@UseGuards(AuthGuard, RolesGuard)
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
  sse(
    @CurrentUser() user: AuthUser,
    @Query('userId') _userId?: string,
  ): Observable<MessageEvent> {
    return this.notificationsService.getUserStream(user.id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
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
    @CurrentUser() user: AuthUser,
    @Query('userId') _userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.notificationsService.findAll(
      user.id,
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
    @CurrentUser() user: AuthUser,
    @Query('userId') _userId: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, user.id, dto, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiNoContentResponse({ description: 'Deleted successfully' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @Query('userId') _userId: string,
  ) {
    return this.notificationsService.remove(id, user.id, user.role);
  }
}

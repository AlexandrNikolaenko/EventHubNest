import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import express from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiProperty,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';

export class CreateEventRequestDto {
  @ApiProperty({ example: 1 })
  authorId!: number;

  @ApiProperty({ type: CreateEventDto })
  @ValidateNested()
  @Type(() => CreateEventDto)
  data!: CreateEventDto;
}

export class UpdateEventRequestDto {
  @ApiProperty({ example: 1 })
  authorId!: number;

  @ApiProperty({ type: UpdateEventDto })
  @ValidateNested()
  @Type(() => UpdateEventDto)
  dto!: UpdateEventDto;
}

@ApiTags('Events')
@ApiCookieAuth('sAccessToken')
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/events')
export class ApiEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventRequestDto })
  @ApiCreatedResponse({
    description: 'Event created successfully',
    type: CreateEventDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiInternalServerErrorResponse({ description: 'Internal error' })
  create(
    @Body() { data }: { authorId: number; data: CreateEventDto },
    @CurrentUser() user: AuthUser,
  ) {
    console.log(data);
    return this.eventsService.create(user.id, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get events list with pagination' })
  @ApiQuery({
    name: 'userId',
    required: true,
    type: Number,
    description: 'User id',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of events',
    type: CreateEventDto,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiInternalServerErrorResponse({ description: 'Internal error' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Res() res: express.Response,
  ) {
    const pageNum = page;
    const limitNum = limit > 50 ? 50 : limit; // ограничение на максимум 50 записей за запрос

    const data = await this.eventsService.findAll(user.id, pageNum, limitNum);

    // HATEOAS links
    const prevPage = pageNum > 1 ? pageNum - 1 : null;
    const nextPage = data.length === limitNum ? pageNum + 1 : null;

    const links: string[] = [];

    if (prevPage) {
      links.push(
        `</api/events?page=${prevPage}&limit=${limitNum}>; rel="prev"`,
      );
    }

    if (nextPage) {
      links.push(
        `</api/events?page=${nextPage}&limit=${limitNum}>; rel="next"`,
      );
    }

    if (links.length) {
      res.setHeader('Link', links.join(', '));
    }

    return res.json(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Event id' })
  @ApiResponse({
    status: 200,
    description: 'Event in detail',
    type: CreateEventDto,
  })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Event id' })
  @ApiBody({ type: UpdateEventRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Updated event',
    type: CreateEventDto,
  })
  @ApiNotFoundResponse({ description: 'Event not found' })
  @ApiBadRequestResponse({ description: 'Invalid payload or id' })
  update(
    @Param('id') id: string,
    @Body() { dto }: { authorId: number; dto: UpdateEventDto },
    @CurrentUser() user: AuthUser,
  ) {
    return this.eventsService.update(Number(id), user.id, dto, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Event id' })
  @ApiNoContentResponse({ description: 'Event deleted' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.eventsService.remove(Number(id), user.id, user.role);
  }
}

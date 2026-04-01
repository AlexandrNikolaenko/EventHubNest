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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import express from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('api/events')
export class ApiEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(
    @Body() { authorId, data }: { authorId: number; data: CreateEventDto },
  ) {
    console.log(data);
    return this.eventsService.create(authorId, data);
  }

  @Get()
  async findAll(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Res() res: express.Response,
  ) {
    const pageNum = page;
    const limitNum = limit > 50 ? 50 : limit; // ограничение на максимум 50 записей за запрос

    const data = await this.eventsService.findAll(userId, pageNum, limitNum);

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
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() { authorId, dto }: { authorId: number; dto: UpdateEventDto },
  ) {
    return this.eventsService.update(Number(id), authorId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(Number(id));
  }
}

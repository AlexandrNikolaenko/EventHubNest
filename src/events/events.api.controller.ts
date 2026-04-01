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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('api/events')
export class ApiEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(
    @Body() { authorId, data }: { authorId: number; data: CreateEventDto },
  ) {
    return this.eventsService.create(authorId, data);
  }

  @Get()
  findAll(@Query('userId', ParseIntPipe) userId: number) {
    return this.eventsService.findAll(userId);
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

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Render,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('api/events')
export class ApiEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(Number(id));
  }
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Render('main')
  main() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/main.css" />
    <script type="module" src="/scripts/api.js"></script>`,
      pageModuleScripts: ['main.js'],
      pageTemplates: [
        { name: 'templates/user' },
        { name: 'templates/active-user' },
        { name: 'templates/event-card' },
        { name: 'templates/event-table-row' },
      ],
    };
  }

  @Get(':id')
  @Render('event')
  event() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/event.css" />
    <script type="module" src="/scripts/api.js"></script>`,
      pageModuleScripts: ['event.js'],
      pageTemplates: [{ name: 'templates/user' }],
    };
  }
}

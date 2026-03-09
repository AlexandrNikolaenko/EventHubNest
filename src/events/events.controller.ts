import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Render,
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
    console.log('userId', userId);
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

@Controller('events')
export class EventsController {
  constructor() {}

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

  @Get('add')
  @Render('create-events')
  add() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/main.css" />
    <script type="module" src="/scripts/api.js"></script>`,
      pageModuleScripts: ['add-event.js'],
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

  @Get(':id/edit')
  @Render('edit-event')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  edit(@Param('id') id: string) {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/main.css" />
    <script type="module" src="/scripts/api.js"></script>`,
      pageModuleScripts: ['edit-event.js'],
      pageTemplates: [
        { name: 'templates/user' },
        { name: 'templates/active-user' },
        { name: 'templates/event-card' },
        { name: 'templates/event-table-row' },
      ],
    };
  }
}

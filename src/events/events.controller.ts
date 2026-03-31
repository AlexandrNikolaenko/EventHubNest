import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('events')
export class EventsController {
  constructor() {}

  @Get()
  @Render('main')
  main() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/main.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
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

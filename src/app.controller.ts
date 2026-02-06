import { Get, Controller, Render, Query } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  @Render('index')
  root(@Query('user') user: string) {
    const isGuest = user === 'guest';

    return {
      isGuest,
      extraHead: `<link rel="stylesheet" href="/styles/index.css" />
    <script type="module" src="/scripts/api.js"></script>`,
      pageScripts: [
        'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
      ],
      pageModuleScripts: ['animation.js'],
    };
  }

  @Get('/about')
  @Render('about')
  about() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/about.css" />
    <script type="module" src="/scripts/api.js"></script>`,
      pageScripts: [
        'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
      ],
      pageModuleScripts: ['animation.js'],
    };
  }

  @Get('/auth/login')
  @Render('login')
  login() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/login.css" />`,
      pageScripts: [
        '//cdnjs.cloudflare.com/ajax/libs/validate.js/0.13.1/validate.min.js',
      ],
      pageModuleScripts: ['api.js', 'login.js'],
    };
  }

  @Get('/auth/register')
  @Render('register')
  register() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/login.css" />`,
      pageScripts: [
        '//cdnjs.cloudflare.com/ajax/libs/validate.js/0.13.1/validate.min.js',
      ],
      pageModuleScripts: ['api.js', 'register.js'],
    };
  }

  @Get('/main')
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

  @Get('/event')
  @Render('event')
  event() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/event.css" />
    <script type="module" src="/scripts/api.js"></script>`,
      pageModuleScripts: ['event.js'],
      pageTemplates: [{ name: 'templates/user' }],
    };
  }

  @Get('/poster')
  @Render('poster')
  poster() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/poster.css" />
    <script type="module" src="/scripts/api.js"></script>
    <script type="module" src="/scripts/http-api.js"></script>`,
      pageModuleScripts: ['poster.js'],
      pageTemplates: [{ name: 'templates/post' }],
    };
  }

  @Get('/poster/event')
  @Render('poster-event')
  posterEvent() {
    return {
      extraHead: `<link rel="stylesheet" href="../../styles/poster.css" />
    <link rel="stylesheet" href="../../styles/poster-event.css" />
    <script type="module" src="../../scripts/api.js"></script>
    <script type="module" src="../../scripts/http-api.js"></script>`,
      pageModuleScripts: ['poster-event.js'],
      pageTemplates: [{ name: 'templates/post-event' }],
    };
  }
}

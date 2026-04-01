import { Get, Controller, Render, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
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

  @Get('/not-found')
  @Render('not-found')
  notFound() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/not-found.css" />
    <script type="module" src="/scripts/api.js"></script>`,
      pageScripts: [
        'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
      ],
      pageModuleScripts: ['animation.js'],
    };
  }
}

import { Controller, Get, Render } from '@nestjs/common';

@Controller('posts')
export class PostsController {
  @Get()
  @Render('poster')
  poster() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/poster.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
    <script type="module" src="/scripts/api.js"></script>
    <script type="module" src="/scripts/http-api.js"></script>`,
      pageModuleScripts: ['poster.js'],
      pageTemplates: [{ name: 'templates/post' }],
    };
  }

  @Get(':id')
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

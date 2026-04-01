import { Controller, Get, Render, Res, Param } from '@nestjs/common';
import express from 'express';

@Controller('posts')
export class PostsController {
  @Get()
  @Render('posts')
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
  @Render('post')
  posterEvent(@Param('id') id: string, @Res() res: express.Response) {
    const parsedId = Number(id);

    if (isNaN(parsedId)) {
      return res.redirect('/not-found');
    }

    return res.render('poster-event', {
      extraHead: `<link rel="stylesheet" href="../../styles/poster.css" />
    <link rel="stylesheet" href="../../styles/poster-event.css" />
    <script type="module" src="../../scripts/api.js"></script>
    <script type="module" src="../../scripts/http-api.js"></script>`,
      pageModuleScripts: ['poster-event.js'],
      pageTemplates: [{ name: 'templates/post-event' }],
    });
  }
}

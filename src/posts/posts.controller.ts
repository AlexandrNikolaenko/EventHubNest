import {
  Controller,
  Get,
  Render,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
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
  posterEvent(@Param('id') id: string) {
    const parsedId = Number(id);

    if (isNaN(parsedId)) {
      throw new NotFoundException();
    }

    return {
      extraHead: `<link rel="stylesheet" href="../../styles/poster.css" />
      <link rel="stylesheet" href="../../styles/poster-event.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
      <script type="module" src="../../scripts/api.js"></script>
      <script type="module" src="../../scripts/http-api.js"></script>`,
      pageModuleScripts: ['poster-event.js'],
      pageTemplates: [{ name: 'templates/post-event' }],
    };
  }
}

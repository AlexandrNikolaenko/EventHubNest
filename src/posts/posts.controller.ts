import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('api/posts')
export class ApiPostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}

@Controller('posts')
export class PostsController {
  @Get()
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

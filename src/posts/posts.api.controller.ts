import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Sse,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import express from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('api/posts')
export class ApiPostsController {
  constructor(private postsService: PostsService) {}

  @Sse('events')
  events(): Observable<MessageEvent> {
    return this.postsService.events$;
  }

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Res() res: express.Response,
  ) {
    const pageNum = page;
    const limitNum = limit > 50 ? 50 : limit; // ограничение на максимум 50 записей за запрос

    const data = await this.postsService.findAll(pageNum, limitNum);

    // HATEOAS links
    const prevPage = pageNum > 1 ? pageNum - 1 : null;
    const nextPage = data.length === limitNum ? pageNum + 1 : null;

    const links: string[] = [];

    if (prevPage) {
      links.push(`</api/posts?page=${prevPage}&limit=${limitNum}>; rel="prev"`);
    }

    if (nextPage) {
      links.push(`</api/posts?page=${nextPage}&limit=${limitNum}>; rel="next"`);
    }

    if (links.length) {
      res.setHeader('Link', links.join(', '));
    }

    return res.json(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(Number(id));
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

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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('api/posts')
export class ApiPostsController {
  constructor(private postsService: PostsService) {}

  @Sse('events')
  @ApiOperation({ summary: 'Subscribe to posts SSE events' })
  @ApiOkResponse({
    description: 'Stream of posts events',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example: 'data: {"id":1,"title":"..."}\n\n',
        },
      },
    },
  })
  events(): Observable<MessageEvent> {
    return this.postsService.events$;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiCreatedResponse({ description: 'Post created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get posts list with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of posts' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
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
  @ApiOperation({ summary: 'Get post by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Post data' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiBadRequestResponse({ description: 'Invalid payload or id' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'Post deleted' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}

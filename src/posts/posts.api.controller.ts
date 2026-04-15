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
  Header,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import type { Response } from 'express';
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
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';
import { UserRole } from '@prisma/client';
import { PositiveIntPipe } from 'src/common/pipes/positive-int';

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
  @ApiCookieAuth('sAccessToken')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiCreatedResponse({
    description: 'Post created successfully',
    type: CreatePostDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: AuthUser) {
    return this.postsService.create({ ...createPostDto, authorId: user.id });
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=3600, must-revalidate')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(5000)
  @ApiOperation({ summary: 'Get posts list with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of posts',
    type: CreatePostDto,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  async findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search = '',
    @Res({ passthrough: true }) res: Response,
  ) {
    const pageNum = page;
    const limitNum = limit > 50 ? 50 : limit; // ограничение на максимум 50 записей за запрос

    const data = await this.postsService.findAll(pageNum, limitNum, search);

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

    return data;
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=3600, must-revalidate')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(5000)
  @ApiOperation({ summary: 'Get post by id' })
  @ApiParam({ name: 'id', type: Number, description: 'id > 0' })
  @ApiResponse({ status: 200, description: 'Post data', type: CreatePostDto })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  findOne(@Param('id', PositiveIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiCookieAuth('sAccessToken')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update post by id' })
  @ApiParam({ name: 'id', type: Number, description: 'id > 0' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: 'Post updated',
    type: UpdatePostDto,
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiBadRequestResponse({ description: 'Invalid payload or id' })
  update(
    @Param('id', PositiveIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiCookieAuth('sAccessToken')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete post by id' })
  @ApiParam({ name: 'id', type: Number, description: 'id > 0' })
  @ApiNoContentResponse({ description: 'Post deleted' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  remove(@Param('id', PositiveIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}

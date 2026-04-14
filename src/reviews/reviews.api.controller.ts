import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
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
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';

@ApiTags('Reviews')
@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiCookieAuth('sAccessToken')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a review' })
  @ApiBody({ type: CreateReviewDto })
  @ApiCreatedResponse({ description: 'Review created', type: CreateReviewDto })
  @ApiBadRequestResponse({ description: 'Invalid review data' })
  @ApiInternalServerErrorResponse({ description: 'Internal error' })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthUser) {
    return this.reviewsService.create({ ...dto, authorId: user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'postId', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Review list',
    type: CreateReviewDto,
    isArray: true,
  })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('postId') postId?: string,
  ) {
    return this.reviewsService.findAll(
      Number(page),
      Number(limit),
      postId ? Number(postId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Review data',
    type: CreateReviewDto,
  })
  @ApiNotFoundResponse({ description: 'Review not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiCookieAuth('sAccessToken')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update review' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'userId', required: true, type: Number })
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({
    status: 200,
    description: 'Review updated',
    type: UpdateReviewDto,
  })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @Query('userId') _userId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.id, dto, user.role);
  }

  @Delete(':id')
  @ApiCookieAuth('sAccessToken')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete review' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiNoContentResponse({ description: 'Review deleted' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @Query('userId') _userId?: string,
  ) {
    return this.reviewsService.remove(id, user.id, user.role);
  }
}

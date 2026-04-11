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
} from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a review' })
  @ApiBody({ type: CreateReviewDto })
  @ApiCreatedResponse({ description: 'Review created', type: CreateReviewDto })
  @ApiBadRequestResponse({ description: 'Invalid review data' })
  @ApiInternalServerErrorResponse({ description: 'Internal error' })
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
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
    @Query('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete review' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiNoContentResponse({ description: 'Review deleted' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId?: string,
  ) {
    return this.reviewsService.remove(id, userId ? Number(userId) : undefined);
  }
}

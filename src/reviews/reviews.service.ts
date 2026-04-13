import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewsRepository } from './entities/review.repository';
import { UserRole } from '@prisma/client';

@Injectable()
export class ReviewsService {
  private repository: ReviewsRepository;
  constructor(private prisma: PrismaService) {
    this.repository = new ReviewsRepository(prisma);
  }

  async create(dto: CreateReviewDto) {
    return await this.repository.create(dto);
  }

  async findAll(page = 1, limit = 10, postId?: number) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 50);

    return await this.repository.findAll(
      (pageNum - 1) * limitNum,
      limitNum,
      postId,
    );
  }

  async findOne(id: number) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const review = await this.repository.findOne(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateReviewDto,
    role: UserRole = UserRole.USER,
  ) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const review = await this.repository.findOne(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return await this.repository.update(
      id,
      role === UserRole.ADMIN ? review.authorId : userId,
      dto,
    );
  }

  async remove(id: number, userId?: number, role: UserRole = UserRole.USER) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const review = await this.repository.findOne(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (role !== UserRole.ADMIN && userId && review.authorId !== userId) {
      throw new ForbiddenException('Author not found');
    }
    return await this.repository.remove(id);
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewsRepository } from './entities/review.repository';

@Injectable()
export class ReviewsService {
  private repository: ReviewsRepository;
  constructor(private prisma: PrismaService) {
    this.repository = new ReviewsRepository(prisma);
  }

  async create(dto: CreateReviewDto) {
    return await this.repository.create(dto);
  }

  async findAll() {
    return await this.repository.findAll();
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

  async update(id: number, userId: number, dto: UpdateReviewDto) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const review = await this.repository.findOne(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return await this.repository.update(id, userId, dto);
  }

  async remove(id: number) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const review = await this.repository.findOne(id);

    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return await this.repository.remove(id);
  }
}

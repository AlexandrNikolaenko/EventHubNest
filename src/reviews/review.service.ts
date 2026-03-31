import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewsRepository } from './entities/review.repository';

@Injectable()
export class ReviewService {
  private repository: ReviewsRepository;
  constructor(private prisma: PrismaService) {
    this.repository = new ReviewsRepository(prisma);
  }

  async create(dto: CreateReviewDto) {
    return this.repository.create(dto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    return this.repository.findOne(id);
  }

  async update(id: number, dto: UpdateReviewDto) {
    return this.repository.update(id, dto);
  }

  async remove(id: number) {
    return this.repository.remove(id);
  }
}

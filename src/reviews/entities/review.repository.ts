import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ForbiddenException } from '@nestjs/common';

export class ReviewsRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
    const author = await this.prisma.user.findUnique({
      where: { id: dto.authorId },
    });

    if (!author) {
      throw new ForbiddenException('Author not found');
    }

    await this.prisma.notification.create({
      data: {
        userId: dto.authorId,
        message: 'New review on your post',
      },
    });
    return await this.prisma.review.create({
      data: {
        content: dto.content,
        rating: dto.rating,
        authorId: dto.authorId,
        postId: dto.postId,
      },
      include: {
        author: true,
        post: true,
      },
    });
  }

  async findAll(skip = 0, take = 10, postId?: number) {
    return await this.prisma.review.findMany({
      where: postId ? { postId } : undefined,
      include: {
        author: true,
        post: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.review.findUnique({
      where: { id },
      include: {
        author: true,
        post: true,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateReviewDto) {
    const event = await this.prisma.review.findUnique({
      where: { id },
    });

    if (event && event.authorId !== userId) {
      throw new ForbiddenException('Author not found');
    }
    return await this.prisma.review.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return await this.prisma.review.delete({
      where: { id },
    });
  }
}

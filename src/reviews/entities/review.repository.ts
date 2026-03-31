import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

export class ReviewsRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
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

  async findAll() {
    return await this.prisma.review.findMany({
      include: {
        author: true,
        post: true,
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

  async update(id: number, dto: UpdateReviewDto) {
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

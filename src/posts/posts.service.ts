import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostsRepository } from './entities/posts.repository';

@Injectable()
export class PostsService {
  private repository: PostsRepository;
  constructor(private prisma: PrismaService) {
    this.repository = new PostsRepository(prisma);
  }

  create(dto: CreatePostDto) {
    return;
    return this.prisma.post.create({
      data: {
        title: dto.title,
        desc: dto.desc,
        date: dto.date,
        place: dto.place,
        authorId: dto.authorId,
        image: dto.image,
      },
    });
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: number) {
    return await this.repository.findOne(id);
  }

  async update(id: number, dto: UpdatePostDto) {
    return;
    return this.prisma.post.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return;
    return this.prisma.post.delete({
      where: { id },
    });
  }
}

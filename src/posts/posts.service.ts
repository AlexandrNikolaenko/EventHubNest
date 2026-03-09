import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostsRepository } from './entities/posts.repository';
import { interval, Subject } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class PostsService {
  private repository: PostsRepository;
  private eventSubject = new Subject<MessageEvent>();
  public events$ = this.eventSubject.asObservable();
  private lastCount = 0;
  private lastUpdatedAt: Date | null = null;
  constructor(private prisma: PrismaService) {
    this.repository = new PostsRepository(prisma);
    void this.init();
  }

  private async init() {
    const [count, latest] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    this.lastCount = count;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.lastUpdatedAt = latest?.updatedAt ?? null;

    interval(5000).subscribe(() => {
      void this.checkPosts();
    });
  }

  private async checkPosts(): Promise<void> {
    const [count, latest] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const updatedAt = latest?.updatedAt ?? null;

    if (count > this.lastCount) {
      this.eventSubject.next({
        data: { type: 'post_created' },
      });
    } else if (count < this.lastCount) {
      this.eventSubject.next({
        data: { type: 'post_deleted' },
      });
    } else if (
      updatedAt &&
      this.lastUpdatedAt &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updatedAt.getTime() !== this.lastUpdatedAt.getTime()
    ) {
      this.eventSubject.next({
        data: { type: 'post_updated' },
      });
    }

    this.lastCount = count;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.lastUpdatedAt = updatedAt;
  }

  emitPostUpdate(post: unknown) {
    this.eventSubject.next({
      data: {
        type: 'post_update',
        post,
      },
    });
  }

  async create(dto: CreatePostDto) {
    const post = await this.repository.create(dto);

    this.emitPostUpdate(post);
    return post;
    // return this.prisma.post.create({
    //   data: {
    //     title: dto.title,
    //     desc: dto.desc,
    //     date: dto.date,
    //     place: dto.place,
    //     authorId: dto.authorId,
    //     image: dto.image,
    //   },
    // });
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    return this.repository.findOne(id);
  }

  async update(id: number, dto: UpdatePostDto) {
    const post = await this.repository.update(id, dto);

    this.emitPostUpdate(post);
    return post;
    // return this.prisma.post.update({
    //   where: { id },
    //   data: dto,
    // });
  }

  async remove(id: number) {
    await this.repository.remove(id);
    this.eventSubject.next({
      data: {
        type: 'post_deleted',
        id,
      },
    });
    return;
    // return this.prisma.post.delete({
    //   where: { id },
    // });
  }
}

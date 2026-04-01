import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      updatedAt.getTime() !== this.lastUpdatedAt.getTime()
    ) {
      this.eventSubject.next({
        data: { type: 'post_updated' },
      });
    }

    this.lastCount = count;
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
  }

  async findAll(page: number, limit: number) {
    return this.repository.findAll(page, limit);
  }

  async findOne(id: number) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const post = await this.repository.findOne(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(id: number, dto: UpdatePostDto) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const post = await this.repository.update(id, dto);

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    this.emitPostUpdate(post);
    return post;
  }

  async remove(id: number) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const post = await this.repository.findOne(id);

    if (!post) {
      throw new NotFoundException('Event not found');
    }
    await this.repository.remove(id);
    this.eventSubject.next({
      data: {
        type: 'post_deleted',
        id,
      },
    });
    return;
  }
}

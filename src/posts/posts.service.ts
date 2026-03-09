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
  constructor(private prisma: PrismaService) {
    this.repository = new PostsRepository(prisma);
    void this.init();
  }

  private async init() {
    this.lastCount = await this.prisma.post.count();

    interval(5000).subscribe(() => {
      void this.checkPostsCount();
    });
  }

  private async checkPostsCount(): Promise<void> {
    const count = await this.prisma.post.count();

    if (count !== this.lastCount) {
      if (this.lastCount < count) {
        this.eventSubject.next({
          data: { type: 'post_created' },
        });
      } else {
        this.eventSubject.next({
          data: { type: 'post_deleted' },
        });
      }
      this.lastCount = count;
    }
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

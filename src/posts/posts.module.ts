import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiPostsController, PostsController } from './posts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PostsController, ApiPostsController],
  providers: [PostsService],
})
export class PostsModule {}

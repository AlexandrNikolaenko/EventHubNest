import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ApiPostsController } from './posts.api.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PostsController, ApiPostsController],
  providers: [PostsService],
})
export class PostsModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { EventsModule } from './events/events.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { NotificationModule } from './notifications/notifications.module';
import { ReviewModule } from './reviews/review.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    PostsModule,
    EventsModule,
    CategoriesModule,
    UsersModule,
    NotificationModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

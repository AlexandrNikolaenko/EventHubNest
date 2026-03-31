import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { EventsModule } from './events/events.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/review.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    PostsModule,
    EventsModule,
    CategoriesModule,
    UsersModule,
    NotificationsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

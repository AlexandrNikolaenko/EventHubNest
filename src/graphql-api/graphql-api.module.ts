import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { EventsModule } from 'src/events/events.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PostsModule } from 'src/posts/posts.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewsModule } from 'src/reviews/review.module';
import { UsersModule } from 'src/users/users.module';
import {
  EventFieldsResolver,
  GraphqlApiResolver,
  NotificationFieldsResolver,
  PostFieldsResolver,
  ReviewFieldsResolver,
  UserFieldsResolver,
} from './graphql-api.resolver';

@Module({
  imports: [
    AuthModule,
    EventsModule,
    NotificationsModule,
    PostsModule,
    PrismaModule,
    ReviewsModule,
    UsersModule,
  ],
  providers: [
    GraphqlApiResolver,
    UserFieldsResolver,
    PostFieldsResolver,
    EventFieldsResolver,
    ReviewFieldsResolver,
    NotificationFieldsResolver,
  ],
})
export class GraphqlApiModule {}

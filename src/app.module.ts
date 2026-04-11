import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/review.module';
import { GraphqlApiModule } from './graphql-api/graphql-api.module';
import { QueryComplexityPlugin } from './graphql-api/query-complexity.plugin';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
    }),
    AuthModule,
    PostsModule,
    EventsModule,
    UsersModule,
    NotificationsModule,
    ReviewsModule,
    GraphqlApiModule,
  ],
  controllers: [AppController],
  providers: [AppService, QueryComplexityPlugin],
})
export class AppModule {}

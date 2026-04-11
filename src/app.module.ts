import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
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
import { ElapsedTimeInterceptor } from './common/interceptors/elapsed-time.interceptor';
import { EtagInterceptor } from './common/interceptors/etag.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 5000,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
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
  providers: [
    AppService,
    QueryComplexityPlugin,
    {
      provide: APP_INTERCEPTOR,
      useClass: ElapsedTimeInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EtagInterceptor,
    },
  ],
})
export class AppModule {}

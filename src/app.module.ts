import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SuperTokensAuthModule } from './infrastructure/auth/supertokens-auth.module';
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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5000,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      context: ({ req, res }) => ({ req, res }),
    }),
    SuperTokensAuthModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionUri:
          configService.get<string>('SUPERTOKENS_CONNECTION_URI') ?? '',
        apiKey: configService.get<string>('SUPERTOKENS_API_KEY'),
        appName: configService.get<string>('APP_NAME') ?? 'My Nest App',
        apiDomain:
          configService.get<string>('API_DOMAIN') ?? 'http://localhost:3000',
        websiteDomain:
          configService.get<string>('WEBSITE_DOMAIN') ??
          'http://localhost:3000',
        apiBasePath: configService.get<string>('API_BASE_PATH') ?? '/api/auth',
        websiteBasePath:
          configService.get<string>('WEBSITE_BASE_PATH') ?? '/auth',
        cookieSecure:
          configService.get<string>('NODE_ENV') === 'production' ||
          (configService.get<string>('API_DOMAIN') ?? '').startsWith(
            'https://',
          ),
      }),
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

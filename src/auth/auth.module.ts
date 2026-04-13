import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController, ApiAuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AUTH_OPTIONS } from './auth.constants';
import {
  AuthModuleOptions,
  defaultAuthOptions,
} from './interfaces/auth-options.interface';
import { AuthTokenService } from './auth-token.service';
import { AuthMiddleware } from './auth.middleware';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuthController, ApiAuthController],
  providers: [
    AuthService,
    AuthTokenService,
    AuthMiddleware,
    AuthGuard,
    RolesGuard,
    {
      provide: AUTH_OPTIONS,
      useValue: defaultAuthOptions,
    },
  ],
  exports: [AuthService, AuthTokenService, AuthGuard, RolesGuard, AUTH_OPTIONS],
})
export class AuthModule implements NestModule {
  static register(options: Partial<AuthModuleOptions> = {}): DynamicModule {
    return {
      module: AuthModule,
      imports: [PrismaModule],
      controllers: [AuthController, ApiAuthController],
      providers: [
        AuthService,
        AuthTokenService,
        AuthMiddleware,
        AuthGuard,
        RolesGuard,
        {
          provide: AUTH_OPTIONS,
          useValue: { ...defaultAuthOptions, ...options },
        },
      ],
      exports: [
        AuthService,
        AuthTokenService,
        AuthGuard,
        RolesGuard,
        AUTH_OPTIONS,
      ],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}

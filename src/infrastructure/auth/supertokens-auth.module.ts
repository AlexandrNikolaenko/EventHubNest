import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  RequestMethod,
} from '@nestjs/common';
import { SUPERTOKENS_AUTH_OPTIONS } from './supertokens-auth.constants';
import type {
  SuperTokensAuthModuleAsyncOptions,
  SuperTokensAuthModuleOptions,
} from './supertokens-auth.interfaces';
import { SuperTokensAuthService } from './supertokens-auth.service';
import { SuperTokensExpressMiddleware } from './supertokens-express.middleware';

@Global()
@Module({})
export class SuperTokensAuthModule implements NestModule {
  static register(options: SuperTokensAuthModuleOptions): DynamicModule {
    return {
      module: SuperTokensAuthModule,
      providers: [
        {
          provide: SUPERTOKENS_AUTH_OPTIONS,
          useValue: options,
        },
        SuperTokensAuthService,
        SuperTokensExpressMiddleware,
      ],
      exports: [SuperTokensAuthService],
    };
  }

  static registerAsync(
    options: SuperTokensAuthModuleAsyncOptions,
  ): DynamicModule {
    const optionsProvider: Provider = {
      provide: SUPERTOKENS_AUTH_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };

    return {
      module: SuperTokensAuthModule,
      imports: options.imports as DynamicModule['imports'],
      providers: [
        optionsProvider,
        SuperTokensAuthService,
        SuperTokensExpressMiddleware,
      ],
      exports: [SuperTokensAuthService],
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SuperTokensExpressMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}

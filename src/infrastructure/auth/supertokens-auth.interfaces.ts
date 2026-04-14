import type { InjectionToken, OptionalFactoryDependency } from '@nestjs/common';

export interface SuperTokensAuthModuleOptions {
  connectionUri: string;
  apiKey?: string;
  appName: string;
  apiDomain: string;
  websiteDomain: string;
  apiBasePath: string;
  websiteBasePath: string;
  tenantId?: string;
  cookieSecure?: boolean;
}

export interface SuperTokensAuthModuleAsyncOptions {
  imports?: unknown[];
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useFactory: (
    ...args: any[]
  ) => SuperTokensAuthModuleOptions | Promise<SuperTokensAuthModuleOptions>;
}

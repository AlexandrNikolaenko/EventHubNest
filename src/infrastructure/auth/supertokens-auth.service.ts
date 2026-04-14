import { Inject, Injectable } from '@nestjs/common';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import supertokens from 'supertokens-node';
import type { RecipeUserId } from 'supertokens-node';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import { middleware } from 'supertokens-node/framework/express';
import { SUPERTOKENS_AUTH_OPTIONS } from './supertokens-auth.constants';
import type { SuperTokensAuthModuleOptions } from './supertokens-auth.interfaces';

@Injectable()
export class SuperTokensAuthService {
  private static initialized = false;
  private readonly requestHandler: RequestHandler;
  readonly tenantId: string;

  constructor(
    @Inject(SUPERTOKENS_AUTH_OPTIONS)
    private readonly options: SuperTokensAuthModuleOptions,
  ) {
    this.tenantId = options.tenantId ?? 'public';
    this.init();
    this.requestHandler = middleware();
  }

  handleRequest(req: Request, res: Response, next: NextFunction) {
    return this.requestHandler(req, res, next);
  }

  async signIn(email: string, password: string) {
    return EmailPassword.signIn(this.tenantId, email, password);
  }

  async signUp(email: string, password: string) {
    return EmailPassword.signUp(this.tenantId, email, password);
  }

  async createSession(
    req: Request,
    res: Response,
    recipeUserId: RecipeUserId,
    accessTokenPayload?: Record<string, unknown>,
    sessionData?: Record<string, unknown>,
  ) {
    return Session.createNewSession(
      req,
      res,
      this.tenantId,
      recipeUserId,
      accessTokenPayload,
      sessionData,
    );
  }

  async getSession(req: Request, res: Response, sessionRequired = false) {
    return Session.getSession(req, res, {
      sessionRequired,
      antiCsrfCheck: false,
    });
  }

  async getProviderUser(userId: string) {
    return supertokens.getUser(userId);
  }

  getCorsHeaders() {
    return supertokens.getAllCORSHeaders();
  }

  private init() {
    if (SuperTokensAuthService.initialized) {
      return;
    }

    if (!this.options.connectionUri) {
      throw new Error('SUPERTOKENS_CONNECTION_URI is required');
    }

    supertokens.init({
      framework: 'express',
      supertokens: {
        connectionURI: this.options.connectionUri,
        apiKey: this.options.apiKey,
      },
      appInfo: {
        appName: this.options.appName,
        apiDomain: this.options.apiDomain,
        websiteDomain: this.options.websiteDomain,
        apiBasePath: this.options.apiBasePath,
        websiteBasePath: this.options.websiteBasePath,
      },
      recipeList: [
        EmailPassword.init(),
        Session.init({
          antiCsrf: 'NONE',
          cookieSameSite: 'lax',
          cookieSecure: this.options.cookieSecure ?? false,
          getTokenTransferMethod: () => 'cookie',
        }),
      ],
    });

    SuperTokensAuthService.initialized = true;
  }
}

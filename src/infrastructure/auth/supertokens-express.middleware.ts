import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { SuperTokensAuthService } from './supertokens-auth.service';

@Injectable()
export class SuperTokensExpressMiddleware implements NestMiddleware {
  constructor(private readonly superTokensAuth: SuperTokensAuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    return this.superTokensAuth.handleRequest(req, res, next);
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { SuperTokensAuthService } from 'src/infrastructure/auth/supertokens-auth.service';
import { AuthService } from './auth.service';
import type { AuthRequest } from './interfaces/auth-request.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly superTokensAuth: SuperTokensAuthService,
  ) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await this.superTokensAuth.getSession(req, res, false);

      if (session) {
        req.session = session;
        req.authUser = await this.authService.resolveSessionUser(session);
        res.locals.currentUser = req.authUser;
      }
    } catch {
      req.session = undefined;
      req.authUser = undefined;
      res.locals.currentUser = undefined;
    }

    if (this.shouldRedirect(req)) {
      res.redirect('/auth/login');
      return;
    }

    next();
  }

  private shouldRedirect(req: AuthRequest) {
    return (
      req.method === 'GET' &&
      !req.authUser &&
      ['/events', '/profile'].some(
        (path) => req.path === path || req.path.startsWith(`${path}/`),
      )
    );
  }
}

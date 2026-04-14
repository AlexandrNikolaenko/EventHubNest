import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AUTH_OPTIONS } from './auth.constants';
import { AuthTokenService } from './auth-token.service';
import { AuthService } from './auth.service';
import type { AuthModuleOptions } from './interfaces/auth-options.interface';
import type { AuthRequest } from './interfaces/auth-request.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(AUTH_OPTIONS)
    private readonly options: AuthModuleOptions,
    private readonly authService: AuthService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const token = this.getCookie(req.headers.cookie, this.options.cookieName);

    if (token) {
      try {
        const payload = this.tokenService.verify(token);
        req.authUser = await this.authService.validateUser(payload.sub);
        res.locals.currentUser = req.authUser;
      } catch {
        res.clearCookie(this.options.cookieName);
      }
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

  private getCookie(header: string | undefined, name: string) {
    const cookies = header?.split(';') ?? [];
    const cookie = cookies.find((item) => item.trim().startsWith(`${name}=`));

    return cookie
      ? decodeURIComponent(cookie.split('=').slice(1).join('='))
      : '';
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.gto';
import {
  ApiCookieAuth,
  ApiExcludeController,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthTokenService } from './auth-token.service';
import { AUTH_OPTIONS } from './auth.constants';
import type { AuthModuleOptions } from './interfaces/auth-options.interface';
import { PublicAccess } from './decorators/public-access.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './interfaces/auth-user.interface';

@ApiTags('Auth')
@Controller('api/auth')
@PublicAccess()
export class ApiAuthController {
  constructor(
    @Inject(AUTH_OPTIONS)
    private readonly options: AuthModuleOptions,
    private readonly authService: AuthService,
    private readonly tokenService: AuthTokenService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Log in and set authentication cookie' })
  async login(
    @Body() createAuthDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(createAuthDto);
    this.setAuthCookie(response, result.userId);

    return result;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register and set authentication cookie' })
  async register(
    @Body() createAuthDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(createAuthDto);
    this.setAuthCookie(response, result.userId);

    return result;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear authentication cookie' })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(this.options.cookieName);
    return { ok: true };
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current session user' })
  me(@CurrentUser() user?: AuthUser) {
    return { user: user ?? null };
  }

  private setAuthCookie(response: Response, userId: number) {
    response.cookie(this.options.cookieName, this.tokenService.sign(userId), {
      httpOnly: true,
      maxAge: this.options.expiresInSeconds * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
}

@ApiExcludeController()
@Controller('auth')
@PublicAccess()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @Render('login')
  login() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/login.css" />`,
      pageScripts: [
        '//cdnjs.cloudflare.com/ajax/libs/validate.js/0.13.1/validate.min.js',
      ],
      pageModuleScripts: ['api.js', 'login.js'],
    };
  }

  @Get('register')
  @Render('register')
  register() {
    return {
      extraHead: `<link rel="stylesheet" href="/styles/login.css" />`,
      pageScripts: [
        '//cdnjs.cloudflare.com/ajax/libs/validate.js/0.13.1/validate.min.js',
      ],
      pageModuleScripts: ['api.js', 'register.js'],
    };
  }
}

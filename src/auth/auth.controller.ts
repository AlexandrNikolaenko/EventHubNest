import { Controller, Get, Post, Body, Render, Res, Req } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiExcludeController,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { SuperTokensAuthService } from 'src/infrastructure/auth/supertokens-auth.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { PublicAccess } from './decorators/public-access.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.gto';
import type { AuthUser } from './interfaces/auth-user.interface';

@ApiTags('Auth')
@Controller('api/auth')
@PublicAccess()
export class ApiAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly superTokensAuth: SuperTokensAuthService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'Log in through SuperTokens and set session cookies',
  })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() createAuthDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(createAuthDto, request, response);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register through SuperTokens and set session cookies',
  })
  @ApiBody({ type: RegisterDto })
  async register(
    @Body() createAuthDto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(createAuthDto, request, response);
  }

  @Post('logout')
  @ApiCookieAuth('sAccessToken')
  @ApiOperation({ summary: 'Revoke current SuperTokens session' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.superTokensAuth.getSession(request, res, false);
    await session?.revokeSession();

    return { ok: true };
  }

  @Get('me')
  @ApiCookieAuth('sAccessToken')
  @ApiOperation({ summary: 'Get current session user' })
  me(@CurrentUser() user?: AuthUser) {
    return { user: user ?? null };
  }
}

@ApiExcludeController()
@Controller('auth')
@PublicAccess()
export class AuthController {
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

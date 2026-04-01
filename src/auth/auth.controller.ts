import { Controller, Get, Post, Body, Render } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.gto';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('api/auth')
export class ApiAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() createAuthDto: LoginDto) {
    return this.authService.login(createAuthDto);
  }

  @Post('register')
  register(@Body() createAuthDto: RegisterDto) {
    return this.authService.register(createAuthDto);
  }
}

@ApiExcludeController()
@Controller('auth')
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

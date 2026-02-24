import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Render,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

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

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}

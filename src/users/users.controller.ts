import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  searchUsers(@Query('email') email: string) {
    return this.usersService.searchByEmail(email);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('api/users')
export class UsersApiController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  searchUsers(@Query('email') email: string) {
    return this.usersService.searchByEmail(email);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('api/users')
export class UsersApiController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search users by email' })
  @ApiQuery({
    name: 'email',
    required: true,
    type: String,
    description: 'Email fragment to search',
  })
  @ApiResponse({ status: 200, description: 'Matching users list' })
  @ApiBadRequestResponse({ description: 'Missing email query' })
  @ApiNotFoundResponse({ description: 'No users found' })
  searchUsers(@Query('email') email: string) {
    return this.usersService.searchByEmail(email);
  }
}

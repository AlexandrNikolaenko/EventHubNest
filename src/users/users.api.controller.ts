import {
  Controller,
  Get,
  Header,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  MaxFileSizeValidator,
  FileTypeValidator,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { StorageService } from 'src/storage/storage.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { type Express } from 'express';
import { UserRole } from '@prisma/client';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/interfaces/auth-user.interface';

@ApiTags('Users')
@ApiCookieAuth('sAccessToken')
@Controller('api/users')
export class UsersApiController {
  constructor(
    private readonly storageService: StorageService,
    private readonly usersService: UsersService,
  ) {}

  @Get('search')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Search users by email' })
  @ApiQuery({
    name: 'email',
    required: true,
    type: String,
    description: 'Email fragment to search',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching users list',
    type: Object,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Missing email query' })
  @ApiNotFoundResponse({ description: 'No users found' })
  searchUsers(@Query('email') email: string) {
    return this.usersService.searchByEmail(email);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, no-cache')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({
    status: 200,
    description: 'User data',
    type: Object,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    this.assertSelfOrAdmin(id, user);
    return this.usersService.findOne(id);
  }

  @Patch(':id/avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Invalid file' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseInterceptors(FileInterceptor('avatar'))
  @UseGuards(AuthGuard, RolesGuard)
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(png|jpe?g|webp)$/ }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ) {
    this.assertSelfOrAdmin(id, user);
    await this.usersService.findOne(id);
    const avatarUrl = await this.storageService.uploadUserAvatar(avatar, id);

    return this.usersService.updateAvatar(id, avatarUrl);
  }

  private assertSelfOrAdmin(id: number, user: AuthUser) {
    if (user.role !== UserRole.ADMIN && user.id !== id) {
      throw new ForbiddenException('Only owner or admin can access this user');
    }
  }
}

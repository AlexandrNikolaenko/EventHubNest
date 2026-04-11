import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersApiController } from './users.api.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsersApiController, UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

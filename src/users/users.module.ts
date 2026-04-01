import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersApiController } from './users.api.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersApiController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

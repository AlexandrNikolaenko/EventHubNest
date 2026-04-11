import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController, ApiAuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, ApiAuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

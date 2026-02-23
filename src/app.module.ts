import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { RegistrationModule } from './category/registration/registration.module';
import { PostModule } from './post/post.module';
import { EventModule } from './event/event.module';
import { RegistrationModule } from './registration/registration.module';

@Module({
  imports: [ConfigModule.forRoot(), UserModule, RegistrationModule, PostModule, EventModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

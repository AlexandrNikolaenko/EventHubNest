import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiEventsController } from './events.api.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EventsController, ApiEventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

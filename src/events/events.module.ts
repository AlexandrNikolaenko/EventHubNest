import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiEventsController, EventsController } from './events.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventsController, ApiEventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

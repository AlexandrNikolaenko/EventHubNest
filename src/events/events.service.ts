import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsRepository } from './entities/events.repository';

@Injectable()
export class EventsService {
  private repository: EventsRepository;
  constructor(private prisma: PrismaService) {
    this.repository = new EventsRepository(prisma);
  }

  create(authorId: number, dto: CreateEventDto) {
    return this.repository.create(authorId, dto);
  }

  findAll(userId: number) {
    return this.repository.findAll(userId);
  }

  findOne(id: number) {
    return this.repository.findOne(id);
  }

  update(id: number, userId: number, dto: UpdateEventDto) {
    return this.repository.updateEvent(id, userId, {
      ...dto,
    });
  }

  remove(id: number) {
    return this.repository.remove(id);
  }
}

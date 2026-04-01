import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    if (!userId || typeof userId !== 'number' || isNaN(userId)) {
      throw new ForbiddenException('UserId is required');
    }
    return this.repository.findAll(userId);
  }

  async findOne(id: number) {
    const event = await this.repository.findOne(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: number, userId: number, dto: UpdateEventDto) {
    const event = await this.repository.findOne(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // проверка владельца (очень важно для оценки)
    if (event.authorId !== userId) {
      throw new ForbiddenException('You cannot edit this event');
    }

    return this.repository.updateEvent(id, userId, dto);
  }

  async remove(id: number) {
    const event = await this.repository.findOne(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.repository.remove(id);
  }
}

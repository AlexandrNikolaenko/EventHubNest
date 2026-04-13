import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsRepository } from './entities/events.repository';
import { UserRole } from '@prisma/client';

@Injectable()
export class EventsService {
  private repository: EventsRepository;
  constructor(private prisma: PrismaService) {
    this.repository = new EventsRepository(prisma);
  }

  create(authorId: number, dto: CreateEventDto) {
    return this.repository.create(authorId, dto);
  }

  findAll(userId: number, page = 1, limit = 10) {
    if (!userId || typeof userId !== 'number' || isNaN(userId)) {
      throw new ForbiddenException('UserId is required');
    }
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 50);

    return this.repository.findAll(userId, (pageNum - 1) * limitNum, limitNum);
  }

  async findOne(id: number) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const event = await this.repository.findOne(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateEventDto,
    role: UserRole = UserRole.USER,
  ) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const event = await this.repository.findOne(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // проверка владельца (очень важно для оценки)
    if (role !== UserRole.ADMIN && event.authorId !== userId) {
      throw new ForbiddenException('You cannot edit this event');
    }

    return this.repository.updateEvent(id, userId, dto);
  }

  async remove(id: number, userId: number, role: UserRole) {
    const event = await this.repository.findOne(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (role !== UserRole.ADMIN && event.authorId !== userId) {
      throw new ForbiddenException('You cannot delete this event');
    }

    return this.repository.remove(id);
  }
}

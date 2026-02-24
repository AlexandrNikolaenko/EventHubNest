import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        desc: dto.desc,
        date: new Date(dto.date),
        place: dto.place,
        authorId: dto.authorId,
        categoryId: dto.categoryId,
      },
    });
  }

  findAll() {
    return this.prisma.event.findMany({
      include: {
        author: true,
        category: true,
        registrations: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        registrations: true,
      },
    });
  }

  update(id: number, dto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  remove(id: number) {
    return this.prisma.event.delete({
      where: { id },
    });
  }
}

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { ForbiddenException } from '@nestjs/common';

export class EventsRepository {
  constructor(private prisma: PrismaService) {}

  async create(authorId: number, dto: CreateEventDto) {
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          in: dto.users,
        },
      },
      select: {
        id: true,
      },
    });

    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        desc: dto.desc,
        place: dto.place,
        date: new Date(dto.date),
        author: {
          connect: {
            id: Number(authorId),
          },
        },
        category: {
          connect: {
            id: 2,
            // id: Number(dto.categoryId),
          },
        },

        registrations: {
          create: users.map((user) => ({
            userId: user.id,
          })),
        },
      },
      include: {
        author: true,
        category: true,
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return event;
  }

  async findAll(userId: number) {
    return this.prisma.event.findMany({
      where: {
        OR: [
          { authorId: userId },
          {
            registrations: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        author: true,
        category: true,
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async updateEvent(eventId: number, userId: number, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (event && event.authorId !== userId) {
      throw new ForbiddenException();
    }

    const users = await this.prisma.user.findMany({
      where: {
        email: {
          in: dto.users,
        },
      },
    });

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        title: dto.title,
        desc: dto.desc,
        place: dto.place,
        date: dto.date ? new Date(dto.date) : undefined,
        categoryId: dto.categoryId,

        registrations: {
          deleteMany: {},
          create: users.map((user) => ({
            userId: user.id,
          })),
        },
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.event.delete({
      where: { id },
    });
  }
}

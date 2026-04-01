import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

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

    if (users.length !== dto.users.length) {
      throw new NotFoundException('Some users not found');
    }

    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      throw new ForbiddenException('Author not found');
    }

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

        registrations: {
          create: users.map((user) => ({
            userId: user.id,
          })),
        },
      },
      include: {
        author: true,
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

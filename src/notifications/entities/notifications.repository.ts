import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { BadRequestException } from '@nestjs/common';

export class NotificationsRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    const users = await this.prisma.user.findMany({
      where: {
        id: dto.userId,
      },
    });

    if (users.length === 0) {
      throw new BadRequestException('User not found');
    }

    return await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        message: dto.message,
      },
    });
  }

  async findAll(userId: number, skip = 0, take = 10) {
    return await this.prisma.notification.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return await this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async update(id: number, dto: UpdateNotificationDto) {
    return await this.prisma.notification.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return await this.prisma.notification.delete({
      where: { id },
    });
  }
}

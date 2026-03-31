import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';

export class NotificationsRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        message: dto.message,
      },
    });
  }

  async findAll(userId?: number) {
    return await this.prisma.notification.findMany({
      where: userId ? { userId } : undefined,
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

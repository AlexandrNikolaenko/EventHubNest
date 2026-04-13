import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsRepository } from './entities/notifications.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { filter, Subject } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private notificationSubject = new Subject<MessageEvent>();
  public notifications$ = this.notificationSubject.asObservable();
  private repository: NotificationsRepository;
  constructor(private prisma: PrismaService) {
    this.repository = new NotificationsRepository(prisma);
  }

  getUserStream(userId: number) {
    return this.notifications$.pipe(
      filter((event) => {
        const data = event.data as {
          type: string;
          notification: { userId: number };
        };

        return data.notification.userId === userId;
      }),
    );
  }

  async create(dto: CreateNotificationDto) {
    const notification = await this.repository.create(dto);

    this.notificationSubject.next({
      data: {
        type: 'notification',
        notification,
      },
    });
    return notification;
  }

  async findAll(userId: number, page = 1, limit = 10) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 50);

    return this.repository.findAll(userId, (pageNum - 1) * limitNum, limitNum);
  }

  async findOne(id: number) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Id should be integer');
    }
    const notification = await this.repository.findOne(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.repository.findOne(id);
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateNotificationDto,
    role: UserRole = UserRole.USER,
  ) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (role !== UserRole.ADMIN && notification.userId !== userId) {
      throw new ForbiddenException('Author not found');
    }
    return this.repository.update(id, dto);
  }

  async remove(id: number, userId: number, role: UserRole = UserRole.USER) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (role !== UserRole.ADMIN && notification.userId !== userId) {
      throw new ForbiddenException('Author not found');
    }

    return this.repository.remove(id);
  }
}

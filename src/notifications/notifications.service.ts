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

  async findAll(userId: number) {
    return this.repository.findAll(userId);
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

  async update(id: number, userId: number, dto: UpdateNotificationDto) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Author not found');
    }
    return this.repository.update(id, dto);
  }

  async remove(id: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Author not found');
    }

    return this.repository.remove(id);
  }
}

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

export class EventsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEventDto) {
    return await this.prisma.event.create({
      data,
    });
  }

  async findAll() {
    return await this.prisma.event.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.event.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateEventDto) {
    return await this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return await this.prisma.event.delete({
      where: { id },
    });
  }
}

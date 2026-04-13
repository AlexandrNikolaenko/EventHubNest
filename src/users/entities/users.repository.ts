import { PrismaService } from 'src/prisma/prisma.service';

export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });
  }

  async findAll(email: string) {
    return this.prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive', // поиск без учета регистра
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
      take: 10, // лимит для autocomplete
    });
  }

  async updateAvatar(id: number, avatar: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatar },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });
  }
}

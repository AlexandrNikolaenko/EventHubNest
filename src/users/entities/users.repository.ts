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
      },
      take: 10, // лимит для autocomplete
    });
  }
}

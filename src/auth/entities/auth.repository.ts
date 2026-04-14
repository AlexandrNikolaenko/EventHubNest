import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.gto';

export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: RegisterDto & { supertokensId?: string }) {
    return await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        supertokensId: data.supertokensId,
      },
    });
  }

  async findOne(email: LoginDto['email']) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findBySupertokensId(supertokensId: string) {
    return await this.prisma.user.findUnique({
      where: { supertokensId },
    });
  }

  async linkSupertokensUser(id: number, supertokensId: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { supertokensId },
    });
  }
}

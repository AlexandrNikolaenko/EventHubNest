import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.gto';
// import { UpdatePostDto } from '../dto/update-post.dto';

export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: RegisterDto) {
    return await this.prisma.user.create({
      data,
    });
  }

  async findOne(email: LoginDto['email']) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
}

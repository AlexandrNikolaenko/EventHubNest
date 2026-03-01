import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthRepository } from './entities/auth.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.gto';

@Injectable()
export class AuthService {
  private authRepository: AuthRepository;
  constructor(private prisma: PrismaService) {
    this.authRepository = new AuthRepository(prisma);
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findOne(dto.email);

    if (!user) {
      throw new NotFoundException({
        type: 'email',
        message: 'Пользователя с такой почтой не существует',
      });
    }

    if (user.password !== dto.password) {
      throw new UnauthorizedException({
        type: 'password',
        message: 'Неверный пароль',
      });
    }

    return { userId: user.id };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.authRepository.findOne(dto.email);

    if (existingUser) {
      throw new BadRequestException({
        type: 'email',
        message: 'Пользователь с такой почтой уже существует',
      });
    }

    const user = await this.authRepository.create(dto);

    return { userId: user.id };
  }
}

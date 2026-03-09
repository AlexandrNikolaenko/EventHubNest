import { Injectable } from '@nestjs/common';
import { UsersRepository } from './entities/users.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  private repository: UsersRepository;
  constructor(private prisma: PrismaService) {
    this.repository = new UsersRepository(prisma);
  }

  async searchByEmail(email: string) {
    return this.repository.findAll(email);
  }
}

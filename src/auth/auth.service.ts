/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import type { Request, Response } from 'express';
import type { User as SuperTokensUser } from 'supertokens-node/lib/build/types';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { PrismaService } from 'src/prisma/prisma.service';
import { SuperTokensAuthService } from 'src/infrastructure/auth/supertokens-auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.gto';
import { AuthRepository } from './entities/auth.repository';

@Injectable()
export class AuthService {
  private authRepository: AuthRepository;

  constructor(
    private prisma: PrismaService,
    private readonly superTokensAuth: SuperTokensAuthService,
  ) {
    this.authRepository = new AuthRepository(prisma);
  }

  async login(dto: LoginDto, req: Request, res: Response) {
    let providerResult = await this.superTokensAuth.signIn(
      dto.email,
      dto.password,
    );

    if (providerResult.status === 'WRONG_CREDENTIALS_ERROR') {
      providerResult = await this.tryMigrateLegacyUser(dto);
    }

    if (providerResult.status !== 'OK') {
      throw new UnauthorizedException({
        type: 'password',
        message: 'Неверный пароль',
      });
    }

    const user = await this.syncProviderUser(providerResult.user, dto.password);

    await this.superTokensAuth.createSession(
      req,
      res,
      providerResult.recipeUserId,
      {
        localUserId: user.id,
        role: user.role,
      },
    );

    return {
      userId: user.id,
      user: this.toAuthUser(user),
    };
  }

  async register(dto: RegisterDto, req: Request, res: Response) {
    const existingUser = await this.authRepository.findOne(dto.email);

    if (existingUser) {
      throw new BadRequestException({
        type: 'email',
        message:
          'Пользователь с такой почтой уже существует. Пожалуйста, войдите или используйте другую почту для регистрации.',
      });
    }

    const providerResult = await this.superTokensAuth.signUp(
      dto.email,
      dto.password,
    );

    if (providerResult.status === 'EMAIL_ALREADY_EXISTS_ERROR') {
      throw new BadRequestException({
        type: 'email',
        message:
          'Пользователь с такой почтой уже существует. Пожалуйста, войдите или используйте другую почту для регистрации.',
      });
    }

    const user = await this.authRepository.create({
      ...dto,
      supertokensId: providerResult.user.id,
    });

    await this.superTokensAuth.createSession(
      req,
      res,
      providerResult.recipeUserId,
      {
        localUserId: user.id,
        role: user.role,
      },
    );

    return {
      userId: user.id,
      user: this.toAuthUser(user),
    };
  }

  async validateUser(id: number) {
    const user = await this.authRepository.findById(id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.toAuthUser(user);
  }

  async resolveSessionUser(session: SessionContainer) {
    const payload = session.getAccessTokenPayload() as {
      localUserId?: number;
    };

    if (payload.localUserId) {
      try {
        return await this.validateUser(payload.localUserId);
      } catch {
        // The local profile can be removed while the SuperTokens session remains valid.
      }
    }

    const providerUserId = session.getUserId();
    let user = await this.authRepository.findBySupertokensId(providerUserId);

    if (!user) {
      const providerUser =
        await this.superTokensAuth.getProviderUser(providerUserId);

      if (!providerUser) {
        throw new UnauthorizedException('User not found');
      }

      user = await this.syncProviderUser(providerUser);
    }

    await session.mergeIntoAccessTokenPayload({
      localUserId: user.id,
      role: user.role,
    });

    return this.toAuthUser(user);
  }

  private async tryMigrateLegacyUser(dto: LoginDto) {
    const legacyUser = await this.authRepository.findOne(dto.email);

    if (!legacyUser) {
      throw new NotFoundException({
        type: 'email',
        message: 'Пользователь с такой почтой не существует',
      });
    }

    if (legacyUser.supertokensId || legacyUser.password !== dto.password) {
      throw new UnauthorizedException({
        type: 'password',
        message: 'Неверный пароль',
      });
    }

    const signUpResult = await this.superTokensAuth.signUp(
      dto.email,
      dto.password,
    );

    if (signUpResult.status !== 'OK') {
      throw new UnauthorizedException({
        type: 'password',
        message: 'Неверный пароль',
      });
    }

    await this.authRepository.linkSupertokensUser(
      legacyUser.id,
      signUpResult.user.id,
    );

    return signUpResult;
  }

  private async syncProviderUser(
    providerUser: SuperTokensUser,
    password = '',
  ): Promise<{
    id: number;
    email: string;
    supertokensId: string | null;
    name: string;
    password: string;
    avatar: string;
    role: UserRole;
  }> {
    const email = this.extractEmail(providerUser);
    const existingByProvider = await this.authRepository.findBySupertokensId(
      providerUser.id,
    );

    if (existingByProvider) {
      return existingByProvider;
    }

    const existingByEmail = await this.authRepository.findOne(email);

    if (existingByEmail) {
      if (!existingByEmail.supertokensId) {
        return this.authRepository.linkSupertokensUser(
          existingByEmail.id,
          providerUser.id,
        );
      }

      return existingByEmail;
    }

    return this.authRepository.create({
      email,
      password: password || `supertokens:${providerUser.id}`,
      name: this.nameFromEmail(email),
      supertokensId: providerUser.id,
    });
  }

  private extractEmail(providerUser: SuperTokensUser) {
    const email = providerUser.emails[0];

    if (!email) {
      throw new UnauthorizedException('SuperTokens user has no email');
    }

    return email;
  }

  private nameFromEmail(email: string) {
    return email.split('@')[0] || 'User';
  }

  private toAuthUser(user: {
    avatar: string;
    email: string;
    id: number;
    name: string;
    role: UserRole;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    };
  }
}

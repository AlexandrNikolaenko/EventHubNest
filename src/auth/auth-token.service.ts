import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AUTH_OPTIONS } from './auth.constants';
import type { AuthModuleOptions } from './interfaces/auth-options.interface';

interface TokenPayload {
  exp: number;
  sub: number;
}

@Injectable()
export class AuthTokenService {
  constructor(
    @Inject(AUTH_OPTIONS)
    private readonly options: AuthModuleOptions,
  ) {}

  sign(userId: number) {
    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const payload = this.encode({
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + this.options.expiresInSeconds,
    });
    const signature = this.createSignature(`${header}.${payload}`);

    return `${header}.${payload}.${signature}`;
  }

  verify(token?: string): TokenPayload {
    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      throw new UnauthorizedException('Authentication token is invalid');
    }

    const expectedSignature = this.createSignature(`${header}.${payload}`);
    if (!this.safeEqual(signature, expectedSignature)) {
      throw new UnauthorizedException('Authentication token is invalid');
    }

    const data = JSON.parse(this.decode(payload)) as TokenPayload;
    if (!data.sub || !data.exp || data.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Authentication token is expired');
    }

    return data;
  }

  private createSignature(value: string) {
    return createHmac('sha256', this.options.jwtSecret)
      .update(value)
      .digest('base64url');
  }

  private encode(value: unknown) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private decode(value: string) {
    return Buffer.from(value, 'base64url').toString('utf8');
  }

  private safeEqual(value: string, expected: string) {
    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);

    return (
      valueBuffer.length === expectedBuffer.length &&
      timingSafeEqual(valueBuffer, expectedBuffer)
    );
  }
}

import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
}

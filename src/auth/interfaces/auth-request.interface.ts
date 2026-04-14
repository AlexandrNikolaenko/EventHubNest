import { Request } from 'express';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { AuthUser } from './auth-user.interface';

export interface AuthRequest extends Request {
  authUser?: AuthUser;
  session?: SessionContainer;
}

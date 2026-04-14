export interface AuthModuleOptions {
  cookieName: string;
  expiresInSeconds: number;
  jwtSecret: string;
}

export const defaultAuthOptions: AuthModuleOptions = {
  cookieName: 'accessToken',
  expiresInSeconds: 60 * 60 * 24 * 7,
  jwtSecret: 'dev-secret-change-me',
};

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { engine } from 'express-handlebars';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exeption.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { errorHandler } from 'supertokens-node/framework/express';
import { SuperTokensAuthService } from './infrastructure/auth/supertokens-auth.service';
import { AuthService } from './auth/auth.service';
import { UserRole } from '@prisma/client';
import type { NextFunction, Response } from 'express';
import type { AuthRequest } from './auth/interfaces/auth-request.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const superTokensAuth = app.get(SuperTokensAuthService);
  const authService = app.get(AuthService);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    credentials: true,
    origin: configService.get('CORS_ORIGIN') ?? true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'If-None-Match',
      ...superTokensAuth.getCorsHeaders(),
    ],
    exposedHeaders: ['ETag', 'X-Elapsed-Time', 'Link', 'front-token'],
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      layoutsDir: join(__dirname, '..', 'views', 'layouts'),
      partialsDir: join(__dirname, '..', 'views', 'partials'),
      defaultLayout: 'main',
    }),
  );

  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.useStaticAssets(join(__dirname, '..', 'public'));

  const requireAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const session = await superTokensAuth.getSession(req, res, false);

      if (!session) {
        return rejectUnauthenticated(req, res);
      }

      req.session = session;
      req.authUser = await authService.resolveSessionUser(session);
      res.locals.currentUser = req.authUser;

      if (req.authUser.role !== UserRole.ADMIN) {
        return rejectForbidden(req, res);
      }

      next();
    } catch {
      return rejectUnauthenticated(req, res);
    }
  };

  app.use('/graphql', requireAdmin);
  app.use('/api/docs', requireAdmin);
  app.use('/api/docs-json', requireAdmin);
  app.use('/api/docs-yaml', requireAdmin);

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('Events & Posts API')
    .setVersion('1.0')
    .addCookieAuth('sAccessToken')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);
  app.use(errorHandler());

  await app.listen(configService.get('PORT') ?? 3000);
}

function rejectUnauthenticated(req: AuthRequest, res: Response) {
  if (req.method === 'GET' && req.accepts('html')) {
    res.redirect('/auth/login');
    return;
  }

  res.status(401).json({ message: 'Authentication required' });
}

function rejectForbidden(req: AuthRequest, res: Response) {
  if (req.method === 'GET' && req.accepts('html')) {
    res.status(403).send('Admin access required');
    return;
  }

  res.status(403).json({ message: 'Admin access required' });
}

void bootstrap();

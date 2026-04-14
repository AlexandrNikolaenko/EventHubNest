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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const superTokensAuth = app.get(SuperTokensAuthService);

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
void bootstrap();

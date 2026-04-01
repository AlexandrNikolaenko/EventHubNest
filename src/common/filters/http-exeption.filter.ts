import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Определяем, ожидает ли клиент HTML или JSON
    const wantsHtml = request.headers.accept?.includes('text/html');

    // Обработка 404 для веб-страниц
    if (exception instanceof NotFoundException && wantsHtml) {
      return response.redirect('/not-found');
    }

    // Если это стандартная ошибка Nest (400, 403, 500)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      return response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
    }

    // Любая другая ошибка (например Prisma)
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}

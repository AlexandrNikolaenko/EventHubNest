import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';
import { performance } from 'node:perf_hooks';

export type RequestWithTiming = Request & {
  serverStartedAt?: number;
};

@Injectable()
export class ElapsedTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ElapsedTimeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = performance.now();
    const request = this.getRequest(context) as RequestWithTiming | undefined;

    if (request) {
      request.serverStartedAt = startedAt;
    }

    return next.handle().pipe(
      map((data: unknown) => {
        const elapsed = Number((performance.now() - startedAt).toFixed(2));
        const response = this.getResponse(context);

        if (response && !response.headersSent) {
          response.setHeader('X-Elapsed-Time', `${elapsed}ms`);
        }

        this.logger.log(
          `${context.getType<string>()} ${request?.method ?? 'resolver'} ${
            request?.originalUrl ?? context.getHandler().name
          } ${elapsed}ms`,
        );

        if (this.shouldExposeToTemplate(context, request, data)) {
          return {
            ...(data as Record<string, unknown>),
            serverElapsedTime: `${elapsed} ms`,
          };
        }

        return data;
      }),
    );
  }

  private shouldExposeToTemplate(
    context: ExecutionContext,
    request: Request | undefined,
    data: unknown,
  ) {
    return (
      context.getType<string>() === 'http' &&
      request?.method === 'GET' &&
      !request.originalUrl.startsWith('/api') &&
      !request.originalUrl.startsWith('/graphql') &&
      data !== null &&
      typeof data === 'object' &&
      !Array.isArray(data)
    );
  }

  private getRequest(context: ExecutionContext): Request | undefined {
    if (context.getType<string>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req as
        | Request
        | undefined;
    }

    return context.switchToHttp().getRequest<Request>();
  }

  private getResponse(context: ExecutionContext): Response | undefined {
    if (context.getType<string>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().res as
        | Response
        | undefined;
    }

    return context.switchToHttp().getResponse<Response>();
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { Request, Response } from 'express';
import { EMPTY, Observable, mergeMap, of } from 'rxjs';
import { RequestWithTiming } from './elapsed-time.interceptor';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<string>() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    if (!this.shouldHandle(request)) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap((data: unknown) => {
        if (data === undefined || response.headersSent) {
          return of(data);
        }

        const etag = this.createEtag(data);
        response.setHeader('ETag', etag);

        if (this.hasMatchingEtag(request, etag)) {
          this.setElapsedHeader(request, response);
          response.status(304).end();
          return EMPTY;
        }

        return of(data);
      }),
    );
  }

  private shouldHandle(request: Request) {
    return (
      request.method === 'GET' &&
      request.originalUrl.startsWith('/api/') &&
      !String(request.headers.accept ?? '').includes('text/event-stream')
    );
  }

  private createEtag(data: unknown) {
    const payload = JSON.stringify(data);
    const hash = createHash('sha1').update(payload).digest('base64url');

    return `W/"${hash}"`;
  }

  private hasMatchingEtag(request: Request, etag: string) {
    const value = request.headers['if-none-match'];
    const candidates = Array.isArray(value) ? value : value?.split(',') ?? [];

    return candidates.some((candidate) => candidate.trim() === etag);
  }

  private setElapsedHeader(request: Request, response: Response) {
    const startedAt = (request as RequestWithTiming).serverStartedAt;

    if (startedAt && !response.headersSent) {
      const elapsed = Number((performance.now() - startedAt).toFixed(2));
      response.setHeader('X-Elapsed-Time', `${elapsed}ms`);
    }
  }
}

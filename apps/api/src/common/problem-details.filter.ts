import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { DomainError } from './errors';
import { correlationId } from './correlation';

interface ProblemBody {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  correlationId?: string;
  [key: string]: unknown;
}

/**
 * Renders every unhandled error as RFC 7807 `application/problem+json`, so
 * clients get one predictable shape regardless of where the error originated.
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const problem = this.toProblem(exception, req.url);

    if (problem.status >= 500) {
      this.logger.error(
        `${problem.code} ${req.method} ${req.url} cid=${problem.correlationId ?? '-'}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(problem.status).type('application/problem+json').json(problem);
  }

  private toProblem(exception: unknown, instance: string): ProblemBody {
    const base = { instance, correlationId: correlationId() };

    if (exception instanceof DomainError) {
      return {
        type: `https://caroni.dev/problems/${exception.code}`,
        title: titleFor(exception.status),
        status: exception.status,
        detail: exception.message,
        code: exception.code,
        ...exception.extensions,
        ...base,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const detail =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] }).message ?? exception.message);
      return {
        type: `https://caroni.dev/problems/http-${status}`,
        title: titleFor(status),
        status,
        detail: Array.isArray(detail) ? detail.join(', ') : detail,
        code: 'http_error',
        ...base,
      };
    }

    return {
      type: 'https://caroni.dev/problems/internal_error',
      title: titleFor(500),
      status: 500,
      detail: 'An unexpected error occurred',
      code: 'internal_error',
      ...base,
    };
  }
}

function titleFor(status: number): string {
  return (
    {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    }[status] ?? 'Error'
  );
}

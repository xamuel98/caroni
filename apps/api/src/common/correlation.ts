import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const store = new AsyncLocalStorage<{ correlationId: string }>();

export const CORRELATION_HEADER = 'x-correlation-id';

/**
 * Propagates an `X-Correlation-Id` (inbound or generated) through the request
 * lifecycle so every log line and error response can be tied back to a call.
 */
export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const inbound = req.header(CORRELATION_HEADER);
  const correlationId = inbound && inbound.length <= 128 ? inbound : randomUUID();
  res.setHeader(CORRELATION_HEADER, correlationId);
  store.run({ correlationId }, () => next());
}

export function correlationId(): string | undefined {
  return store.getStore()?.correlationId;
}

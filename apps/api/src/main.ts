import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { correlationMiddleware } from './common/correlation';
import { ProblemDetailsFilter } from './common/problem-details.filter';
import type { Env } from './config/env';

// Load .env before Nest boots so process-level flags — notably the dev TLS
// opt-out for a self-signed local IdP — apply before the first outbound call.
// Node reads NODE_TLS_REJECT_UNAUTHORIZED when a TLS connection is opened, so it
// must be present before any fetch; loading it here removes any ordering doubt.
if (process.env.NODE_ENV !== 'production') {
  try {
    process.loadEnvFile?.();
  } catch {
    // .env is optional (e.g. CI)
  }
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    logger.warn('TLS certificate verification is DISABLED (dev only) — do not use in production');
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.use(correlationMiddleware);
  app.use(helmet());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    credentials: true,
  });
  app.useGlobalFilters(new ProblemDetailsFilter());
  app.enableShutdownHooks();

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  logger.log(`caroni-api listening on :${port}`);
}

void bootstrap();

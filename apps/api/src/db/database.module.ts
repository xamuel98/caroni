import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import type { Env } from '../config/env';

export const PG_POOL = Symbol('PG_POOL');

/** Provides a Postgres pool when `DATABASE_URL` is configured, else `null`. */
@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): Pool | null => {
        const url = config.get('DATABASE_URL', { infer: true });
        if (!url) return null;
        return new Pool({
          connectionString: url,
          max: 10,
          // Bound every acquisition and query so a stalled database can never
          // hang a request (or a readiness probe) indefinitely.
          connectionTimeoutMillis: 2_000,
          idleTimeoutMillis: 30_000,
          statement_timeout: 1_500,
          query_timeout: 1_500,
        });
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}

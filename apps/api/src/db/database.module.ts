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
        return url ? new Pool({ connectionString: url, max: 10 }) : null;
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}

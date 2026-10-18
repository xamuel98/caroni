import { Module } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../db/database.module';
import { DECISION_LOG_STORE, InMemoryDecisionLogStore } from './decision-log.store';
import { PolicyService } from './policy.service';
import { PostgresDecisionLogStore } from './postgres-decision-log.store';

@Module({
  providers: [
    PolicyService,
    {
      provide: DECISION_LOG_STORE,
      inject: [PG_POOL],
      useFactory: (pool: Pool | null) =>
        pool ? new PostgresDecisionLogStore(pool) : new InMemoryDecisionLogStore(),
    },
  ],
  exports: [PolicyService, DECISION_LOG_STORE],
})
export class AuthorizationModule {}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Pool } from 'pg';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AuthorizationGuard } from '../authorization/authorization.guard';
import type { Env } from '../config/env';
import { PG_POOL } from '../db/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OidcService } from './oidc.service';
import { PostgresSessionStore } from './postgres-session.store';
import { InMemorySessionStore, SESSION_STORE } from './session.store';
import { SessionController } from './session.controller';

@Module({
  imports: [AuthorizationModule],
  controllers: [AuthController, SessionController],
  providers: [
    AuthService,
    OidcService,
    AuthorizationGuard,
    {
      provide: SESSION_STORE,
      inject: [ConfigService, PG_POOL],
      useFactory: (config: ConfigService<Env, true>, pool: Pool | null) =>
        pool ? new PostgresSessionStore(pool) : new InMemorySessionStore(),
    },
  ],
  exports: [AuthService, AuthorizationGuard, SESSION_STORE],
})
export class AuthModule {}

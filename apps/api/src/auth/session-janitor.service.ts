import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { SESSION_STORE, type SessionStore } from './session.store';

/**
 * Periodically deletes expired rows so the session table doesn't grow with
 * login volume (expiry is still enforced on read; this is housekeeping).
 */
@Injectable()
export class SessionJanitor implements OnModuleInit, OnModuleDestroy {
  static readonly INTERVAL_MS = 15 * 60 * 1000;

  private readonly logger = new Logger(SessionJanitor.name);
  private timer?: NodeJS.Timeout;

  constructor(@Inject(SESSION_STORE) private readonly sessions: SessionStore) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.sweep(), SessionJanitor.INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async sweep(): Promise<void> {
    try {
      const purged = await this.sessions.purgeExpired();
      if (purged > 0) this.logger.log(`Purged ${purged} expired session(s)`);
    } catch (err) {
      this.logger.warn(`Session purge failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

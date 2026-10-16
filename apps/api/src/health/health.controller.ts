import { Controller, Get, Inject, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Pool } from 'pg';
import type { Env } from '../config/env';
import { PG_POOL } from '../db/database.module';

type Dep = 'up' | 'down' | 'skipped';

/** Hard ceiling for each dependency probe — readiness must always answer. */
const PROBE_TIMEOUT_MS = 1500;

/**
 * Readiness probe: 503 unless every configured dependency is reachable, so
 * traffic isn't routed to an instance whose authorization or data path is down.
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly config: ConfigService<Env, true>,
    @Inject(PG_POOL) private readonly pool: Pool | null,
  ) {}

  @Get()
  async check(@Res() res: Response): Promise<void> {
    const [opa, db] = await Promise.all([this.probeOpa(), this.probeDb()]);
    const ok = opa === 'up' && db !== 'down';
    res.status(ok ? 200 : 503).json({
      status: ok ? 'ok' : 'degraded',
      service: 'caroni-api',
      deps: { opa, db },
      ts: new Date().toISOString(),
    });
  }

  private async probeOpa(): Promise<Dep> {
    return this.probe(`${this.config.get('OPA_URL', { infer: true })}/health`);
  }

  private async probeDb(): Promise<Dep> {
    if (!this.pool) return 'skipped';
    try {
      // Belt-and-braces: the pool also sets connection/statement timeouts, but
      // race here so readiness always resolves even if the driver stalls.
      await this.withTimeout(this.pool.query('SELECT 1'), PROBE_TIMEOUT_MS);
      return 'up';
    } catch {
      return 'down';
    }
  }

  private withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`probe timed out after ${ms}ms`)), ms);
      work.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (err: unknown) => {
          clearTimeout(timer);
          reject(err);
        },
      );
    });
  }

  private async probe(url: string): Promise<Dep> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return res.ok ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }
}

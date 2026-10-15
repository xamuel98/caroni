import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { loadEnv } from '../config/env';

type Dep = 'up' | 'down';

@Controller('health')
export class HealthController {
  private readonly opaUrl = loadEnv().OPA_URL;

  /**
   * Readiness-style check: probes required dependencies and returns 503 when
   * any is unavailable, so monitors don't route to an instance whose
   * authorization path can't serve requests.
   *
   * NOTE: Postgres is not connected yet (lands with the data layer in M1/M2);
   * it will be added here alongside the OPA probe.
   */
  @Get()
  async check(@Res() res: Response) {
    const opa = await this.probe(`${this.opaUrl}/health`);
    const ok = opa === 'up';
    res.status(ok ? 200 : 503).json({
      status: ok ? 'ok' : 'degraded',
      service: 'caroni-api',
      deps: { opa },
      ts: new Date().toISOString(),
    });
  }

  private async probe(url: string): Promise<Dep> {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      return res.ok ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }
}

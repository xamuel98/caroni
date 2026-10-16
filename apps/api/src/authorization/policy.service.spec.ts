import type { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../config/env';
import { DependencyError } from '../common/errors';
import { PolicyService } from './policy.service';

const config = { get: () => 'http://opa.test' } as unknown as ConfigService<Env, true>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('PolicyService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('normalizes a full decision from OPA', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          result: {
            allow: true,
            reasons: ['rbac.ok'],
            obligations: [],
            matchedPolicy: 'caroni/allow',
          },
        }),
      ),
    );

    const decision = await new PolicyService(config).decide({
      action: 'ops_kyc.kyc_case.view',
      subject: { roles: ['ops:kyc_analyst'] },
    });

    expect(decision).toEqual({
      allow: true,
      reasons: ['rbac.ok'],
      obligations: [],
      matchedPolicy: 'caroni/allow',
    });
  });

  it('fails closed when OPA returns no result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})));

    const decision = await new PolicyService(config).decide({
      action: 'unknown',
      subject: { roles: [] },
    });

    expect(decision.allow).toBe(false);
    expect(decision.reasons).toContain('opa.no_result');
  });

  it('throws DependencyError on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 500)));

    await expect(
      new PolicyService(config).decide({ action: 'x', subject: { roles: [] } }),
    ).rejects.toBeInstanceOf(DependencyError);
  });

  it('throws DependencyError when OPA is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    await expect(
      new PolicyService(config).decide({ action: 'x', subject: { roles: [] } }),
    ).rejects.toBeInstanceOf(DependencyError);
  });
});

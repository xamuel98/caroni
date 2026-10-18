import type { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DependencyError } from '../common/errors';
import type { Env } from '../config/env';
import { InMemoryDecisionLogStore, type DecisionLogStore } from './decision-log.store';
import { PolicyService } from './policy.service';

const config = { get: () => 'http://opa.test' } as unknown as ConfigService<Env, true>;

function service(store: DecisionLogStore = new InMemoryDecisionLogStore()) {
  return { policy: new PolicyService(config, store), store: store as InMemoryDecisionLogStore };
}

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

    const { policy } = service();
    const decision = await policy.decide({
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

  it('writes an audit row for an allow decision', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          result: { allow: true, reasons: [], obligations: [], matchedPolicy: 'caroni/allow' },
        }),
      ),
    );

    const { policy, store } = service();
    await policy.decide({
      action: 'ops_kyc.kyc_case.view',
      subject: { id: 'u1', roles: ['ops:kyc_analyst'] },
    });

    expect(store.list()).toHaveLength(1);
    expect(store.list()[0]).toMatchObject({
      action: 'ops_kyc.kyc_case.view',
      subjectId: 'u1',
      roles: ['ops:kyc_analyst'],
      allow: true,
      matchedPolicy: 'caroni/allow',
    });
    expect(store.list()[0]!.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('writes an audit row for a deny decision', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          result: {
            allow: false,
            reasons: ['rbac.denied'],
            obligations: ['requires_supervisor_approval'],
            matchedPolicy: 'caroni/allow',
          },
        }),
      ),
    );

    const { policy, store } = service();
    await policy.decide({
      action: 'ops_transfers.transfer.reverse',
      subject: { id: 'u1', roles: ['ops:support_agent'] },
    });

    expect(store.list()[0]).toMatchObject({
      allow: false,
      reasons: ['rbac.denied'],
      obligations: ['requires_supervisor_approval'],
    });
  });

  it('fails closed and audits when OPA returns no result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})));

    const { policy, store } = service();
    const decision = await policy.decide({ action: 'unknown', subject: { roles: [] } });

    expect(decision.allow).toBe(false);
    expect(decision.reasons).toContain('opa.no_result');
    expect(store.list()[0]).toMatchObject({ allow: false, reasons: ['opa.no_result'] });
  });

  it('throws and audits on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 500)));

    const { policy, store } = service();
    await expect(policy.decide({ action: 'x', subject: { roles: [] } })).rejects.toBeInstanceOf(
      DependencyError,
    );
    expect(store.list()[0]).toMatchObject({ allow: false, reasons: ['opa.unavailable'] });
  });

  it('throws and audits when OPA is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const { policy, store } = service();
    await expect(policy.decide({ action: 'x', subject: { roles: [] } })).rejects.toBeInstanceOf(
      DependencyError,
    );
    expect(store.list()[0]).toMatchObject({ reasons: ['opa.unavailable'] });
  });

  it('never lets an audit failure break the decision', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ result: { allow: true } })));

    const store: DecisionLogStore = { record: vi.fn().mockRejectedValue(new Error('db down')) };
    const { policy } = service(store);

    await expect(policy.decide({ action: 'x', subject: { roles: [] } })).resolves.toMatchObject({
      allow: true,
    });
  });
});

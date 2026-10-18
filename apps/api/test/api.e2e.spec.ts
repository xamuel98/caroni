import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AbilitiesResponseSchema } from '@caroni/shared-types';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module';
import { SESSION_STORE, type SessionStore } from '../src/auth/session.store';
import { PolicyService } from '../src/authorization/policy.service';
import { correlationMiddleware } from '../src/common/correlation';
import { ProblemDetailsFilter } from '../src/common/problem-details.filter';

const decide = vi.fn();

describe('API (e2e)', () => {
  let app: INestApplication;
  let cookie: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PolicyService)
      .useValue({ decide })
      .compile();

    app = moduleRef.createNestApplication({ logger: false });
    app.use(correlationMiddleware);
    app.useGlobalFilters(new ProblemDetailsFilter());
    await app.init();

    const store = app.get<SessionStore>(SESSION_STORE);
    const session = await store.create({
      userId: 'u1',
      displayName: 'Ada',
      roles: ['ops:kyc_analyst'],
      ttlSeconds: 60,
    });
    cookie = `caroni_sid=${session.id}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 problem+json without a session', async () => {
    const res = await request(app.getHttpServer()).get('/api/session').expect(401);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body).toMatchObject({ code: 'unauthorized', status: 401 });
    expect(res.headers['x-correlation-id']).toBeTruthy();
  });

  it('returns the session identity when authenticated (never the bearer id)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/session')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body).toMatchObject({
      userId: 'u1',
      displayName: 'Ada',
      roles: ['ops:kyc_analyst'],
    });
    expect(res.body.id).toBeUndefined();
  });

  it('returns abilities + grants for the authenticated session', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/session/abilities')
      .set('Cookie', cookie)
      .expect(200);

    const parsed = AbilitiesResponseSchema.parse(res.body);
    expect(parsed.grants).toContain('ops_kyc.kyc_case.view');
    expect(parsed.abilities.map((a) => a.permission_id)).toContain('ops_kyc.kyc_case.view');
    expect(parsed.abilities.map((a) => a.permission_id)).not.toContain(
      'ops_transfers.transfer.reverse',
    );
    expect(parsed.branchScope).toEqual([]);
  });

  it('returns 401 for abilities without a session', async () => {
    await request(app.getHttpServer()).get('/api/session/abilities').expect(401);
  });

  it('returns 401 on a guarded route without a session', async () => {
    const res = await request(app.getHttpServer()).get('/api/ops/kyc/cases').expect(401);
    expect(res.body.code).toBe('unauthorized');
  });

  it('returns 403 with reasons when policy denies', async () => {
    decide.mockResolvedValueOnce({
      allow: false,
      reasons: ['rbac.denied: role lacks required permission'],
      obligations: [],
      matchedPolicy: 'caroni/allow',
    });

    const res = await request(app.getHttpServer())
      .get('/api/ops/kyc/cases')
      .set('Cookie', cookie)
      .expect(403);

    expect(res.body.code).toBe('forbidden');
    expect(res.body.reasons).toEqual(['rbac.denied: role lacks required permission']);
  });

  it('returns 200 when policy allows', async () => {
    decide.mockResolvedValueOnce({
      allow: true,
      reasons: [],
      obligations: [],
      matchedPolicy: 'caroni/allow',
    });

    const res = await request(app.getHttpServer())
      .get('/api/ops/kyc/cases')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body).toEqual({ cases: [], viewer: 'u1' });
  });

  it('echoes an inbound correlation id', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/session')
      .set('Cookie', cookie)
      .set('X-Correlation-Id', 'trace-123');

    expect(res.headers['x-correlation-id']).toBe('trace-123');
  });
});

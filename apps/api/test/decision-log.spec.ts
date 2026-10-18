import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationModule } from '../src/authorization/authorization.module';
import {
  DECISION_LOG_STORE,
  InMemoryDecisionLogStore,
} from '../src/authorization/decision-log.store';
import { PolicyService } from '../src/authorization/policy.service';
import { validateEnv } from '../src/config/env';
import { DatabaseModule } from '../src/db/database.module';

function okDecision(allow: boolean): Response {
  return new Response(
    JSON.stringify({
      result: { allow, reasons: [], obligations: [], matchedPolicy: 'caroni/allow' },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}

describe('decision logging (module wiring)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('records a decision_log row through the real PolicyService', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okDecision(true)));

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        DatabaseModule,
        AuthorizationModule,
      ],
    }).compile();

    try {
      const policy = moduleRef.get(PolicyService);
      const store = moduleRef.get<InMemoryDecisionLogStore>(DECISION_LOG_STORE);

      await policy.decide({
        action: 'ops_kyc.kyc_case.view',
        subject: { id: 'u1', roles: ['ops:kyc_analyst'] },
      });

      expect(store.list()).toHaveLength(1);
      expect(store.list()[0]).toMatchObject({
        action: 'ops_kyc.kyc_case.view',
        subjectId: 'u1',
        allow: true,
      });
    } finally {
      await moduleRef.close();
    }
  });
});

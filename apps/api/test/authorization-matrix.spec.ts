import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Integration test against a running OPA (the same policy/data the API uses).
 * Skips automatically when OPA isn't reachable, so unit runs stay hermetic —
 * in CI (docker compose up opa) it is the real authorization-matrix gate.
 */
const OPA_URL = process.env.OPA_URL ?? 'http://localhost:8181';

async function reachable(): Promise<boolean> {
  try {
    const res = await fetch(`${OPA_URL}/health`, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function decide(action: string, roles: string[]): Promise<boolean> {
  const res = await fetch(`${OPA_URL}/v1/data/caroni/decision`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input: { action, subject: { roles } } }),
  });
  const body = (await res.json()) as { result?: { allow?: boolean } };
  return body.result?.allow === true;
}

interface Case {
  name: string;
  roles: string[];
  action: string;
  allow: boolean;
}

const matrix: Case[] = [
  {
    name: 'kyc_analyst may view KYC cases',
    roles: ['ops:kyc_analyst'],
    action: 'ops_kyc.kyc_case.view',
    allow: true,
  },
  {
    name: 'kyc_analyst may NOT decide KYC cases (view-only grant)',
    roles: ['ops:kyc_analyst'],
    action: 'ops_kyc.kyc_case.decide',
    allow: false,
  },
  {
    name: 'kyc_analyst may NOT reverse transfers',
    roles: ['ops:kyc_analyst'],
    action: 'ops_transfers.transfer.reverse',
    allow: false,
  },
  {
    name: 'admin may decide KYC cases',
    roles: ['ops:admin'],
    action: 'ops_kyc.kyc_case.decide',
    allow: true,
  },
  {
    name: 'unknown role is denied',
    roles: ['ops:ghost'],
    action: 'ops_kyc.kyc_case.view',
    allow: false,
  },
  {
    name: 'a session with no roles is denied',
    roles: [],
    action: 'ops_kyc.kyc_case.view',
    allow: false,
  },
  {
    name: 'an unknown action is denied',
    roles: ['ops:admin'],
    action: 'ops_nope.nope.nope',
    allow: false,
  },
];

describe('authorization matrix (OPA integration)', () => {
  let opaUp = false;

  beforeAll(async () => {
    opaUp = await reachable();
  });

  for (const testCase of matrix) {
    it(testCase.name, async (ctx) => {
      ctx.skip(!opaUp, `OPA not reachable at ${OPA_URL}`);
      expect(await decide(testCase.action, testCase.roles)).toBe(testCase.allow);
    });
  }
});

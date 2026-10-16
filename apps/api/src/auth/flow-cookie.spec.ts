import { describe, expect, it } from 'vitest';
import { UnauthorizedError } from '../common/errors';
import { signFlow, verifyFlow } from './flow-cookie';

const SECRET = 'k'.repeat(40);
const OTHER_SECRET = 'z'.repeat(40);
const FLOW = { state: 'state-1', verifier: 'verifier-1', nonce: 'nonce-1' };

describe('OIDC flow cookie', () => {
  it('round-trips the flow', async () => {
    const token = await signFlow(FLOW, SECRET, 300);
    expect(await verifyFlow(token, SECRET)).toEqual(FLOW);
  });

  it('rejects a tampered token', async () => {
    const token = await signFlow(FLOW, SECRET, 300);
    const tampered = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;
    await expect(verifyFlow(tampered, SECRET)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await signFlow(FLOW, OTHER_SECRET, 300);
    await expect(verifyFlow(token, SECRET)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects an expired flow', async () => {
    const token = await signFlow(FLOW, SECRET, -1);
    await expect(verifyFlow(token, SECRET)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

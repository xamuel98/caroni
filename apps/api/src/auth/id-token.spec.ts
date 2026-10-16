import { generateKeyPair, SignJWT } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { InvalidIdTokenError, verifyIdToken } from './id-token';

const ISSUER = 'https://issuer.test';
const AUDIENCE = 'caroni-ops-console';

type KeyPair = Awaited<ReturnType<typeof generateKeyPair>>;
let keys: KeyPair;

const getKey = () => Promise.resolve(keys.publicKey);

function sign(
  claims: { sub?: string; email?: string; name?: string; roles?: string[] },
  opts: { issuer?: string; audience?: string; expiresIn?: string; nonce?: string } = {},
): Promise<string> {
  const payload: Record<string, unknown> = { ...claims };
  if (opts.nonce) payload['nonce'] = opts.nonce;
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .setSubject(claims.sub ?? 'user-1')
    .setIssuedAt()
    .setIssuer(opts.issuer ?? ISSUER)
    .setAudience(opts.audience ?? AUDIENCE)
    .setExpirationTime(opts.expiresIn ?? '5m')
    .sign(keys.privateKey);
}

describe('verifyIdToken', () => {
  beforeAll(async () => {
    keys = await generateKeyPair('RS256');
  });

  it('returns claims from a valid token', async () => {
    const token = await sign(
      { sub: 'user-1', email: 'a@caroni.dev', name: 'Ada', roles: ['ops:kyc_analyst'] },
      { nonce: 'n-1' },
    );

    const claims = await verifyIdToken(getKey, token, {
      issuer: ISSUER,
      audience: AUDIENCE,
      nonce: 'n-1',
    });
    expect(claims).toEqual({
      sub: 'user-1',
      email: 'a@caroni.dev',
      name: 'Ada',
      roles: ['ops:kyc_analyst'],
    });
  });

  it('defaults roles to an empty list when absent', async () => {
    const token = await sign({ sub: 'user-2' });
    const claims = await verifyIdToken(getKey, token, { issuer: ISSUER, audience: AUDIENCE });
    expect(claims.roles).toEqual([]);
  });

  it('rejects a nonce mismatch', async () => {
    const token = await sign({ sub: 'user-1' }, { nonce: 'expected' });
    await expect(
      verifyIdToken(getKey, token, { issuer: ISSUER, audience: AUDIENCE, nonce: 'other' }),
    ).rejects.toBeInstanceOf(InvalidIdTokenError);
  });

  it('rejects a wrong audience', async () => {
    const token = await sign({ sub: 'user-1' }, { audience: 'someone-else' });
    await expect(
      verifyIdToken(getKey, token, { issuer: ISSUER, audience: AUDIENCE }),
    ).rejects.toBeInstanceOf(InvalidIdTokenError);
  });

  it('rejects a wrong issuer', async () => {
    const token = await sign({ sub: 'user-1' }, { issuer: 'https://evil.test' });
    await expect(
      verifyIdToken(getKey, token, { issuer: ISSUER, audience: AUDIENCE }),
    ).rejects.toBeInstanceOf(InvalidIdTokenError);
  });

  it('rejects an expired token', async () => {
    // Beyond the 5s clock tolerance baked into verification.
    const token = await sign({ sub: 'user-1' }, { expiresIn: '-30s' });
    await expect(
      verifyIdToken(getKey, token, { issuer: ISSUER, audience: AUDIENCE }),
    ).rejects.toBeInstanceOf(InvalidIdTokenError);
  });

  it('rejects a token signed by a different key', async () => {
    const other = await generateKeyPair('RS256');
    const token = await new SignJWT({ sub: 'attacker' })
      .setProtectedHeader({ alg: 'RS256' })
      .setSubject('attacker')
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setExpirationTime('5m')
      .sign(other.privateKey);

    await expect(
      verifyIdToken(getKey, token, { issuer: ISSUER, audience: AUDIENCE }),
    ).rejects.toBeInstanceOf(InvalidIdTokenError);
  });
});

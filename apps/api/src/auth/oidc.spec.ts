import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { base64url, createPkce, randomId } from './oidc';

const sha256 = (input: string) => base64url(createHash('sha256').update(input).digest());

describe('oidc helpers', () => {
  it('base64url is URL-safe and unpadded', () => {
    const encoded = base64url(Buffer.from([0xfb, 0xff, 0xbf]));
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('randomId is unique and URL-safe', () => {
    const ids = new Set(Array.from({ length: 100 }, () => randomId(16)));
    expect(ids.size).toBe(100);
    for (const id of ids) expect(id).not.toMatch(/[+/=]/);
  });

  it('createPkce derives the S256 challenge from the verifier', () => {
    const { verifier, challenge } = createPkce();
    expect(challenge).toBe(sha256(verifier));
    expect(verifier.length).toBeGreaterThanOrEqual(43);
  });
});

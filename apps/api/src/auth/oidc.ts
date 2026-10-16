import { createHash, randomBytes } from 'node:crypto';

export const base64url = (buf: Buffer): string =>
  buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const randomId = (bytes = 16): string => base64url(randomBytes(bytes));

/** PKCE (RFC 7636) S256 pair. */
export function createPkce(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

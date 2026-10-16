import { jwtVerify, SignJWT } from 'jose';
import { UnauthorizedError } from '../common/errors';

/** Short-lived, browser-bound state for an in-flight OIDC login. */
export interface OidcFlow {
  state: string;
  verifier: string;
  nonce: string;
}

/**
 * The flow is carried in a small signed cookie rather than a server-side map,
 * so any API instance can complete a login started on another — no shared
 * session cache required, and it is inherently single-use (the cookie is
 * cleared at the callback).
 */
export function signFlow(flow: OidcFlow, secret: string, ttlSeconds: number): Promise<string> {
  return new SignJWT({ ...flow })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secretKey(secret));
}

export async function verifyFlow(token: string, secret: string): Promise<OidcFlow> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret));
    const { state, verifier, nonce } = payload as Record<string, unknown>;
    if (typeof state !== 'string' || typeof verifier !== 'string' || typeof nonce !== 'string') {
      throw new Error('malformed flow cookie');
    }
    return { state, verifier, nonce };
  } catch {
    throw new UnauthorizedError('Invalid or expired sign-in flow');
  }
}

const secretKey = (secret: string): Uint8Array => new TextEncoder().encode(secret);

import { errors as joseErrors, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { z } from 'zod';
import { DomainError } from '../common/errors';

/** Claims we trust once the token signature and standard claims are verified. */
export interface IdTokenClaims {
  sub: string;
  email?: string;
  name?: string;
  roles: string[];
}

export class InvalidIdTokenError extends DomainError {
  constructor(message = 'Invalid identity token', cause?: unknown) {
    super({ status: 401, code: 'invalid_id_token', message, cause });
  }
}

const ClaimsSchema = z
  .object({
    sub: z.string().min(1),
    email: z.string().optional(),
    name: z.string().optional(),
    roles: z.array(z.string()).optional(),
  })
  .passthrough();

export interface VerifyOptions {
  issuer: string;
  audience: string;
  nonce?: string;
  clockToleranceSeconds?: number;
}

/**
 * Verifies an OIDC id_token against `getKey` (a JWKS resolver) and the expected
 * issuer/audience, and — when provided — the `nonce` bound to the login flow.
 * Throws `InvalidIdTokenError` on any failure; never returns unverified claims.
 */
export async function verifyIdToken(
  getKey: JWTVerifyGetKey,
  idToken: string,
  opts: VerifyOptions,
): Promise<IdTokenClaims> {
  let payload: Record<string, unknown>;
  try {
    ({ payload } = await jwtVerify(idToken, getKey, {
      issuer: opts.issuer,
      audience: opts.audience,
      clockTolerance: opts.clockToleranceSeconds ?? 5,
    }));
  } catch (err) {
    // Include the jose reason for debuggability; it is safe (no secret material).
    const reason = err instanceof joseErrors.JOSEError ? err.code : 'verification failed';
    throw new InvalidIdTokenError(`id_token rejected: ${reason}`, err);
  }

  if (opts.nonce !== undefined && payload['nonce'] !== opts.nonce) {
    throw new InvalidIdTokenError('id_token rejected: nonce mismatch');
  }

  const parsed = ClaimsSchema.safeParse(payload);
  if (!parsed.success) {
    throw new InvalidIdTokenError('id_token rejected: missing required claims');
  }

  const claims = parsed.data;
  return {
    sub: claims.sub,
    email: claims.email,
    name: claims.name,
    roles: claims.roles ?? [],
  };
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import { DependencyError } from '../common/errors';
import type { Env } from '../config/env';
import { verifyIdToken, type IdTokenClaims } from './id-token';

/**
 * Wraps id_token verification with the issuer's JWKS (discovered once and
 * cached). Keys are re-fetched by `jose` on rotation.
 */
@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name);
  private keySet?: JWTVerifyGetKey;

  constructor(private readonly config: ConfigService<Env, true>) {}

  async verifyIdToken(idToken: string, nonce: string): Promise<IdTokenClaims> {
    return verifyIdToken(await this.keys(), idToken, {
      issuer: this.config.get('THUNDER_ISSUER', { infer: true }),
      audience: this.config.get('THUNDER_CLIENT_ID', { infer: true }),
      nonce,
    });
  }

  private async keys(): Promise<JWTVerifyGetKey> {
    if (this.keySet) return this.keySet;
    const explicit = this.config.get('THUNDER_JWKS_URL', { infer: true });
    const jwksUrl = explicit ?? (await this.discoverJwksUri());
    this.logger.log(`Using JWKS at ${jwksUrl}`);
    this.keySet = createRemoteJWKSet(new URL(jwksUrl));
    return this.keySet;
  }

  private async discoverJwksUri(): Promise<string> {
    const issuer = this.config.get('THUNDER_ISSUER', { infer: true });
    const discoveryUrl = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;
    let res: Response;
    try {
      res = await fetch(discoveryUrl);
    } catch (err) {
      throw new DependencyError(`Failed to reach OIDC discovery at ${discoveryUrl}`, err);
    }
    if (!res.ok) {
      throw new DependencyError(`OIDC discovery failed (${res.status})`);
    }
    const doc = (await res.json()) as { jwks_uri?: string };
    if (!doc.jwks_uri) {
      throw new DependencyError('OIDC discovery document is missing jwks_uri');
    }
    return doc.jwks_uri;
  }
}

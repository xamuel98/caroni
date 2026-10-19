import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import { DependencyError } from '../common/errors';
import type { Env } from '../config/env';
import { verifyIdToken, type IdTokenClaims } from './id-token';

interface DiscoveryDocument {
  jwks_uri?: string;
  end_session_endpoint?: string;
}

/**
 * OIDC metadata + id_token verification. Discovery is fetched once and cached;
 * `jose` re-fetches signing keys on rotation.
 */
@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name);
  private keySet?: JWTVerifyGetKey;
  private discovery?: DiscoveryDocument;

  constructor(private readonly config: ConfigService<Env, true>) {}

  async verifyIdToken(idToken: string, nonce: string): Promise<IdTokenClaims> {
    return verifyIdToken(await this.keys(), idToken, {
      issuer: this.config.get('THUNDER_ISSUER', { infer: true }),
      audience: this.config.get('THUNDER_CLIENT_ID', { infer: true }),
      nonce,
    });
  }

  /** The IdP's RP-initiated logout endpoint, or null if it doesn't advertise one. */
  async endSessionEndpoint(): Promise<string | null> {
    return (await this.discoveryDocument()).end_session_endpoint ?? null;
  }

  private async keys(): Promise<JWTVerifyGetKey> {
    if (this.keySet) return this.keySet;
    const explicit = this.config.get('THUNDER_JWKS_URL', { infer: true });
    const jwksUrl = explicit ?? (await this.discoveryDocument()).jwks_uri;
    if (!jwksUrl) throw new DependencyError('OIDC discovery document is missing jwks_uri');
    this.logger.log(`Using JWKS at ${jwksUrl}`);
    this.keySet = createRemoteJWKSet(new URL(jwksUrl));
    return this.keySet;
  }

  private async discoveryDocument(): Promise<DiscoveryDocument> {
    if (this.discovery) return this.discovery;
    const issuer = this.config.get('THUNDER_ISSUER', { infer: true });
    const url = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;

    let res: Response;
    try {
      res = await fetch(url);
    } catch (err) {
      throw new DependencyError(`Failed to reach OIDC discovery at ${url}`, err);
    }
    if (!res.ok) throw new DependencyError(`OIDC discovery failed (${res.status})`);

    this.discovery = (await res.json()) as DiscoveryDocument;
    return this.discovery;
  }
}

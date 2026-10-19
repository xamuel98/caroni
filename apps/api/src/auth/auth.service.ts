import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import { DependencyError, UnauthorizedError } from '../common/errors';
import { flowCookieOptions, parseCookie, sessionCookieOptions } from '../common/cookies';
import type { Env } from '../config/env';
import { signFlow, verifyFlow } from './flow-cookie';
import { buildEndSessionUrl } from './logout';
import { createPkce, randomId } from './oidc';
import { OidcService } from './oidc.service';
import { SESSION_STORE, type SessionRecord, type SessionStore } from './session.store';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly oidc: OidcService,
    @Inject(SESSION_STORE) private readonly sessions: SessionStore,
  ) {}

  async startLogin(): Promise<{ url: string; flowCookie: string; cookie: CookieOptions }> {
    const state = randomId(16);
    const nonce = randomId(16);
    const { verifier, challenge } = createPkce();
    const ttl = this.config.get('OIDC_STATE_TTL_SECONDS', { infer: true });
    const flowCookie = await signFlow({ state, verifier, nonce }, this.secret(), ttl);

    const url = new URL(`${this.issuer()}/oauth2/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.config.get('THUNDER_CLIENT_ID', { infer: true }));
    url.searchParams.set('redirect_uri', this.config.get('THUNDER_REDIRECT_URI', { infer: true }));
    url.searchParams.set('scope', this.config.get('THUNDER_SCOPE', { infer: true }));
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');

    return { url: url.toString(), flowCookie, cookie: flowCookieOptions(ttl, this.cookieSecure()) };
  }

  async completeLogin(
    code: string,
    state: string,
    flowCookieValue: string | null,
  ): Promise<SessionRecord> {
    if (!flowCookieValue) throw new UnauthorizedError('Missing sign-in flow');
    const flow = await verifyFlow(flowCookieValue, this.secret());
    if (flow.state !== state) throw new UnauthorizedError('Sign-in state mismatch');

    const idToken = await this.exchangeCode(code, flow.verifier);
    const claims = await this.oidc.verifyIdToken(idToken, flow.nonce);

    // Roles come from the verified id_token (ThunderID RBAC → `roles` claim).
    if (claims.roles.length === 0) {
      this.logger.warn(`User ${claims.sub} signed in with no roles — all decisions will deny`);
    }

    return this.sessions.create({
      userId: claims.sub,
      displayName: claims.name ?? claims.email ?? claims.sub,
      email: claims.email,
      roles: claims.roles,
      idToken,
      ttlSeconds: this.config.get('SESSION_TTL_SECONDS', { infer: true }),
    });
  }

  async sessionFromCookie(cookieHeader: string | undefined): Promise<SessionRecord | null> {
    const id = parseCookie(cookieHeader, this.sessionCookie().name);
    return id ? this.sessions.get(id) : null;
  }

  async requireSession(cookieHeader: string | undefined): Promise<SessionRecord> {
    const session = await this.sessionFromCookie(cookieHeader);
    if (!session) throw new UnauthorizedError();
    return session;
  }

  /**
   * Ends the app session AND the IdP's SSO session (RP-initiated logout), then
   * returns the browser redirect. Without the IdP step the app would be
   * immediately signed back in via SSO. Falls back to the app redirect if the
   * IdP doesn't advertise an end-session endpoint.
   */
  async logoutAndEndSession(cookieHeader: string | undefined): Promise<string> {
    const session = await this.sessionFromCookie(cookieHeader);
    if (session) await this.sessions.delete(session.id);

    const postLogoutRedirectUri = this.config.get('POST_LOGOUT_REDIRECT_URI', { infer: true });
    try {
      const endpoint = await this.oidc.endSessionEndpoint();
      if (endpoint) {
        return buildEndSessionUrl(endpoint, {
          clientId: this.config.get('THUNDER_CLIENT_ID', { infer: true }),
          postLogoutRedirectUri,
          idTokenHint: session?.idToken,
        });
      }
    } catch (err) {
      this.logger.warn(
        `End-session endpoint unavailable; redirecting to the app: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
    return postLogoutRedirectUri;
  }

  sessionCookie(): { name: string; options: CookieOptions } {
    return {
      name: this.config.get('SESSION_COOKIE_NAME', { infer: true }),
      options: sessionCookieOptions(
        this.config.get('SESSION_TTL_SECONDS', { infer: true }),
        this.cookieSecure(),
      ),
    };
  }

  stateCookieName(): string {
    return this.config.get('OIDC_STATE_COOKIE_NAME', { infer: true });
  }

  postLoginRedirect(): string {
    return this.config.get('POST_LOGIN_REDIRECT_URI', { infer: true });
  }

  private async exchangeCode(code: string, verifier: string): Promise<string> {
    let res: Response;
    try {
      res = await fetch(`${this.issuer()}/oauth2/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.get('THUNDER_CLIENT_ID', { infer: true }),
          redirect_uri: this.config.get('THUNDER_REDIRECT_URI', { infer: true }),
          code,
          code_verifier: verifier,
        }),
      });
    } catch (err) {
      throw new DependencyError('Identity provider token endpoint unreachable', err);
    }
    if (!res.ok) throw new UnauthorizedError(`Token exchange failed (${res.status})`);

    const tokens = (await res.json()) as { id_token?: string };
    if (!tokens.id_token) throw new UnauthorizedError('Token response is missing id_token');
    return tokens.id_token;
  }

  private secret(): string {
    return this.config.get('SESSION_SECRET', { infer: true });
  }

  private issuer(): string {
    return this.config.get('THUNDER_ISSUER', { infer: true }).replace(/\/$/, '');
  }

  private cookieSecure(): boolean {
    const explicit = this.config.get('COOKIE_SECURE', { infer: true });
    return explicit ?? this.config.get('NODE_ENV', { infer: true }) === 'production';
  }
}

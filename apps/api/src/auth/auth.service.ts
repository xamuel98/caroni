import { Injectable } from '@nestjs/common';
import { loadEnv } from '../config/env';
import { createPkce, decodeJwtPayload, randomId } from './oidc';

export interface Session {
  id: string;
  sub: string;
  email?: string;
  name?: string;
  roles: string[];
  createdAt: number;
}

interface Pending {
  verifier: string;
  createdAt: number;
}

const SESSION_COOKIE = 'caroni_sid';

@Injectable()
export class AuthService {
  private readonly env = loadEnv();
  private readonly pending = new Map<string, Pending>();
  private readonly sessions = new Map<string, Session>();

  startLogin(): string {
    const state = randomId(16);
    const { verifier, challenge } = createPkce();
    this.pending.set(state, { verifier, createdAt: Date.now() });

    const url = new URL(`${this.env.THUNDER_ISSUER}/oauth2/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.env.THUNDER_CLIENT_ID);
    url.searchParams.set('redirect_uri', this.env.THUNDER_REDIRECT_URI);
    url.searchParams.set('scope', this.env.THUNDER_SCOPE);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    return url.toString();
  }

  async completeLogin(code: string, state: string): Promise<Session> {
    const pend = this.pending.get(state);
    if (!pend) throw new Error('Unknown or expired state');
    this.pending.delete(state);

    const res = await fetch(`${this.env.THUNDER_ISSUER}/oauth2/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.env.THUNDER_CLIENT_ID,
        redirect_uri: this.env.THUNDER_REDIRECT_URI,
        code,
        code_verifier: pend.verifier,
      }),
    });
    if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);

    const tokens = (await res.json()) as { id_token?: string };
    const claims = tokens.id_token ? decodeJwtPayload(tokens.id_token) : {};
    const roles = Array.isArray(claims['roles'])
      ? (claims['roles'] as string[])
      : ['ops:kyc_analyst'];

    const session: Session = {
      id: randomId(24),
      sub: String(claims['sub'] ?? 'unknown'),
      email: claims['email'] as string | undefined,
      name: (claims['name'] as string | undefined) ?? (claims['email'] as string | undefined),
      roles,
      createdAt: Date.now(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  sessionFromCookie(cookieHeader?: string): Session | null {
    const id = this.parseCookie(cookieHeader, SESSION_COOKIE);
    return id ? (this.sessions.get(id) ?? null) : null;
  }

  destroy(cookieHeader?: string): void {
    const id = this.parseCookie(cookieHeader, SESSION_COOKIE);
    if (id) this.sessions.delete(id);
  }

  cookieName(): string {
    return SESSION_COOKIE;
  }

  private parseCookie(header: string | undefined, name: string): string | null {
    if (!header) return null;
    for (const part of header.split(';')) {
      const [k, v] = part.trim().split('=');
      if (k === name && v) return decodeURIComponent(v);
    }
    return null;
  }
}

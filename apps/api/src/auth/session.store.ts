import { randomId } from './oidc';

export interface SessionRecord {
  /** Opaque bearer id — lives only in the HttpOnly cookie, never exposed to JS. */
  id: string;
  userId: string;
  displayName: string;
  email?: string;
  roles: string[];
  /** Kept for RP-initiated logout (id_token_hint). */
  idToken?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateSessionInput {
  userId: string;
  displayName: string;
  email?: string;
  roles: string[];
  idToken?: string;
  ttlSeconds: number;
}

export interface SessionStore {
  create(input: CreateSessionInput): Promise<SessionRecord>;
  /** Returns the session, or `null` if unknown or expired. */
  get(id: string): Promise<SessionRecord | null>;
  delete(id: string): Promise<void>;
  deleteForUser(userId: string): Promise<void>;
  purgeExpired(now?: Date): Promise<number>;
}

export const SESSION_STORE = Symbol('SESSION_STORE');

/** Default store: process-local, expiry-enforcing. Fine for dev and tests. */
export class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, SessionRecord>();

  async create(input: CreateSessionInput): Promise<SessionRecord> {
    const now = Date.now();
    const record: SessionRecord = {
      id: randomId(32),
      userId: input.userId,
      displayName: input.displayName,
      email: input.email,
      roles: input.roles,
      idToken: input.idToken,
      createdAt: new Date(now),
      expiresAt: new Date(now + input.ttlSeconds * 1000),
    };
    this.sessions.set(record.id, record);
    return record;
  }

  async get(id: string): Promise<SessionRecord | null> {
    const record = this.sessions.get(id);
    if (!record) return null;
    if (record.expiresAt.getTime() <= Date.now()) {
      this.sessions.delete(id);
      return null;
    }
    return record;
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async deleteForUser(userId: string): Promise<void> {
    for (const [id, record] of this.sessions) {
      if (record.userId === userId) this.sessions.delete(id);
    }
  }

  async purgeExpired(now: Date = new Date()): Promise<number> {
    let purged = 0;
    for (const [id, record] of this.sessions) {
      if (record.expiresAt.getTime() <= now.getTime()) {
        this.sessions.delete(id);
        purged += 1;
      }
    }
    return purged;
  }
}

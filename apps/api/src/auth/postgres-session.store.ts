import { Logger, type OnModuleDestroy } from '@nestjs/common';
import type { Pool } from 'pg';
import { randomId } from './oidc';
import type { CreateSessionInput, SessionRecord, SessionStore } from './session.store';

interface SessionRow {
  id: string;
  user_id: string;
  display_name: string;
  email: string | null;
  roles: string[];
  created_at: Date;
  expires_at: Date;
}

const COLUMNS = 'id, user_id, display_name, email, roles, created_at, expires_at';

/** Durable, multi-instance session store. Requires the `session` table (migrations). */
export class PostgresSessionStore implements SessionStore, OnModuleDestroy {
  private readonly logger = new Logger(PostgresSessionStore.name);

  constructor(private readonly pool: Pool) {}

  async create(input: CreateSessionInput): Promise<SessionRecord> {
    const { rows } = await this.pool.query<SessionRow>(
      `INSERT INTO session (id, user_id, display_name, email, roles, expires_at)
       VALUES ($1, $2, $3, $4, $5, now() + make_interval(secs => $6))
       RETURNING ${COLUMNS}`,
      [
        randomId(32),
        input.userId,
        input.displayName,
        input.email ?? null,
        input.roles,
        input.ttlSeconds,
      ],
    );
    return mapRow(rows[0]!);
  }

  async get(id: string): Promise<SessionRecord | null> {
    const { rows } = await this.pool.query<SessionRow>(
      `SELECT ${COLUMNS} FROM session WHERE id = $1 AND expires_at > now()`,
      [id],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM session WHERE id = $1', [id]);
  }

  async deleteForUser(userId: string): Promise<void> {
    await this.pool.query('DELETE FROM session WHERE user_id = $1', [userId]);
  }

  async purgeExpired(now: Date = new Date()): Promise<number> {
    const result = await this.pool.query('DELETE FROM session WHERE expires_at <= $1', [now]);
    return result.rowCount ?? 0;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end().catch((err: unknown) => {
      this.logger.warn(`Failed to close pg pool: ${String(err)}`);
    });
  }
}

function mapRow(row: SessionRow): SessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    email: row.email ?? undefined,
    roles: row.roles,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

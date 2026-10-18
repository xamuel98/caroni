import type { Pool } from 'pg';
import type { DecisionLogEntry, DecisionLogStore } from './decision-log.store';

/** Append-only audit sink. Requires the `decision_log` table (migrations). */
export class PostgresDecisionLogStore implements DecisionLogStore {
  constructor(private readonly pool: Pool) {}

  async record(entry: DecisionLogEntry): Promise<void> {
    await this.pool.query(
      `INSERT INTO decision_log
         (correlation_id, subject_id, roles, action, resource, context,
          allow, reasons, obligations, matched_policy, latency_ms, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        entry.correlationId ?? null,
        entry.subjectId ?? null,
        entry.roles,
        entry.action,
        entry.resource ? JSON.stringify(entry.resource) : null,
        entry.context ? JSON.stringify(entry.context) : null,
        entry.allow,
        entry.reasons,
        entry.obligations,
        entry.matchedPolicy,
        entry.latencyMs,
        entry.createdAt,
      ],
    );
  }
}

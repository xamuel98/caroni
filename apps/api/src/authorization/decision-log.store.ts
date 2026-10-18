/** One audit record per authorization decision (allow or deny). */
export interface DecisionLogEntry {
  correlationId?: string;
  subjectId?: string;
  roles: string[];
  action: string;
  resource?: Record<string, unknown>;
  context?: Record<string, unknown>;
  allow: boolean;
  reasons: string[];
  obligations: string[];
  matchedPolicy: string;
  latencyMs: number;
  createdAt: Date;
}

export interface DecisionLogStore {
  record(entry: DecisionLogEntry): Promise<void>;
}

export const DECISION_LOG_STORE = Symbol('DECISION_LOG_STORE');

/** Default: process-local. Useful for dev; retains entries so tests can assert. */
export class InMemoryDecisionLogStore implements DecisionLogStore {
  private readonly entries: DecisionLogEntry[] = [];

  async record(entry: DecisionLogEntry): Promise<void> {
    this.entries.push(entry);
  }

  list(): readonly DecisionLogEntry[] {
    return this.entries;
  }
}

-- Append-only audit of every authorization decision.
CREATE TABLE IF NOT EXISTS decision_log (
  id             bigserial PRIMARY KEY,
  created_at     timestamptz NOT NULL DEFAULT now(),
  correlation_id text,
  subject_id     text,
  roles          text[] NOT NULL DEFAULT '{}',
  action         text NOT NULL,
  resource       jsonb,
  context        jsonb,
  allow          boolean NOT NULL,
  reasons        text[] NOT NULL DEFAULT '{}',
  obligations    text[] NOT NULL DEFAULT '{}',
  matched_policy text NOT NULL DEFAULT '',
  latency_ms     integer
);

CREATE INDEX IF NOT EXISTS decision_log_created_at_idx ON decision_log (created_at);
CREATE INDEX IF NOT EXISTS decision_log_subject_idx ON decision_log (subject_id);
CREATE INDEX IF NOT EXISTS decision_log_action_idx ON decision_log (action);
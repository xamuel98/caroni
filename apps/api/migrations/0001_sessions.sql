-- Sessions are server-side and opaque: the cookie only ever carries the id.
CREATE TABLE IF NOT EXISTS session (
  id           text PRIMARY KEY,
  user_id      text NOT NULL,
  display_name text NOT NULL,
  email        text,
  roles        text[] NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS session_user_id_idx ON session (user_id);
CREATE INDEX IF NOT EXISTS session_expires_at_idx ON session (expires_at);
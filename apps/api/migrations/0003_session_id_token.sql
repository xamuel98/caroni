-- Store the id_token so RP-initiated logout can send an id_token_hint.
ALTER TABLE session ADD COLUMN IF NOT EXISTS id_token text;
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { loadEnv } from '../config/env';

/** Minimal forward-only migration runner: applies `migrations/*.sql` once each. */
async function main(): Promise<void> {
  const logger = new Logger('migrate');
  const { DATABASE_URL } = loadEnv();
  if (!DATABASE_URL) {
    logger.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         name text PRIMARY KEY,
         applied_at timestamptz NOT NULL DEFAULT now()
       )`,
    );

    const dir = resolve(__dirname, '../../migrations');
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const applied = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
      if ((applied.rowCount ?? 0) > 0) {
        logger.log(`skip ${file}`);
        continue;
      }

      const sql = await readFile(join(dir, file), 'utf8');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        logger.log(`applied ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((err: unknown) => {
  new Logger('migrate').error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

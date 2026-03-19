import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { pool } from '../src/db';

async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname);
    const sqlFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of sqlFiles) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [file]
      );
      if (rows.length > 0) {
        console.log(`⏭  Skipping (already applied): ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`▶  Applying migration: ${file}`);
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✅ Applied: ${file}`);
    }

    console.log('🎉 All migrations up to date');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();

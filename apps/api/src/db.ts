import { Pool, QueryResultRow } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://tndiary:tndiary_secret@localhost:5432/tndiary',
});

// Utility to run a query with automatic connection management
export async function query<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

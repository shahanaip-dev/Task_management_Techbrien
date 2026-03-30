import { Pool } from 'pg';
import { config } from '../config';

/**
 * Shared PostgreSQL connection pool.
 * Import `db` anywhere you need to run queries.
 *
 * Usage:
 *   import { db } from '../db';
 *   const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 */
export const db = new Pool({
  user:     config.db.user,
  host:     config.db.host,
  database: config.db.database,
  password: config.db.password,
  port:     config.db.port,
  max:      10,              // max connections in pool
  idleTimeoutMillis: 30000,  // close idle connections after 30s
  connectionTimeoutMillis: 5000,
});

// Log successful connection on startup
db.on('connect', () => {
  if (config.app.isDev) {
    console.log('[DB] New client connected to PostgreSQL');
  }
});

db.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err);
});

/** Run a transaction — rolls back automatically on error */
export async function withTransaction<T>(
  fn: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

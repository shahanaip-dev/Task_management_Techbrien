import { Pool } from 'pg';
/**
 * Shared PostgreSQL connection pool.
 * Import `db` anywhere you need to run queries.
 *
 * Usage:
 *   import { db } from '../db';
 *   const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 */
export declare const db: Pool;
/** Run a transaction — rolls back automatically on error */
export declare function withTransaction<T>(fn: (client: import('pg').PoolClient) => Promise<T>): Promise<T>;

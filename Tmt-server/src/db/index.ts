import { Pool } from 'pg';
import { config } from '../config';

// Shared PostgreSQL connection pool.
export const db = new Pool({
  user:     config.db.user,
  host:     config.db.host,
  database: config.db.database,
  password: config.db.password,
  port:     config.db.port,
  max:      10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log successful connection on startup
// (useful in dev, noisy in prod)
db.on('connect', () => {
  if (config.app.isDev) {
    console.log('[DB] New client connected to PostgreSQL');
  }
});

db.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err);
});
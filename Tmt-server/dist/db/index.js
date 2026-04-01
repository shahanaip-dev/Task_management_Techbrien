"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.withTransaction = withTransaction;
const pg_1 = require("pg");
const config_1 = require("../config");
/**
 * Shared PostgreSQL connection pool.
 * Import `db` anywhere you need to run queries.
 *
 * Usage:
 *   import { db } from '../db';
 *   const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 */
exports.db = new pg_1.Pool({
    user: config_1.config.db.user,
    host: config_1.config.db.host,
    database: config_1.config.db.database,
    password: config_1.config.db.password,
    port: config_1.config.db.port,
    max: 10, // max connections in pool
    idleTimeoutMillis: 30000, // close idle connections after 30s
    connectionTimeoutMillis: 5000,
});
// Log successful connection on startup
exports.db.on('connect', () => {
    if (config_1.config.app.isDev) {
        console.log('[DB] New client connected to PostgreSQL');
    }
});
exports.db.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err);
});
/** Run a transaction — rolls back automatically on error */
async function withTransaction(fn) {
    const client = await exports.db.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=index.js.map
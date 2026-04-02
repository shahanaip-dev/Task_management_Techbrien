"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const config_1 = require("../config");
// Shared PostgreSQL connection pool.
exports.db = new pg_1.Pool({
    user: config_1.config.db.user,
    host: config_1.config.db.host,
    database: config_1.config.db.database,
    password: config_1.config.db.password,
    port: config_1.config.db.port,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
// Log successful connection on startup
// (useful in dev, noisy in prod)
exports.db.on('connect', () => {
    if (config_1.config.app.isDev) {
        console.log('[DB] New client connected to PostgreSQL');
    }
});
exports.db.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err);
});
//# sourceMappingURL=index.js.map
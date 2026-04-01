"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.AppError = void 0;
exports.errorHandler = errorHandler;
const config_1 = require("../config");
/**
 * Operational / expected application error.
 * Throw this from services for known failure cases.
 */
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Global error handler — must be registered LAST in Express.
 * Handles:
 *   - AppError (operational)
 *   - PostgreSQL 23505 (unique_violation)
 *   - PostgreSQL 23503 (foreign_key_violation)
 *   - Unknown errors (500)
 */
function errorHandler(err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    // ── Operational error ────────────────────────────────────────────────────
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    const pgErr = err;
    // ── PostgreSQL: unique constraint violation ───────────────────────────────
    if (pgErr.code === '23505') {
        res.status(409).json({
            success: false,
            message: `Duplicate value: ${pgErr.detail ?? pgErr.message}`,
        });
        return;
    }
    // ── PostgreSQL: foreign key violation ────────────────────────────────────
    if (pgErr.code === '23503') {
        res.status(400).json({
            success: false,
            message: 'Referenced record does not exist',
        });
        return;
    }
    // ── Unknown / unexpected error ───────────────────────────────────────────
    console.error('[UnhandledError]', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(config_1.config.app.isDev && { stack: err.stack }),
    });
}
/** Wraps async route handlers to pass errors to next() automatically */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map
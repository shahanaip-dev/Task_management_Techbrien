"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const config_1 = require("../config");
// Operational error for expected failures (e.g. validation, not found).
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Global error handler (must be registered last in Express).
function errorHandler(err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, message: err.message });
        return;
    }
    const pgErr = err;
    if (pgErr.code === '23505') {
        res.status(409).json({
            success: false,
            message: `Duplicate value: ${pgErr.detail ?? pgErr.message}`,
        });
        return;
    }
    if (pgErr.code === '23503') {
        res.status(400).json({
            success: false,
            message: 'Referenced record does not exist',
        });
        return;
    }
    console.error('[UnhandledError]', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(config_1.config.app.isDev && { stack: err.stack }),
    });
}
//# sourceMappingURL=error.middleware.js.map
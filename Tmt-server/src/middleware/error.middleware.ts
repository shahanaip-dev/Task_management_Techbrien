import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Operational / expected application error.
 * Throw this from services for known failure cases.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler — must be registered LAST in Express.
 * Handles:
 *   - AppError (operational)
 *   - PostgreSQL 23505 (unique_violation)
 *   - PostgreSQL 23503 (foreign_key_violation)
 *   - Unknown errors (500)
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── Operational error ────────────────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  const pgErr = err as any;

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
    ...(config.app.isDev && { stack: err.stack }),
  });
}

/** Wraps async route handlers to pass errors to next() automatically */
export const asyncHandler =
  (fn: (req: any, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// Operational error for expected failures (e.g. validation, not found).
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

// Global error handler (must be registered last in Express).
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  const pgErr = err as any;

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
    ...(config.app.isDev && { stack: err.stack }),
  });
}
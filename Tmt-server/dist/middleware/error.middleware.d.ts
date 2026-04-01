import { Request, Response, NextFunction } from 'express';
/**
 * Operational / expected application error.
 * Throw this from services for known failure cases.
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number, message: string);
}
/**
 * Global error handler — must be registered LAST in Express.
 * Handles:
 *   - AppError (operational)
 *   - PostgreSQL 23505 (unique_violation)
 *   - PostgreSQL 23503 (foreign_key_violation)
 *   - Unknown errors (500)
 */
export declare function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void;
/** Wraps async route handlers to pass errors to next() automatically */
export declare const asyncHandler: (fn: (req: any, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => void;

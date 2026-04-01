import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
/**
 * JWT authentication middleware.
 * Expects: Authorization: Bearer <token>
 * On success: attaches decoded user to req.user and calls next()
 * On failure: returns 401 Unauthorized
 */
export declare function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void;

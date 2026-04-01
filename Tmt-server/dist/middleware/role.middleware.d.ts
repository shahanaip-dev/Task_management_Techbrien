import { Response, NextFunction } from 'express';
import { Role, AuthenticatedRequest } from '../types';
/**
 * RBAC middleware factory.
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'EMPLOYEE')
 */
export declare function authorize(...allowedRoles: Role[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;

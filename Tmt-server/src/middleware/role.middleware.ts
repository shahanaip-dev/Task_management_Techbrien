import { Response, NextFunction } from 'express';
import { Role, AuthenticatedRequest } from '../types';

/**
 * RBAC middleware factory.
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'DEVELOPER')
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions',
      });
      return;
    }
    next();
  };
}

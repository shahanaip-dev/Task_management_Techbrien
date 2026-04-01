"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
/**
 * RBAC middleware factory.
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'EMPLOYEE')
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
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
//# sourceMappingURL=role.middleware.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
/**
 * JWT authentication middleware.
 * Expects: Authorization: Bearer <token>
 * On success: attaches decoded user to req.user and calls next()
 * On failure: returns 401 Unauthorized
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
    }
    const token = authHeader.slice(7); // remove "Bearer "
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=auth.middleware.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const response_1 = require("../utils/response");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        /**
         * POST /api/v1/auth/login
         * Body: { email, password }
         */
        this.login = async (req, res, next) => {
            try {
                const result = await this.authService.login(req.body);
                (0, response_1.sendSuccess)(res, result, 'Login successful');
            }
            catch (err) {
                next(err);
            }
        };
        /**
         * GET /api/v1/auth/me
         * Returns the currently authenticated user (from token)
         */
        this.me = async (req, res, next) => {
            try {
                (0, response_1.sendSuccess)(res, req.user, 'Authenticated user');
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
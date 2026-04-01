"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = authRouter;
const express_1 = require("express");
const auth_controller_1 = require("../../controllers/auth.controller");
const auth_service_1 = require("../../services/auth.service");
const user_repository_1 = require("../../repositories/user.repository");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_schema_1 = require("../../schemas/auth.schema");
function authRouter(db) {
    const router = (0, express_1.Router)();
    const userRepo = new user_repository_1.UserRepository(db);
    const authSvc = new auth_service_1.AuthService(userRepo);
    const controller = new auth_controller_1.AuthController(authSvc);
    router.post('/login', (0, validate_middleware_1.validateBody)(auth_schema_1.LoginSchema), controller.login);
    router.get('/me', auth_middleware_1.authenticate, controller.me);
    return router;
}
//# sourceMappingURL=auth.routes.js.map
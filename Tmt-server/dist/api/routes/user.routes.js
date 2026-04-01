"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = userRouter;
const express_1 = require("express");
const user_controller_1 = require("../../controllers/user.controller");
const user_service_1 = require("../../services/user.service");
const user_repository_1 = require("../../repositories/user.repository");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const user_schema_1 = require("../../schemas/user.schema");
function userRouter(db) {
    const router = (0, express_1.Router)();
    const userRepo = new user_repository_1.UserRepository(db);
    const userSvc = new user_service_1.UserService(userRepo);
    const controller = new user_controller_1.UserController(userSvc);
    // All user endpoints: must be authenticated + ADMIN role
    router.use(auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('ADMIN'));
    router.post('/', (0, validate_middleware_1.validateBody)(user_schema_1.CreateUserSchema), controller.createUser);
    router.get('/', controller.listUsers);
    router.get('/:id', controller.getUser);
    router.put('/:id', (0, validate_middleware_1.validateBody)(user_schema_1.UpdateUserSchema), controller.updateUser);
    router.delete('/:id', controller.deleteUser);
    return router;
}
//# sourceMappingURL=user.routes.js.map
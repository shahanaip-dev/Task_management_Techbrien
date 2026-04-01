"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const response_1 = require("../utils/response");
const error_middleware_1 = require("../middleware/error.middleware");
class UserController {
    constructor(userService) {
        this.userService = userService;
        /**
         * POST /api/v1/users
         * Admin only — creates a new user
         */
        this.createUser = async (req, res, next) => {
            try {
                const user = await this.userService.createUser(req.body);
                (0, response_1.sendCreated)(res, user, 'User created successfully');
            }
            catch (err) {
                next(err);
            }
        };
        /**
         * GET /api/v1/users
         * Admin only — lists all users with pagination
         */
        this.listUsers = async (req, res, next) => {
            try {
                const result = await this.userService.listUsers(req.query);
                (0, response_1.sendSuccess)(res, result);
            }
            catch (err) {
                next(err);
            }
        };
        /**
         * GET /api/v1/users/:id
         * Admin only â€” get user by id
         */
        this.getUser = async (req, res, next) => {
            try {
                const user = await this.userService.getUser(req.params.id);
                (0, response_1.sendSuccess)(res, user);
            }
            catch (err) {
                next(err);
            }
        };
        /**
         * PUT /api/v1/users/:id
         * Admin only â€” update user
         */
        this.updateUser = async (req, res, next) => {
            try {
                const user = await this.userService.updateUser(req.params.id, req.body);
                (0, response_1.sendSuccess)(res, user, 'User updated successfully');
            }
            catch (err) {
                next(err);
            }
        };
        /**
         * DELETE /api/v1/users/:id
         * Admin only â€” delete user
         */
        this.deleteUser = async (req, res, next) => {
            try {
                if (req.user?.id === req.params.id) {
                    return next(new error_middleware_1.AppError(400, 'You cannot delete your own account'));
                }
                await this.userService.deleteUser(req.params.id);
                (0, response_1.sendSuccess)(res, null, 'User deleted successfully');
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map
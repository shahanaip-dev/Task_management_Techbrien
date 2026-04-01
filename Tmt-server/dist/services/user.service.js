"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = require("../utils/bcrypt");
const error_middleware_1 = require("../middleware/error.middleware");
const pagination_1 = require("../utils/pagination");
class UserService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async createUser(input) {
        const exists = await this.userRepo.existsByEmail(input.email);
        if (exists) {
            throw new error_middleware_1.AppError(409, `Email "${input.email}" is already registered`);
        }
        const hashedPassword = await (0, bcrypt_1.hashPassword)(input.password);
        return this.userRepo.create({
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role: 'EMPLOYEE',
        });
    }
    async listUsers(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const [users, total] = await this.userRepo.findMany(pagination);
        return (0, pagination_1.buildPaginated)(users, total, pagination);
    }
    async getUser(id) {
        const user = await this.userRepo.findPublicById(id);
        if (!user)
            throw new error_middleware_1.AppError(404, 'User not found');
        return user;
    }
    async updateUser(id, input) {
        const existing = await this.userRepo.findById(id);
        if (!existing)
            throw new error_middleware_1.AppError(404, 'User not found');
        if (!input.name && !input.email && !input.password) {
            throw new error_middleware_1.AppError(400, 'At least one field must be provided');
        }
        if (input.email) {
            const ownerId = await this.userRepo.findIdByEmail(input.email);
            if (ownerId && ownerId !== id) {
                throw new error_middleware_1.AppError(409, `Email "${input.email}" is already registered`);
            }
        }
        const hashedPassword = input.password ? await (0, bcrypt_1.hashPassword)(input.password) : undefined;
        return this.userRepo.update(id, {
            name: input.name,
            email: input.email?.toLowerCase().trim(),
            password: hashedPassword,
            role: undefined,
        });
    }
    async deleteUser(id) {
        const user = await this.userRepo.findById(id);
        if (!user)
            throw new error_middleware_1.AppError(404, 'User not found');
        if (user.email === 'admin@tmt.com' || user.name === 'System Admin') {
            throw new error_middleware_1.AppError(403, 'System admin cannot be deleted');
        }
        await this.userRepo.delete(id);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
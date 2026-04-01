"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const error_middleware_1 = require("../middleware/error.middleware");
class AuthService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    /**
     * Validates credentials and returns a signed JWT.
     * Throws 401 if email not found or password is wrong.
     * (Same generic message prevents user enumeration.)
     */
    async login(input) {
        const user = await this.userRepo.findByEmail(input.email);
        const INVALID_CREDENTIALS = new error_middleware_1.AppError(401, 'Invalid email or password');
        if (!user)
            throw INVALID_CREDENTIALS;
        if (!user.password)
            throw INVALID_CREDENTIALS;
        const passwordMatch = await (0, bcrypt_1.comparePassword)(input.password, user.password);
        if (!passwordMatch)
            throw INVALID_CREDENTIALS;
        const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.created_at,
            },
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
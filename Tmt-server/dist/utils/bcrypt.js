"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
const hashPassword = (plain) => bcryptjs_1.default.hash(plain, SALT_ROUNDS);
exports.hashPassword = hashPassword;
const comparePassword = (plain, hashed) => bcryptjs_1.default.compare(plain, hashed);
exports.comparePassword = comparePassword;
//# sourceMappingURL=bcrypt.js.map
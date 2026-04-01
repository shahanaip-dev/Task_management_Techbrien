"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
function signToken(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, role: user.role }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
}
//# sourceMappingURL=jwt.js.map
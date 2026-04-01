"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ── Validate required env vars at startup ──────────────────────────────────
const REQUIRED = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'JWT_SECRET'];
for (const key of REQUIRED) {
    if (!process.env[key]) {
        throw new Error(`[Config] Missing required environment variable: "${key}"`);
    }
}
exports.config = {
    app: {
        env: process.env.NODE_ENV ?? 'development',
        port: parseInt(process.env.PORT ?? '5000', 10),
        isDev: process.env.NODE_ENV !== 'production',
    },
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
    },
    cors: {
        origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    },
};
//# sourceMappingURL=index.js.map
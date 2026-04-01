"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./db");
Object.defineProperty(exports, "db", { enumerable: true, get: function () { return db_1.db; } });
const config_1 = require("./config");
const api_1 = require("./api");
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
exports.app = app;
// ── Security ───────────────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ── Parsing ────────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ── Logging ────────────────────────────────────────────────────────────────
app.use((0, morgan_1.default)(config_1.config.app.isDev ? 'dev' : 'combined'));
// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/v1', (0, api_1.createV1Router)(db_1.db));
// ── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// ── Global error handler (must be last) ───────────────────────────────────
app.use(error_middleware_1.errorHandler);
// ── Start ──────────────────────────────────────────────────────────────────
const PORT = config_1.config.app.port;
app.listen(PORT, () => {
    console.log(`\n🚀 TMT Server running on http://localhost:${PORT}`);
    console.log(`   Env    : ${config_1.config.app.env}`);
    console.log(`   DB     : ${config_1.config.db.host}:${config_1.config.db.port}/${config_1.config.db.database}`);
    console.log(`   API    : http://localhost:${PORT}/api/v1\n`);
});
//# sourceMappingURL=app.js.map
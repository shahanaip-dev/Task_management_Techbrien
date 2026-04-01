"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createV1Router = createV1Router;
const express_1 = require("express");
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const project_routes_1 = require("./routes/project.routes");
const task_routes_1 = require("./routes/task.routes");
function createV1Router(db) {
    const router = (0, express_1.Router)();
    router.use('/auth', (0, auth_routes_1.authRouter)(db));
    router.use('/users', (0, user_routes_1.userRouter)(db));
    router.use('/projects', (0, project_routes_1.projectRouter)(db));
    router.use('/tasks', (0, task_routes_1.taskRouter)(db));
    // Health check
    router.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    return router;
}
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRouter = taskRouter;
const express_1 = require("express");
const task_controller_1 = require("../../controllers/task.controller");
const task_service_1 = require("../../services/task.service");
const task_repository_1 = require("../../repositories/task.repository");
const project_repository_1 = require("../../repositories/project.repository");
const user_repository_1 = require("../../repositories/user.repository");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const task_schema_1 = require("../../schemas/task.schema");
function taskRouter(db) {
    const router = (0, express_1.Router)();
    const taskRepo = new task_repository_1.TaskRepository(db);
    const projectRepo = new project_repository_1.ProjectRepository(db);
    const userRepo = new user_repository_1.UserRepository(db);
    const taskSvc = new task_service_1.TaskService(taskRepo, projectRepo, userRepo);
    const controller = new task_controller_1.TaskController(taskSvc);
    router.use(auth_middleware_1.authenticate);
    router.post('/', (0, validate_middleware_1.validateBody)(task_schema_1.CreateTaskSchema), controller.create);
    router.get('/', (0, validate_middleware_1.validateQuery)(task_schema_1.TaskQuerySchema), controller.list);
    router.get('/:id', controller.getOne);
    router.put('/:id', (0, validate_middleware_1.validateBody)(task_schema_1.UpdateTaskSchema), controller.update);
    router.patch('/:id/assign', (0, validate_middleware_1.validateBody)(task_schema_1.AssignTaskSchema), controller.assign);
    router.delete('/:id', controller.delete);
    return router;
}
//# sourceMappingURL=task.routes.js.map
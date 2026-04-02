"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = projectRouter;
const express_1 = require("express");
const project_controller_1 = require("../../controllers/project.controller");
const project_service_1 = require("../../services/project.service");
const project_repository_1 = require("../../repositories/project.repository");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const project_schema_1 = require("../../schemas/project.schema");
function projectRouter(db) {
    const router = (0, express_1.Router)();
    const projectRepo = new project_repository_1.ProjectRepository(db);
    const projectSvc = new project_service_1.ProjectService(projectRepo);
    const controller = new project_controller_1.ProjectController(projectSvc);
    router.use(auth_middleware_1.authenticate);
    router.post('/', (0, role_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validateBody)(project_schema_1.CreateProjectSchema), controller.create);
    router.get('/', (0, validate_middleware_1.validateQuery)(project_schema_1.ProjectQuerySchema), controller.list);
    router.get('/:id', controller.getOne);
    router.put('/:id', (0, role_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validateBody)(project_schema_1.UpdateProjectSchema), controller.update);
    router.delete('/:id', (0, role_middleware_1.authorize)('ADMIN'), controller.delete);
    return router;
}
//# sourceMappingURL=project.routes.js.map
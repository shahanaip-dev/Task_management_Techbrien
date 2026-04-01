"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const response_1 = require("../utils/response");
class ProjectController {
    constructor(projectService) {
        this.projectService = projectService;
        /** POST /api/v1/projects */
        this.create = async (req, res, next) => {
            try {
                const project = await this.projectService.createProject(req.body, req.user.id);
                (0, response_1.sendCreated)(res, project, 'Project created');
            }
            catch (err) {
                next(err);
            }
        };
        /** GET /api/v1/projects */
        this.list = async (req, res, next) => {
            try {
                const result = await this.projectService.listProjects(req.query, req.user);
                (0, response_1.sendSuccess)(res, result);
            }
            catch (err) {
                next(err);
            }
        };
        /** GET /api/v1/projects/:id */
        this.getOne = async (req, res, next) => {
            try {
                const project = await this.projectService.getProject(req.params.id, req.user);
                (0, response_1.sendSuccess)(res, project);
            }
            catch (err) {
                next(err);
            }
        };
        /** PUT /api/v1/projects/:id */
        this.update = async (req, res, next) => {
            try {
                const project = await this.projectService.updateProject(req.params.id, req.body);
                (0, response_1.sendSuccess)(res, project, 'Project updated');
            }
            catch (err) {
                next(err);
            }
        };
        /** DELETE /api/v1/projects/:id */
        this.delete = async (req, res, next) => {
            try {
                await this.projectService.deleteProject(req.params.id);
                (0, response_1.sendSuccess)(res, null, 'Project deleted');
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.ProjectController = ProjectController;
//# sourceMappingURL=project.controller.js.map
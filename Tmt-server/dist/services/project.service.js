"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const pagination_1 = require("../utils/pagination");
class ProjectService {
    constructor(projectRepo) {
        this.projectRepo = projectRepo;
    }
    async createProject(input, createdBy) {
        return this.projectRepo.create({
            name: input.name,
            description: input.description,
            createdBy,
            memberIds: input.memberIds,
        });
    }
    async listProjects(query, user) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const name = typeof query.name === 'string' && query.name.trim() ? query.name.trim() : undefined;
        if (user.role === 'ADMIN') {
            const [projects, total] = await this.projectRepo.findMany(pagination, name);
            return (0, pagination_1.buildPaginated)(projects, total, pagination);
        }
        const [projects, total] = await this.projectRepo.findManyForUser(user.id, pagination, name);
        return (0, pagination_1.buildPaginated)(projects, total, pagination);
    }
    async getProject(id, user) {
        const project = user.role === 'ADMIN'
            ? await this.projectRepo.findByIdWithCreator(id)
            : await this.projectRepo.findByIdWithCreatorForUser(id, user.id);
        if (!project)
            throw new error_middleware_1.AppError(404, 'Project not found');
        return project;
    }
    async updateProject(id, input) {
        const project = await this.projectRepo.findById(id);
        if (!project)
            throw new error_middleware_1.AppError(404, 'Project not found');
        return this.projectRepo.update(id, {
            name: input.name,
            description: input.description,
            memberIds: input.memberIds,
        });
    }
    async deleteProject(id) {
        const project = await this.projectRepo.findById(id);
        if (!project)
            throw new error_middleware_1.AppError(404, 'Project not found');
        await this.projectRepo.delete(id);
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=project.service.js.map
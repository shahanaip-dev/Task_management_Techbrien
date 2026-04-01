"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const pagination_1 = require("../utils/pagination");
class TaskService {
    constructor(taskRepo, projectRepo, userRepo) {
        this.taskRepo = taskRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
    }
    async createTask(input, user) {
        const project = await this.projectRepo.findById(input.projectId);
        if (!project)
            throw new error_middleware_1.AppError(404, 'Project not found');
        if (user?.role === 'EMPLOYEE') {
            const isMember = await this.projectRepo.isMember(input.projectId, user.id);
            if (!isMember)
                throw new error_middleware_1.AppError(403, 'You are not a member of this project');
        }
        if (input.assignedTo) {
            const user = await this.userRepo.findById(input.assignedTo);
            if (!user)
                throw new error_middleware_1.AppError(404, 'Assigned user not found');
        }
        return this.taskRepo.create({
            title: input.title,
            description: input.description,
            projectId: input.projectId,
            assignedTo: input.assignedTo,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        });
    }
    async listTasks(query, user) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const filters = {
            projectId: query.projectId,
            status: query.status,
            assignedTo: query.assignedTo,
            title: query.title,
            description: query.description,
            dueDate: query.dueDate,
        };
        if (user?.role === 'EMPLOYEE') {
            filters.assignedTo = user.id;
        }
        const [tasks, total] = await this.taskRepo.findMany(filters, pagination);
        return (0, pagination_1.buildPaginated)(tasks, total, pagination);
    }
    async getTask(id, user) {
        const task = await this.taskRepo.findByIdWithRelations(id);
        if (!task)
            throw new error_middleware_1.AppError(404, 'Task not found');
        if (user?.role === 'EMPLOYEE' && task.assigned_to !== user.id) {
            throw new error_middleware_1.AppError(403, 'You do not have access to this task');
        }
        return task;
    }
    async updateTask(id, input) {
        const task = await this.taskRepo.findById(id);
        if (!task)
            throw new error_middleware_1.AppError(404, 'Task not found');
        if (input.assignedTo) {
            const user = await this.userRepo.findById(input.assignedTo);
            if (!user)
                throw new error_middleware_1.AppError(404, 'Assigned user not found');
        }
        return this.taskRepo.update(id, {
            title: input.title,
            description: input.description,
            status: input.status,
            assignedTo: input.assignedTo,
            dueDate: input.dueDate ? new Date(input.dueDate) : input.dueDate,
        });
    }
    async assignTask(id, input) {
        const task = await this.taskRepo.findById(id);
        if (!task)
            throw new error_middleware_1.AppError(404, 'Task not found');
        const user = await this.userRepo.findById(input.assignedTo);
        if (!user)
            throw new error_middleware_1.AppError(404, 'User not found');
        return this.taskRepo.update(id, { assignedTo: input.assignedTo });
    }
    async deleteTask(id) {
        const task = await this.taskRepo.findById(id);
        if (!task)
            throw new error_middleware_1.AppError(404, 'Task not found');
        await this.taskRepo.delete(id);
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=task.service.js.map
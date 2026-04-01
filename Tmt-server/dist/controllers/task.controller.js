"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const response_1 = require("../utils/response");
class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
        /** POST /api/v1/tasks */
        this.create = async (req, res, next) => {
            try {
                const task = await this.taskService.createTask(req.body, req.user);
                (0, response_1.sendCreated)(res, task, 'Task created');
            }
            catch (err) {
                next(err);
            }
        };
        /** GET /api/v1/tasks */
        this.list = async (req, res, next) => {
            try {
                const result = await this.taskService.listTasks(req.query, req.user);
                (0, response_1.sendSuccess)(res, result);
            }
            catch (err) {
                next(err);
            }
        };
        /** GET /api/v1/tasks/:id */
        this.getOne = async (req, res, next) => {
            try {
                const task = await this.taskService.getTask(req.params.id, req.user);
                (0, response_1.sendSuccess)(res, task);
            }
            catch (err) {
                next(err);
            }
        };
        /** PUT /api/v1/tasks/:id */
        this.update = async (req, res, next) => {
            try {
                const task = await this.taskService.updateTask(req.params.id, req.body);
                (0, response_1.sendSuccess)(res, task, 'Task updated');
            }
            catch (err) {
                next(err);
            }
        };
        /** PATCH /api/v1/tasks/:id/assign */
        this.assign = async (req, res, next) => {
            try {
                const task = await this.taskService.assignTask(req.params.id, req.body);
                (0, response_1.sendSuccess)(res, task, 'Task assigned');
            }
            catch (err) {
                next(err);
            }
        };
        /** DELETE /api/v1/tasks/:id */
        this.delete = async (req, res, next) => {
            try {
                await this.taskService.deleteTask(req.params.id);
                (0, response_1.sendSuccess)(res, null, 'Task deleted');
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=task.controller.js.map
import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils/response';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /** POST /api/v1/tasks */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.taskService.createTask(req.body, req.user);
      sendCreated(res, task, 'Task created');
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/tasks */
  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.taskService.listTasks(req.query as Record<string, unknown>, req.user);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/tasks/:id */
  getOne = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.taskService.getTask(req.params.id, req.user);
      sendSuccess(res, task);
    } catch (err) {
      next(err);
    }
  };

  /** PUT /api/v1/tasks/:id */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.taskService.updateTask(req.params.id, req.body);
      sendSuccess(res, task, 'Task updated');
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/v1/tasks/:id/assign */
  assign = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.taskService.assignTask(req.params.id, req.body);
      sendSuccess(res, task, 'Task assigned');
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/v1/tasks/:id */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.taskService.deleteTask(req.params.id);
      sendSuccess(res, null, 'Task deleted');
    } catch (err) {
      next(err);
    }
  };
}

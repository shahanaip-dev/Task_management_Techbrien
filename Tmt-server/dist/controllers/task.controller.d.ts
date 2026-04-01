import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest } from '../types';
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    /** POST /api/v1/tasks */
    create: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /** GET /api/v1/tasks */
    list: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /** GET /api/v1/tasks/:id */
    getOne: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /** PUT /api/v1/tasks/:id */
    update: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /** PATCH /api/v1/tasks/:id/assign */
    assign: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /** DELETE /api/v1/tasks/:id */
    delete: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}

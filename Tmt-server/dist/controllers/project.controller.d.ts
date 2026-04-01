import { Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { AuthenticatedRequest } from '../types';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    /** POST /api/v1/projects */
    create: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /** GET /api/v1/projects */
    list: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /** GET /api/v1/projects/:id */
    getOne: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /** PUT /api/v1/projects/:id */
    update: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /** DELETE /api/v1/projects/:id */
    delete: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}

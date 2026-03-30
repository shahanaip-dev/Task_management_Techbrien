import { Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils/response';

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /** POST /api/v1/projects */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.projectService.createProject(req.body, req.user.id);
      sendCreated(res, project, 'Project created');
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/projects */
  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.projectService.listProjects(req.query as Record<string, unknown>, req.user);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/projects/:id */
  getOne = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.projectService.getProject(req.params.id, req.user);
      sendSuccess(res, project);
    } catch (err) {
      next(err);
    }
  };

  /** PUT /api/v1/projects/:id */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this.projectService.updateProject(req.params.id, req.body);
      sendSuccess(res, project, 'Project updated');
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/v1/projects/:id */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.projectService.deleteProject(req.params.id);
      sendSuccess(res, null, 'Project deleted');
    } catch (err) {
      next(err);
    }
  };
}

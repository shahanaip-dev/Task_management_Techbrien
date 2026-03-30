import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { UserService } from '../services/user.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AppError } from '../middleware/error.middleware';

export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * POST /api/v1/users
   * Admin only — creates a new user
   */
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      sendCreated(res, user, 'User created successfully');
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/users
   * Admin only — lists all users with pagination
   */
  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userService.listUsers(req.query as Record<string, unknown>);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/users/:id
   * Admin only â€” get user by id
   */
  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUser(req.params.id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /api/v1/users/:id
   * Admin only â€” update user
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      sendSuccess(res, user, 'User updated successfully');
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /api/v1/users/:id
   * Admin only â€” delete user
   */
  deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.id === req.params.id) {
        return next(new AppError(400, 'You cannot delete your own account'));
      }
      await this.userService.deleteUser(req.params.id);
      sendSuccess(res, null, 'User deleted successfully');
    } catch (err) {
      next(err);
    }
  };
}

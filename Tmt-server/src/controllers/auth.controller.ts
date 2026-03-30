import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Body: { email, password }
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/auth/me
   * Returns the currently authenticated user (from token)
   */
  me = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, req.user, 'Authenticated user');
    } catch (err) {
      next(err);
    }
  };
}

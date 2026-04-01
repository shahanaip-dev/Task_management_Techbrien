import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    /**
     * POST /api/v1/auth/login
     * Body: { email, password }
     */
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /api/v1/auth/me
     * Returns the currently authenticated user (from token)
     */
    me: (req: any, res: Response, next: NextFunction) => Promise<void>;
}

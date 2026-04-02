import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { UserService } from '../services/user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    /**
     * POST /api/v1/users
     * Admin only � creates a new user
     */
    createUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /api/v1/users
     * Admin only � lists all users with pagination
     */
    listUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * GET /api/v1/users/:id
     * Admin only � get user by id
     */
    getUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * PUT /api/v1/users/:id
     * Admin only � update user
     */
    updateUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * DELETE /api/v1/users/:id
     * Admin only � delete user
     */
    deleteUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
    /**
     * PATCH /api/v1/users/me/password
     * Authenticated user � change own password
     */
    changePassword: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}

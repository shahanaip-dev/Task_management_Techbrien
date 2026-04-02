import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../types';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    /** GET /api/v1/dashboard/summary */
    summary: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}

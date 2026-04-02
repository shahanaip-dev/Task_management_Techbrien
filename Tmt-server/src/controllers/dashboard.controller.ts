import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** GET /api/v1/dashboard/summary */
  summary = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.dashboardService.getSummary(req.user);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };
}
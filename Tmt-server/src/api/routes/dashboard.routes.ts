import { Router } from 'express';
import { Pool } from 'pg';
import { DashboardController } from '../../controllers/dashboard.controller';
import { DashboardService } from '../../services/dashboard.service';
import { authenticate } from '../../middleware/auth.middleware';

export function dashboardRouter(db: Pool): Router {
  const router = Router();
  const dashboardSvc = new DashboardService(db);
  const controller = new DashboardController(dashboardSvc);

  router.use(authenticate as any);

  router.get('/summary', controller.summary as any);

  return router;
}
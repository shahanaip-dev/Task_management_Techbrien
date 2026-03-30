import { Router } from 'express';
import { Pool } from 'pg';
import { authRouter }    from './routes/auth.routes';
import { userRouter }    from './routes/user.routes';
import { projectRouter } from './routes/project.routes';
import { taskRouter }    from './routes/task.routes';

export function createV1Router(db: Pool): Router {
  const router = Router();

  router.use('/auth',     authRouter(db));
  router.use('/users',    userRouter(db));
  router.use('/projects', projectRouter(db));
  router.use('/tasks',    taskRouter(db));

  // Health check
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}

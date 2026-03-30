import { Router } from 'express';
import { Pool } from 'pg';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService }    from '../../services/auth.service';
import { UserRepository } from '../../repositories/user.repository';
import { authenticate }   from '../../middleware/auth.middleware';
import { validateBody }   from '../../middleware/validate.middleware';
import { LoginSchema }    from '../../schemas/auth.schema';

export function authRouter(db: Pool): Router {
  const router     = Router();
  const userRepo   = new UserRepository(db);
  const authSvc    = new AuthService(userRepo);
  const controller = new AuthController(authSvc);

  router.post('/login', validateBody(LoginSchema), controller.login);
  router.get('/me',     authenticate,              controller.me);

  return router;
}

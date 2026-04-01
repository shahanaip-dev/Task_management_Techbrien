import { Router } from 'express';
import { Pool } from 'pg';
import { UserController } from '../../controllers/user.controller';
import { UserService }    from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import { authenticate }   from '../../middleware/auth.middleware';
import { authorize }      from '../../middleware/role.middleware';
import { validateBody }   from '../../middleware/validate.middleware';
import { CreateUserSchema, UpdateUserSchema } from '../../schemas/user.schema';

export function userRouter(db: Pool): Router {
  const router     = Router();
  const userRepo   = new UserRepository(db);
  const userSvc    = new UserService(userRepo);
  const controller = new UserController(userSvc);

  // All user endpoints: must be authenticated + ADMIN role
  router.use(authenticate as any, authorize('ADMIN') as any);

  router.post('/', validateBody(CreateUserSchema), controller.createUser as any);
  router.get('/',  controller.listUsers as any);
  router.get('/:id', controller.getUser as any);
  router.put('/:id', validateBody(UpdateUserSchema), controller.updateUser as any);
  router.delete('/:id', controller.deleteUser as any);

  return router;
}

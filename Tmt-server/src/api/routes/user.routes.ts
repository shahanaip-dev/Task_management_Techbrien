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
  router.use(authenticate, authorize('ADMIN'));

  router.post('/', validateBody(CreateUserSchema), controller.createUser);
  router.get('/',  controller.listUsers);
  router.get('/:id', controller.getUser);
  router.put('/:id', validateBody(UpdateUserSchema), controller.updateUser);
  router.delete('/:id', controller.deleteUser);

  return router;
}

import { Router } from 'express';
import { Pool } from 'pg';
import { UserController } from '../../controllers/user.controller';
import { UserService }    from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import { authenticate }   from '../../middleware/auth.middleware';
import { authorize }      from '../../middleware/role.middleware';
import { validateBody, validateQuery }   from '../../middleware/validate.middleware';
import { CreateUserSchema, UpdateUserSchema, UserQuerySchema, ChangePasswordSchema } from '../../schemas/user.schema';

export function userRouter(db: Pool): Router {
  const router     = Router();
  const userRepo   = new UserRepository(db);
  const userSvc    = new UserService(userRepo);
  const controller = new UserController(userSvc);

  // Self-service: change own password
  router.patch('/me/password', authenticate as any, validateBody(ChangePasswordSchema), controller.changePassword as any);

  // All other user endpoints: must be authenticated + ADMIN role
  router.use(authenticate as any, authorize('ADMIN') as any);

  router.post('/', validateBody(CreateUserSchema), controller.createUser as any);
  router.get('/',  validateQuery(UserQuerySchema), controller.listUsers as any);
  router.get('/:id', controller.getUser as any);
  router.put('/:id', validateBody(UpdateUserSchema), controller.updateUser as any);
  router.delete('/:id', controller.deleteUser as any);

  return router;
}

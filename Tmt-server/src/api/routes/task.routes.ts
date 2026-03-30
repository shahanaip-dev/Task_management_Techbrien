import { Router } from 'express';
import { Pool } from 'pg';
import { TaskController }    from '../../controllers/task.controller';
import { TaskService }       from '../../services/task.service';
import { TaskRepository }    from '../../repositories/task.repository';
import { ProjectRepository } from '../../repositories/project.repository';
import { UserRepository }    from '../../repositories/user.repository';
import { authenticate }      from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  AssignTaskSchema,
  TaskQuerySchema,
} from '../../schemas/task.schema';

export function taskRouter(db: Pool): Router {
  const router      = Router();
  const taskRepo    = new TaskRepository(db);
  const projectRepo = new ProjectRepository(db);
  const userRepo    = new UserRepository(db);
  const taskSvc     = new TaskService(taskRepo, projectRepo, userRepo);
  const controller  = new TaskController(taskSvc);

  router.use(authenticate);

  router.post('/',              validateBody(CreateTaskSchema),  controller.create);
  router.get('/',               validateQuery(TaskQuerySchema),  controller.list);
  router.get('/:id',            controller.getOne);
  router.put('/:id',            validateBody(UpdateTaskSchema),  controller.update);
  router.patch('/:id/assign',   validateBody(AssignTaskSchema),  controller.assign);
  router.delete('/:id',         controller.delete);

  return router;
}

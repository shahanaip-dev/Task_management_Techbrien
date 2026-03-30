import { Router } from 'express';
import { Pool } from 'pg';
import { ProjectController } from '../../controllers/project.controller';
import { ProjectService }    from '../../services/project.service';
import { ProjectRepository } from '../../repositories/project.repository';
import { authenticate }      from '../../middleware/auth.middleware';
import { authorize }         from '../../middleware/role.middleware';
import { validateBody }      from '../../middleware/validate.middleware';
import { CreateProjectSchema, UpdateProjectSchema } from '../../schemas/project.schema';

export function projectRouter(db: Pool): Router {
  const router      = Router();
  const projectRepo = new ProjectRepository(db);
  const projectSvc  = new ProjectService(projectRepo);
  const controller  = new ProjectController(projectSvc);

  router.use(authenticate);

  router.post('/',    authorize('ADMIN'), validateBody(CreateProjectSchema), controller.create);
  router.get('/',     controller.list);
  router.get('/:id',  controller.getOne);
  router.put('/:id',  authorize('ADMIN'), validateBody(UpdateProjectSchema), controller.update);
  router.delete('/:id', authorize('ADMIN'), controller.delete);

  return router;
}

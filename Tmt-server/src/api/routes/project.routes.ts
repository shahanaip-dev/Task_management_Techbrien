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

  router.use(authenticate as any);

  router.post('/',    authorize('ADMIN') as any, validateBody(CreateProjectSchema), controller.create as any);
  router.get('/',     controller.list as any);
  router.get('/:id',  controller.getOne as any);
  router.put('/:id',  authorize('ADMIN') as any, validateBody(UpdateProjectSchema), controller.update as any);
  router.delete('/:id', authorize('ADMIN') as any, controller.delete as any);

  return router;
}

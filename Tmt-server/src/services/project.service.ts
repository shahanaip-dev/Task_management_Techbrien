import { ProjectRepository } from '../repositories/project.repository';
import { AppError } from '../middleware/error.middleware';
import { parseCursorPagination } from '../utils/pagination';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';
import { JwtUser } from '../types';

export class ProjectService {
  constructor(private readonly projectRepo: ProjectRepository) {}

  async createProject(input: CreateProjectInput, createdBy: string) {
    return this.projectRepo.create({
      name:        input.name,
      description: input.description,
      createdBy,
      memberIds:   input.memberIds,
    });
  }

  async listProjects(query: Record<string, unknown>, user: JwtUser) {
    const pagination = parseCursorPagination(query);
    const name = typeof query.name === 'string' && query.name.trim() ? query.name.trim() : undefined;

    if (user.role === 'ADMIN') {
      return this.projectRepo.findMany(pagination, name);
    }
    return this.projectRepo.findManyForUser(user.id, pagination, name);
  }

  async getProject(id: string, user: JwtUser) {
    const project = user.role === 'ADMIN'
      ? await this.projectRepo.findByIdWithCreator(id)
      : await this.projectRepo.findByIdWithCreatorForUser(id, user.id);
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }

  async updateProject(id: string, input: UpdateProjectInput) {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new AppError(404, 'Project not found');
    return this.projectRepo.update(id, {
      name:        input.name,
      description: input.description,
      memberIds:   input.memberIds,
    });
  }

  async deleteProject(id: string) {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new AppError(404, 'Project not found');
    await this.projectRepo.delete(id);
  }
}
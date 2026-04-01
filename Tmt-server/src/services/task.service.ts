import { TaskRepository }    from '../repositories/task.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { UserRepository }    from '../repositories/user.repository';
import { AppError }          from '../middleware/error.middleware';
import { buildPaginated, parsePagination } from '../utils/pagination';
import { TaskFilters, TaskStatus } from '../types';
import {
  CreateTaskInput,
  UpdateTaskInput,
  AssignTaskInput,
} from '../schemas/task.schema';

export class TaskService {
  constructor(
    private readonly taskRepo:    TaskRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly userRepo:    UserRepository
  ) {}

  async createTask(input: CreateTaskInput, user?: { id: string; role: string }) {
    const project = await this.projectRepo.findById(input.projectId);
    if (!project) throw new AppError(404, 'Project not found');

    if (user?.role === 'EMPLOYEE') {
      const isMember = await this.projectRepo.isMember(input.projectId, user.id);
      if (!isMember) throw new AppError(403, 'You are not a member of this project');
    }

    const finalAssignedTo = input.assignedTo || user?.id;

    if (finalAssignedTo) {
      const assigneeUser = await this.userRepo.findById(finalAssignedTo);
      if (!assigneeUser) throw new AppError(404, 'Assigned user not found');
    }

    return this.taskRepo.create({
      title:       input.title,
      description: input.description,
      projectId:   input.projectId,
      assignedTo:  finalAssignedTo,
      dueDate:     input.dueDate ? new Date(input.dueDate) : undefined,
    });
  }

  async listTasks(query: Record<string, unknown>, user?: { id: string; role: string }) {
    const pagination = parsePagination(query);
    const filters: TaskFilters = {
      projectId:  query.projectId  as string | undefined,
      status:     query.status     as TaskStatus | undefined,
      assignedTo: query.assignedTo as string | undefined,
      title:      query.title      as string | undefined,
      description: query.description as string | undefined,
      dueDate:    query.dueDate    as string | undefined,
    };
    if (user?.role === 'EMPLOYEE') {
      filters.assignedTo = user.id;
    }
    const [tasks, total] = await this.taskRepo.findMany(filters, pagination);
    return buildPaginated(tasks, total, pagination);
  }

  async getTask(id: string, user?: { id: string; role: string }) {
    const task = await this.taskRepo.findByIdWithRelations(id);
    if (!task) throw new AppError(404, 'Task not found');
    if (user?.role === 'EMPLOYEE' && task.assigned_to !== user.id) {
      throw new AppError(403, 'You do not have access to this task');
    }
    return task;
  }

  async updateTask(id: string, input: UpdateTaskInput) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new AppError(404, 'Task not found');

    if (input.assignedTo) {
      const user = await this.userRepo.findById(input.assignedTo);
      if (!user) throw new AppError(404, 'Assigned user not found');
    }

    return this.taskRepo.update(id, {
      title:       input.title,
      description: input.description,
      status:      input.status as TaskStatus | undefined,
      assignedTo:  input.assignedTo,
      dueDate:     input.dueDate ? new Date(input.dueDate) : (input.dueDate as null | undefined),
    });
  }

  async assignTask(id: string, input: AssignTaskInput) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new AppError(404, 'Task not found');

    const user = await this.userRepo.findById(input.assignedTo);
    if (!user) throw new AppError(404, 'User not found');

    return this.taskRepo.update(id, { assignedTo: input.assignedTo });
  }

  async deleteTask(id: string) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new AppError(404, 'Task not found');
    await this.taskRepo.delete(id);
  }
}

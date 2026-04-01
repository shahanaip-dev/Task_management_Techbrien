import { TaskRepository } from '../repositories/task.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { UserRepository } from '../repositories/user.repository';
import { CreateTaskInput, UpdateTaskInput, AssignTaskInput } from '../schemas/task.schema';
export declare class TaskService {
    private readonly taskRepo;
    private readonly projectRepo;
    private readonly userRepo;
    constructor(taskRepo: TaskRepository, projectRepo: ProjectRepository, userRepo: UserRepository);
    createTask(input: CreateTaskInput, user?: {
        id: string;
        role: string;
    }): Promise<import("../types").Task>;
    listTasks(query: Record<string, unknown>, user?: {
        id: string;
        role: string;
    }): Promise<import("../types").PaginatedResult<import("../types").Task>>;
    getTask(id: string, user?: {
        id: string;
        role: string;
    }): Promise<import("../types").Task>;
    updateTask(id: string, input: UpdateTaskInput): Promise<import("../types").Task>;
    assignTask(id: string, input: AssignTaskInput): Promise<import("../types").Task>;
    deleteTask(id: string): Promise<void>;
}

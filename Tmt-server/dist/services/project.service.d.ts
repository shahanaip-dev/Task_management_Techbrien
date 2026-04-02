import { ProjectRepository } from '../repositories/project.repository';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';
import { JwtUser } from '../types';
export declare class ProjectService {
    private readonly projectRepo;
    constructor(projectRepo: ProjectRepository);
    createProject(input: CreateProjectInput, createdBy: string): Promise<import("../types").Project>;
    listProjects(query: Record<string, unknown>, user: JwtUser): Promise<import("../types").CursorResult<import("../types").Project>>;
    getProject(id: string, user: JwtUser): Promise<import("../types").Project>;
    updateProject(id: string, input: UpdateProjectInput): Promise<import("../types").Project>;
    deleteProject(id: string): Promise<void>;
}

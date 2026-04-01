import { Pool } from 'pg';
import { Project, PaginationParams } from '../types';
export declare class ProjectRepository {
    private readonly db;
    constructor(db: Pool);
    findById(id: string): Promise<Project | null>;
    findByIdWithCreator(id: string): Promise<Project | null>;
    create(data: {
        name: string;
        description?: string;
        createdBy: string;
        memberIds?: string[];
    }): Promise<Project>;
    update(id: string, data: {
        name?: string;
        description?: string;
        memberIds?: string[];
    }): Promise<Project>;
    delete(id: string): Promise<void>;
    findMany({ limit, offset }: PaginationParams, name?: string): Promise<[Project[], number]>;
    findManyForUser(userId: string, { limit, offset }: PaginationParams, name?: string): Promise<[Project[], number]>;
    findByIdWithCreatorForUser(id: string, userId: string): Promise<Project | null>;
    isMember(projectId: string, userId: string): Promise<boolean>;
}

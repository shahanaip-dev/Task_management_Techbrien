import { Pool } from 'pg';
import { Project, CursorParams, CursorResult } from '../types';
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
    findMany({ limit, cursor }: CursorParams, name?: string): Promise<CursorResult<Project>>;
    findManyForUser(userId: string, { limit, cursor }: CursorParams, name?: string): Promise<CursorResult<Project>>;
    findByIdWithCreatorForUser(id: string, userId: string): Promise<Project | null>;
    isMember(projectId: string, userId: string): Promise<boolean>;
}

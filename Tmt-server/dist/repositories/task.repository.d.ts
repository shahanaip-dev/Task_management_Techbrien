import { Pool } from 'pg';
import { Task, TaskStatus, TaskFilters, PaginationParams } from '../types';
export declare class TaskRepository {
    private readonly db;
    constructor(db: Pool);
    findById(id: string): Promise<Task | null>;
    findByIdWithRelations(id: string): Promise<Task | null>;
    create(data: {
        title: string;
        description?: string;
        projectId: string;
        assignedTo?: string;
        dueDate?: Date;
    }): Promise<Task>;
    update(id: string, data: {
        title?: string;
        description?: string;
        status?: TaskStatus;
        assignedTo?: string | null;
        dueDate?: Date | null;
    }): Promise<Task>;
    delete(id: string): Promise<void>;
    findMany(filters: TaskFilters, { limit, offset }: PaginationParams): Promise<[Task[], number]>;
    private mapRow;
}

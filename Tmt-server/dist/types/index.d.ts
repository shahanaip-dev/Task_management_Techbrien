import { Request } from 'express';
export type Role = 'ADMIN' | 'EMPLOYEE';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export interface AuthenticatedRequest extends Request {
    user: JwtUser;
}
export interface JwtUser {
    id: string;
    email: string;
    role: Role;
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
    iat?: number;
    exp?: number;
}
export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: Role;
    createdAt: Date;
}
export interface Project {
    id: string;
    name: string;
    description: string | null;
    createdBy: string;
    createdAt: Date;
    creator?: Pick<User, 'id' | 'name' | 'email'>;
    taskCount?: number;
    memberIds?: string[];
}
export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    projectId: string;
    assignedTo: string | null;
    dueDate: Date | null;
    createdAt: Date;
    project?: Pick<Project, 'id' | 'name'>;
    assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
}
export interface PaginationParams {
    limit: number;
    offset: number;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        limit: number;
        offset: number;
        totalPages: number;
        currentPage: number;
    };
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: string[];
}
export interface TaskFilters {
    projectId?: string;
    status?: TaskStatus;
    assignedTo?: string;
    title?: string;
    description?: string;
    dueDate?: string;
}

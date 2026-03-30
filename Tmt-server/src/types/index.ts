import { Request } from 'express';

// ── Domain enums ───────────────────────────────────────────────────────────
export type Role       = 'ADMIN' | 'EMPLOYEE';
export type TaskStatus = 'TODO'  | 'IN_PROGRESS' | 'DONE';

// ── Authenticated request (after JWT middleware) ───────────────────────────
export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

export interface JwtUser {
  id:    string;
  email: string;
  role:  Role;
}

// ── JWT token payload ──────────────────────────────────────────────────────
export interface JwtPayload {
  sub:   string;
  email: string;
  role:  Role;
  iat?:  number;
  exp?:  number;
}

// ── Domain models (mirror DB columns) ─────────────────────────────────────
export interface User {
  id:         string;
  name:       string;
  email:      string;
  password?:  string;   // excluded in most responses
  role:       Role;
  created_at: Date;
}

export interface Project {
  id:          string;
  name:        string;
  description: string | null;
  created_by:  string;
  created_at:  Date;
  creator?:    Pick<User, 'id' | 'name' | 'email'>;
  task_count?: number;
}

export interface Task {
  id:          string;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  project_id:  string;
  assigned_to: string | null;
  due_date:    Date | null;
  created_at:  Date;
  project?:    Pick<Project, 'id' | 'name'>;
  assignee?:   Pick<User, 'id' | 'name' | 'email'> | null;
}

// ── Pagination ─────────────────────────────────────────────────────────────
export interface PaginationParams {
  limit:  number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total:       number;
    limit:       number;
    offset:      number;
    totalPages:  number;
    currentPage: number;
  };
}

// ── API envelope ───────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success:  boolean;
  message?: string;
  data?:    T;
  errors?:  string[];
}

// ── Task query filters ─────────────────────────────────────────────────────
export interface TaskFilters {
  projectId?:  string;
  status?:     TaskStatus;
  assignedTo?: string;
  title?:      string;
  description?: string;
  dueDate?:    string;
}

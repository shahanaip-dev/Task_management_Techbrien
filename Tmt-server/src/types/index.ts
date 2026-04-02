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

// ── Domain models (mirror DB columns, mapped to camelCase in repositories) ──
export interface User {
  id:         string;
  name:       string;
  email:      string;
  password?:  string;   // excluded in most responses
  role:       Role;
  createdAt:  Date;
}

export interface Project {
  id:          string;
  name:        string;
  description: string | null;
  createdBy:   string;
  createdAt:   Date;
  creator?:    Pick<User, 'id' | 'name' | 'email'>;
  taskCount?:  number;
  memberIds?:  string[];
}

export interface Task {
  id:          string;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  projectId:   string;
  assignedTo:  string | null;
  dueDate:     Date | null;
  createdAt:   Date;
  project?:    Pick<Project, 'id' | 'name'>;
  assignee?:   Pick<User, 'id' | 'name' | 'email'> | null;
}

// ── Pagination ─────────────────────────────────────────────────────────────
export interface CursorParams {
  limit:  number;
  cursor?: string;
}

export interface CursorResult<T> {
  data: T[];
  meta: {
    limit:     number;
    hasMore:   boolean;
    nextCursor?: string;
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

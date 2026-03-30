// ── Enums ──────────────────────────────────────────────────────────────────
export type Role       = 'ADMIN' | 'DEVELOPER';
export type TaskStatus = 'TODO'  | 'IN_PROGRESS' | 'DONE';

// ── Domain models ──────────────────────────────────────────────────────────
export interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      Role;
  createdAt?: string;
  created_at?: string;
}

export interface Project {
  id:          string;
  name:        string;
  description: string | null;
  createdBy:   string;
  createdAt:   string;
  creator?:    Pick<User, 'id' | 'name' | 'email'>;
  _count?:     { tasks: number };
}

export interface Task {
  id:          string;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  projectId:   string;
  assignedTo:  string | null;
  dueDate:     string | null;
  createdAt:   string;
  project?:    Pick<Project, 'id' | 'name'>;
  assignee?:   Pick<User, 'id' | 'name' | 'email'> | null;
}

// ── API shapes ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success:  boolean;
  message?: string;
  data?:    T;
  errors?:  string[];
}

export interface PaginatedData<T> {
  data: T[];
  meta: {
    total:       number;
    limit:       number;
    offset:      number;
    totalPages:  number;
    currentPage: number;
  };
}

// ── Auth ───────────────────────────────────────────────────────────────────
export interface LoginPayload { email: string; password: string; }
export interface AuthResponse  { token: string; user: User; }

// ── Forms ──────────────────────────────────────────────────────────────────
export interface CreateProjectForm { name: string; description?: string; }
export interface CreateUserForm {
  name:     string;
  email:    string;
  password: string;
  role:     Role;
}
export interface UpdateUserForm {
  name?:     string;
  email?:    string;
  password?: string;
  role?:     Role;
}
export interface CreateTaskForm {
  title:       string;
  description?: string;
  projectId:   string;
  assignedTo?: string;
  dueDate?:    string;
}
export interface TaskFilters {
  projectId?:  string;
  status?:     TaskStatus | '';
  assignedTo?: string;
}

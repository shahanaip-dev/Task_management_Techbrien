/**
 * Axios API client
 * - Automatically attaches JWT from localStorage
 * - Centralized error handling
 * - Base URL from env
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, removeToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ── Request interceptor: attach JWT ────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ──────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
      // Redirect to login only on client side
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Typed API functions ────────────────────────────────────────────────────
import type {
  LoginPayload, AuthResponse, User, Project, Task,
  PaginatedData, CreateProjectForm, CreateTaskForm,
  CreateUserForm, UpdateUserForm, ChangePasswordForm,
} from '../types';

// Auth
export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<{ data: AuthResponse }>('/auth/login', data),
  me: () =>
    apiClient.get<{ data: User }>('/auth/me'),
};

// Users
export const usersApi = {
  list: (params?: { limit?: number; cursor?: string }) =>
    apiClient.get<{ data: PaginatedData<User> }>('/users', { params }),
  getOne: (id: string) =>
    apiClient.get<{ data: User }>(`/users/${id}`),
  create: (data: CreateUserForm) =>
    apiClient.post<{ data: User }>('/users', data),
  update: (id: string, data: UpdateUserForm) =>
    apiClient.put<{ data: User }>(`/users/${id}`, data),
  changePassword: (data: ChangePasswordForm) =>
    apiClient.patch(`/users/me/password`, data),
  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),
};

// Projects
export const projectsApi = {
  list: (params?: { limit?: number; cursor?: string; name?: string }) =>
    apiClient.get<{ data: PaginatedData<Project> }>('/projects', { params }),
  getOne: (id: string) =>
    apiClient.get<{ data: Project }>(`/projects/${id}`),
  create: (data: CreateProjectForm) =>
    apiClient.post<{ data: Project }>('/projects', data),
  update: (id: string, data: Partial<CreateProjectForm>) =>
    apiClient.put<{ data: Project }>(`/projects/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),
};

// Tasks
export const tasksApi = {
  list: (params?: { limit?: number }) =>
    apiClient.get<{ data: PaginatedData<Task> }>('/tasks', { params }),
  getOne: (id: string) =>
    apiClient.get<{ data: Task }>(`/tasks/${id}`),
  create: (data: CreateTaskForm) =>
    apiClient.post<{ data: Task }>('/tasks', data),
  update: (id: string, data: Partial<CreateTaskForm & { status: string }>) =>
    apiClient.put<{ data: Task }>(`/tasks/${id}`, data),
  assign: (id: string, assignedTo: string) =>
    apiClient.patch<{ data: Task }>(`/tasks/${id}/assign`, { assignedTo }),
  delete: (id: string) =>
    apiClient.delete(`/tasks/${id}`),
};

'use client';

import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/lib/api';
import type { Task, TaskFilters, PaginatedData, CreateTaskForm } from '@/types';

export function useTasks(filters: TaskFilters = {}, initialLimit = 10) {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [meta,    setMeta]    = useState<PaginatedData<Task>['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [offset,  setOffset]  = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...filters,
        limit:  initialLimit,
        offset,
        // strip empty strings from filters
        status:     filters.status     || undefined,
        projectId:  filters.projectId  || undefined,
        assignedTo: filters.assignedTo || undefined,
        title:      filters.title      || undefined,
        description: filters.description || undefined,
        dueDate:    filters.dueDate    || undefined,
      };
      const res = await tasksApi.list(params);
      setTasks(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [offset, initialLimit, JSON.stringify(filters)]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = useCallback(async (data: CreateTaskForm) => {
    const res = await tasksApi.create(data);
    await fetchTasks();
    return res.data.data;
  }, [fetchTasks]);

  const updateTaskStatus = useCallback(async (id: string, status: string) => {
    await tasksApi.update(id, { status });
    await fetchTasks();
  }, [fetchTasks]);

  const updateTask = useCallback(async (
    id: string,
    data: Partial<CreateTaskForm> & { dueDate?: string | null; assignedTo?: string | null }
  ) => {
    await tasksApi.update(id, data);
    await fetchTasks();
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.delete(id);
    await fetchTasks();
  }, [fetchTasks]);

  return {
    tasks, meta, loading, error,
    offset, setOffset,
    createTask, updateTaskStatus, updateTask, deleteTask,
    refresh: fetchTasks,
  };
}

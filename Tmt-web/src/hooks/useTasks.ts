'use client';

import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/lib/api';
import type { Task, CreateTaskForm } from '@/types';

export function useTasks(limit = 1000) {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tasksApi.list({ limit });
      setTasks(res.data.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [limit]);

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
    tasks, loading, error,
    createTask, updateTaskStatus, updateTask, deleteTask,
    refresh: fetchTasks,
  };
}

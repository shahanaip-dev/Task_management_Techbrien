'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '@/lib/api';
import type { Project, CreateProjectForm } from '@/types';

export function useProjects(limit = 1000) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.list({ limit });
      setProjects(res.data.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = useCallback(async (data: CreateProjectForm) => {
    const res = await projectsApi.create(data);
    await fetchProjects();
    return res.data.data;
  }, [fetchProjects]);

  const updateProject = useCallback(async (id: string, data: Partial<CreateProjectForm>) => {
    const res = await projectsApi.update(id, data);
    await fetchProjects();
    return res.data.data;
  }, [fetchProjects]);

  const deleteProject = useCallback(async (id: string) => {
    await projectsApi.delete(id);
    await fetchProjects();
  }, [fetchProjects]);

  return {
    projects, loading, error,
    createProject, updateProject, deleteProject,
    refresh: fetchProjects,
  };
}

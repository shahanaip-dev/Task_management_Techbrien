'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '@/lib/api';
import type { Project, PaginatedData, CreateProjectForm } from '@/types';

export function useProjects(initialLimit = 10) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta,     setMeta]     = useState<PaginatedData<Project>['meta'] | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [offset,   setOffset]   = useState(0);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.list({ limit: initialLimit, offset });
      setProjects(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [offset, initialLimit]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = useCallback(async (data: CreateProjectForm) => {
    const res = await projectsApi.create(data);
    await fetchProjects();
    return res.data.data;
  }, [fetchProjects]);

  const deleteProject = useCallback(async (id: string) => {
    await projectsApi.delete(id);
    await fetchProjects();
  }, [fetchProjects]);

  return {
    projects, meta, loading, error,
    offset, setOffset,
    createProject, deleteProject,
    refresh: fetchProjects,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '@/lib/api';
import type { Project, PaginatedData, CreateProjectForm } from '@/types';

export function useProjects(initialLimit = 10, enabled = true) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta,     setMeta]     = useState<PaginatedData<Project>['meta'] | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.list({
        limit: initialLimit,
        cursor,
        ...(search.trim() ? { name: search.trim() } : {}),
      });
      const payload = res.data.data;
      setProjects(Array.isArray(payload?.data) ? payload.data : []);
      setMeta(payload?.meta ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [cursor, initialLimit, search]);

  useEffect(() => {
    if (!enabled) return;
    fetchProjects();
  }, [fetchProjects, enabled]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCursor(undefined);
    setCursorStack([]);
    setPage(1);
  }, []);

  const goNext = useCallback(() => {
    if (!meta?.nextCursor) return;
    setCursorStack((s) => [...s, cursor ?? '']);
    setCursor(meta.nextCursor);
    setPage((p) => p + 1);
  }, [meta, cursor]);

  const goPrev = useCallback(() => {
    if (cursorStack.length === 0) return;
    const prev = cursorStack[cursorStack.length - 1];
    setCursorStack((s) => s.slice(0, -1));
    setCursor(prev || undefined);
    setPage((p) => Math.max(1, p - 1));
  }, [cursorStack]);

  const createProject = useCallback(async (data: CreateProjectForm) => {
    const res = await projectsApi.create(data);
    if (enabled) await fetchProjects();
    return res.data.data;
  }, [fetchProjects, enabled]);

  const updateProject = useCallback(async (id: string, data: Partial<CreateProjectForm>) => {
    const res = await projectsApi.update(id, data);
    if (enabled) await fetchProjects();
    return res.data.data;
  }, [fetchProjects, enabled]);

  const deleteProject = useCallback(async (id: string) => {
    await projectsApi.delete(id);
    if (enabled) await fetchProjects();
  }, [fetchProjects, enabled]);

  return {
    projects, meta, loading, error,
    page,
    goNext, goPrev,
    setSearch: handleSearch,
    createProject, updateProject, deleteProject,
    refresh: fetchProjects,
  };
}

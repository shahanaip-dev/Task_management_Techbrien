'use client';

import { useEffect, useState } from 'react';
import { projectsApi } from '@/lib/api';
import type { Project } from '@/types';

export function useProject(projectId?: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    projectsApi.getOne(projectId)
      .then((res) => {
        if (mounted) setProject(res.data.data);
      })
      .catch((err) => {
        if (mounted) setError(err?.response?.data?.message ?? 'Failed to load project');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [projectId]);

  return { project, loading, error };
}

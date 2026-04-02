'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { projectsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Project } from '@/types';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    projectsApi.getOne(id)
      .then((res) => {
        const p = res.data.data;
        setProject(p);
        setForm({ name: p.name, description: p.description ?? '' });
      })
      .catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      const res = await projectsApi.update(project.id, {
        name: form.name.trim(),
        description: form.description || undefined,
      });
      setProject(res.data.data);
      toast.success('Project updated');
      router.push('/projects');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="secondary" size="sm" onClick={() => router.back()}>Back</Button>
        <h1 className="font-serif text-2xl font-semibold text-[#4B1414]">Project Details</h1>
      </div>

      {loading ? (
        <div className="text-sm text-[#8A8278]">Loading...</div>
      ) : !project ? (
        <div className="text-sm text-[#8A8278]">Project not found</div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-[#E8DDD4] p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#8A8278] uppercase tracking-wide">Name</p>
                <p className="text-lg text-[#1C1A18] font-semibold">{project.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#8A8278] uppercase tracking-wide">Tasks</p>
                <p className="text-lg text-[#1C1A18] font-semibold">{project.taskCount ?? 0}</p>
              </div>
            </div>
            {project.description && (
              <p className="text-sm text-[#8A8278] mt-3">{project.description}</p>
            )}
          </div>

          {isAdmin && (
            <form onSubmit={handleSave} className="bg-white rounded-lg border border-[#E8DDD4] p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <Input
                  label="Project name"
                  required
                  placeholder="Project name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-9"
                />
                <Textarea
                  label="Description"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={1}
                  className="h-9"
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit" loading={saving}>Save Changes</Button>
              </div>
            </form>
          )}
        </>
      )}
    </AppLayout>
  );
}

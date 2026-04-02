'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import Input, { Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { tasksApi, projectsApi } from '@/lib/api';
import type { Task, Project } from '@/types';

export default function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', projectId: '', dueDate: '' });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      tasksApi.getOne(id),
      projectsApi.list({ limit: 1000 }),
    ])
      .then(([taskRes, projectsRes]) => {
        const t = taskRes.data.data;
        setTask(t);
        setForm({
          title: t.title,
          description: t.description ?? '',
          projectId: t.projectId,
          dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
        });
        setProjects(projectsRes.data.data.data);
      })
      .catch(() => toast.error('Failed to load task'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    if (!form.title.trim() || !form.projectId) {
      return toast.error('Title and project are required');
    }
    setSaving(true);
    try {
      const res = await tasksApi.update(task.id, {
        title: form.title.trim(),
        description: form.description || undefined,
        projectId: form.projectId,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      });
      setTask(res.data.data);
      toast.success('Task updated');
      router.push('/tasks');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="secondary" size="sm" onClick={() => router.back()}>Back</Button>
        <h1 className="font-serif text-2xl font-semibold text-[#4B1414]">Task Details</h1>
      </div>

      {loading ? (
        <div className="text-sm text-[#8A8278]">Loading...</div>
      ) : !task ? (
        <div className="text-sm text-[#8A8278]">Task not found</div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-[#E8DDD4] p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#8A8278] uppercase tracking-wide">Title</p>
                <p className="text-lg text-[#1C1A18] font-semibold">{task.title}</p>
              </div>
              <div>
                <p className="text-xs text-[#8A8278] uppercase tracking-wide">Status</p>
                <p className="text-lg text-[#1C1A18] font-semibold">{task.status}</p>
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-[#8A8278] mt-3">{task.description}</p>
            )}
          </div>

          <form onSubmit={handleSave} className="bg-white rounded-lg border border-[#E8DDD4] p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <Input
                label="Title"
                required
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-9"
              />
              <Select
                label="Project"
                required
                options={projectOptions}
                value={form.projectId}
                placeholder="Select a project"
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              />
              <Textarea
                label="Description"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={1}
                className="h-9"
              />
              <Input
                label="Due date"
                type="date"
                placeholder="Due date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </form>
        </>
      )}
    </AppLayout>
  );
}

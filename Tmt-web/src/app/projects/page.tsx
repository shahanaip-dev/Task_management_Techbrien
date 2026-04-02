'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import ProjectCard from '@/components/projects/ProjectCard';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';

export default function ProjectsPage() {
  const { projects, loading, error, createProject, deleteProject } = useProjects(1000);
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredProjects = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, searchText]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      await createProject({ name: form.name.trim(), description: form.description || undefined });
      toast.success('Project created');
      setForm({ name: '', description: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? All tasks will be removed.')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#4B1414]">Projects</h1>
          <p className="text-sm text-[#8A8278] mt-0.5 font-light">
            {filteredProjects.length ? `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}` : '—'}
          </p>
        </div>
      </div>

      <div className="rounded-lg p-5 mb-4 bg-transparent max-w-2xl">
        <Input
          label="Search project"
          placeholder="Search project"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-lg border border-[#E8DDD4] p-5 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
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
          <div className="flex justify-end">
            <Button type="submit" loading={saving} className="w-full lg:w-auto">Create Project</Button>
          </div>
        </div>
      </form>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="h-44 bg-white rounded-lg border border-[#C6A0A0] animate-pulse" />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 text-sm text-[#8A8278]">No projects found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} onDelete={handleDelete} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

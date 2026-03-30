'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import ProjectCard from '@/components/projects/ProjectCard';
import Modal from '@/components/ui/Modal';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import type { CreateProjectForm } from '@/types';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { projects, meta, loading, error, createProject, deleteProject, offset, setOffset } = useProjects(12);

  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState<CreateProjectForm>({ name: '', description: '' });
  const [saving,    setSaving]    = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      await createProject(form);
      toast.success('Project created');
      setForm({ name: '', description: '' });
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create project');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? All tasks will be removed.')) return;
    try { await deleteProject(id); toast.success('Project deleted'); }
    catch { toast.error('Failed to delete project'); }
  };

  return (
    <AppLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#4B1414]">Projects</h1>
          <p className="text-sm text-[#8A8278] mt-0.5 font-light">
            {meta ? `${meta.total} project${meta.total !== 1 ? 's' : ''}` : '—'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowModal(true)}>+ New Project</Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
      )}

      {/* Stats row */}
      {!loading && meta && meta.total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: meta.total },
            { label: 'Active Projects', value: projects.length },
            { label: 'Total Tasks', value: projects.reduce((s, p) => s + (p._count?.tasks ?? 0), 0) },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#F1E7E7] rounded-lg border border-[#C6A0A0] px-5 py-4">
              <p className="text-xs text-[#5B2F2F] uppercase tracking-wide font-medium">{stat.label}</p>
              <p className="font-serif text-2xl font-semibold text-[#4B1414] mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-lg border border-[#C6A0A0] animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-14 h-14 bg-[#F5E6DC] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-[#7D1F1F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-semibold text-[#4B1414] mb-2">
            {isAdmin ? 'No projects yet' : 'No assigned projects'}
          </h3>
          <p className="text-sm text-[#8A8278] mb-7 font-light">
            {isAdmin ? 'Create your first project to get started' : 'You have not been assigned to any projects'}
          </p>
          {isAdmin && <Button onClick={() => setShowModal(true)}>Create Project</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onDelete={handleDelete} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12">
          <Button variant="secondary" size="sm" disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - 12))}>← Previous</Button>
          <span className="text-sm text-[#8A8278]">Page {meta.currentPage} of {meta.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={meta.currentPage >= meta.totalPages}
            onClick={() => setOffset(offset + 12)}>Next →</Button>
        </div>
      )}

      {/* Modal */}
      {isAdmin && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Project">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input label="Project name" required placeholder="E.g. Website Redesign"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea label="Description" placeholder="What is this project about?"
              value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex justify-end gap-2 pt-3 border-t border-[#C6A0A0]">
              <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Create Project</Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}




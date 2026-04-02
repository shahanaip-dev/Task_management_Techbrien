'use client';

import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import ProjectCard from '@/components/projects/ProjectCard';
import Modal from '@/components/ui/Modal';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { usersApi, projectsApi } from '@/lib/api';
import type { CreateProjectForm, Project, User } from '@/types';

const EMPTY_FORM: CreateProjectForm = { name: '', description: '', memberIds: [] };

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const { projects, meta, loading, error, createProject, updateProject, deleteProject, page, goNext, goPrev, setSearch } = useProjects(8);

  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inputValue, setInputValue]   = useState('');
  const [showCreate, setShowCreate]   = useState(false);
  const [showEdit,   setShowEdit]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Project | null>(null);
  const [form,       setForm]         = useState<CreateProjectForm>(EMPTY_FORM);
  const [saving,        setSaving]       = useState(false);
  const [users,         setUsers]        = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Debounced search
  const handleSearchInput = (value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 350);
  };

  // Fetch non-admin users for member assignment
  useEffect(() => {
    if (!isAdmin) return;
    usersApi.list({ limit: 6 })
      .then((res) => {
        setUsers(res.data.data.data.filter((u: User) => u.role !== 'ADMIN'));
      })
      .catch(() => {});
  }, [isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      await createProject({ ...form, name: form.name.trim(), memberIds: form.memberIds?.length ? form.memberIds : undefined });
      toast.success('Project created');
      setForm(EMPTY_FORM);
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create project');
    } finally { setSaving(false); }
  };

  const openEdit = async (project: Project) => {
    setEditTarget(project);
    setForm({ name: project.name, description: project.description ?? '', memberIds: [] });
    setShowEdit(true);
    setLoadingMembers(true);
    try {
      const res = await projectsApi.getOne(project.id);
      const currentMembers: string[] = res.data.data.memberIds ?? [];
      setForm((prev) => ({ ...prev, memberIds: currentMembers }));
    } catch {
      setForm((prev) => ({ ...prev, memberIds: project.memberIds ?? [] }));
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!form.name.trim()) return toast.error('Project name is required');
    setSaving(true);
    try {
      await updateProject(editTarget.id, {
        name:        form.name.trim(),
        description: form.description,
        memberIds:   form.memberIds,
      });
      toast.success('Project updated');
      setShowEdit(false);
      setEditTarget(null);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update project');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? All tasks will be removed.')) return;
    try { await deleteProject(id); toast.success('Project deleted'); }
    catch { toast.error('Failed to delete project'); }
  };

  const userCheckboxListJsx = (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[#1C1A18] tracking-wide uppercase">Assign Users</label>
      <div className="max-h-40 overflow-auto rounded border border-[#E8DDD4] bg-white p-3">
        {users.length === 0 ? (
          <p className="text-xs text-[#8A8278]">No users available</p>
        ) : (
          users.map((u) => (
            <label key={u.id} className="flex items-center gap-2 py-1 text-sm text-[#1C1A18]">
              <input
                type="checkbox"
                className="accent-[#7D1F1F]"
                checked={!!form.memberIds?.includes(u.id)}
                onChange={(e) => {
                  const next = new Set(form.memberIds ?? []);
                  if (e.target.checked) next.add(u.id); else next.delete(u.id);
                  setForm({ ...form, memberIds: Array.from(next) });
                }}
              />
              <span>{u.name}</span>
              <span className="text-xs text-[#8A8278]">({u.email})</span>
            </label>
          ))
        )}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#4B1414]">Projects</h1>
          <p className="text-sm text-[#8A8278] mt-0.5 font-light">
            {projects.length ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : '—'}
          </p>
        </div>
        {isAdmin && <Button onClick={() => { setForm(EMPTY_FORM); setShowCreate(true); }}>+ New Project</Button>}
      </div>

      <div className="mb-6">
        <div className="relative w-full sm:max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8278] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search projects…"
            value={inputValue}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="block w-full pl-9 pr-9 py-2.5 text-sm rounded border border-[#E8DDD4] bg-white text-[#1C1A18] placeholder-[#C4B8AD] focus:outline-none focus:ring-2 focus:ring-[#7D1F1F]/30 focus:border-[#7D1F1F]/50 transition-colors duration-200"
          />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>}

      {!loading && projects.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {[
            { label: 'Projects (page)', value: projects.length },
            { label: 'Tasks (page)',    value: projects.reduce((s: number, p: Project) => s + (p.taskCount ?? 0), 0) },
            { label: 'Active Projects', value: projects.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#E8DDD4] rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs text-[#8A8278]">{stat.label}</span>
              <span className="font-semibold text-[#1C1A18] text-sm">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-44 bg-white rounded-lg border border-[#C6A0A0] animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
           <h3 className="font-serif text-xl font-semibold text-[#4B1414] mb-2">No projects found</h3>
           {isAdmin && <Button onClick={() => setShowCreate(true)}>Create Project</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {projects.map((p) => <ProjectCard key={p.id} project={p} onDelete={handleDelete} onEdit={openEdit} isAdmin={isAdmin} />)}
        </div>
      )}

      {meta && (
        <div className="mt-12">
          <div className="flex flex-wrap justify-end items-center gap-2 px-3 py-1.5">
            <Button variant="primary" size="sm" disabled={page === 1} onClick={goPrev}>← Previous</Button>
            <span className="text-sm text-[#8A8278]">Page {page}</span>
            <Button variant="primary" size="sm" disabled={!meta.hasMore} onClick={goNext}>Next →</Button>
          </div>
        </div>
      )}

      {isAdmin && (
        <>
          <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project">
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <Input label="Project name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {userCheckboxListJsx}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" loading={saving}>Create Project</Button>
              </div>
            </form>
          </Modal>
          <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Project">
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <Input label="Project name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {loadingMembers ? <p>Loading users…</p> : userCheckboxListJsx}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
                <Button type="submit" loading={saving}>Save Changes</Button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </AppLayout>
  );
}












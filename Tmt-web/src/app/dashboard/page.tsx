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

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { projects, meta, loading, error, createProject, updateProject, deleteProject, offset, setOffset, search, setSearch } = useProjects(12);

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
    usersApi.list({ limit: 200 })
      .then((r) => {
        const all: User[] = r.data.data.data;
        // Exclude system admin (role ADMIN) from the assignable list
        setUsers(all.filter((u) => u.role !== 'ADMIN'));
      })
      .catch(() => {});
  }, [isAdmin]);

  // ── Create ──────────────────────────────────────────────────────────────────
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

  // ── Edit ────────────────────────────────────────────────────────────────────
  const openEdit = async (project: Project) => {
    setEditTarget(project);
    // Start with name/description immediately; members load from fresh API call
    setForm({ name: project.name, description: project.description ?? '', memberIds: [] });
    setShowEdit(true);
    setLoadingMembers(true);
    try {
      const res = await projectsApi.getOne(project.id);
      const projectDetail = res.data.data;
      // Backend returns member_ids (snake_case)
      const currentMembers: string[] =
        (projectDetail as any).member_ids ?? projectDetail.memberIds ?? [];
      setForm((prev) => ({ ...prev, memberIds: currentMembers }));
    } catch {
      // If fetch fails, fall back to what we already have in the list
      const fallback = (project as any).member_ids ?? project.memberIds ?? [];
      setForm((prev) => ({ ...prev, memberIds: fallback }));
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

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? All tasks will be removed.')) return;
    try { await deleteProject(id); toast.success('Project deleted'); }
    catch { toast.error('Failed to delete project'); }
  };

  // ── Inline user checkbox list JSX (avoids stale-closure issues with nested components)
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
      <p className="text-xs text-[#8A8278]">Only assigned users can create tasks in this project.</p>
    </div>
  );

  const editUserCheckboxListJsx = (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[#1C1A18] tracking-wide uppercase">Assign Users</label>
      <div className="max-h-40 overflow-auto rounded border border-[#E8DDD4] bg-white p-3 relative">
        {loadingMembers ? (
          <p className="text-xs text-[#8A8278] italic">Loading members…</p>
        ) : users.length === 0 ? (
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
      <p className="text-xs text-[#8A8278]">Only assigned users can create tasks in this project.</p>
    </div>
  );

  return (
    <AppLayout>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#4B1414]">Projects</h1>
          <p className="text-sm text-[#8A8278] mt-0.5 font-light">
            {meta ? `${meta.total} project${meta.total !== 1 ? 's' : ''}` : '—'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setForm(EMPTY_FORM); setShowCreate(true); }}>+ New Project</Button>
        )}
      </div>

      {/* Search bar */}
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
          {inputValue && (
            <button
              onClick={() => { setInputValue(''); setSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8278] hover:text-[#1C1A18]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
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
            { label: 'Total Tasks',    value: projects.reduce((s, p) => s + (p._count?.tasks ?? 0), 0) },
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
            {search ? 'No matching projects' : isAdmin ? 'No projects yet' : 'No assigned projects'}
          </h3>
          <p className="text-sm text-[#8A8278] mb-7 font-light">
            {search
              ? `No projects found matching "${search}"`
              : isAdmin ? 'Create your first project to get started' : 'You have not been assigned to any projects'}
          </p>
          {isAdmin && <Button onClick={() => { setForm(EMPTY_FORM); setShowCreate(true); }}>Create Project</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onDelete={handleDelete} onEdit={openEdit} isAdmin={isAdmin} />
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

      {/* Create Modal */}
      {isAdmin && (
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input label="Project name" required placeholder="E.g. Website Redesign"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea label="Description" placeholder="What is this project about?"
              value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {userCheckboxListJsx}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#C6A0A0]">
              <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Create Project</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {isAdmin && (
        <Modal isOpen={showEdit} onClose={() => { setShowEdit(false); setEditTarget(null); }} title="Edit Project">
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <Input label="Project name" required placeholder="E.g. Website Redesign"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea label="Description" placeholder="What is this project about?"
              value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {editUserCheckboxListJsx}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#C6A0A0]">
              <Button variant="secondary" type="button" onClick={() => { setShowEdit(false); setEditTarget(null); }}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import TaskCard from '@/components/tasks/TaskCard';
import TaskFilters from '@/components/tasks/TaskFilters';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import Button from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProject } from '@/hooks/useProject';
import { usersApi } from '@/lib/api';
import type { User, Task, TaskFilters as Filters, TaskStatus } from '@/types';

function TasksPageInner() {
  const searchParams     = useSearchParams();
  const defaultProjectId = searchParams.get('projectId') ?? undefined;

  const [filters,   setFilters]   = useState<Filters>({ projectId: defaultProjectId });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [users,     setUsers]     = useState<User[]>([]);

  const { tasks, meta, loading, error, createTask, updateTaskStatus, updateTask, deleteTask, page, goNext, goPrev } =
    useTasks(filters, 12);
  const { project } = useProject(defaultProjectId);
  const { projects: allProjects } = useProjects(100, !defaultProjectId);
  const projects = defaultProjectId ? (project ? [project] : []) : allProjects;

  useEffect(() => {
    usersApi.list({ limit: 100 }).then((r) => setUsers(r.data.data.data)).catch(() => {});
  }, []);

  // Task status counts (current page)
  const counts = {
    todo:       tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done:       tasks.filter((t) => t.status === 'DONE').length,
  };

  const handleCreate = async (data: any) => {
    try { await createTask(data); toast.success('Task created'); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Failed'); throw err; }
  };

  const handleStatus = async (id: string, status: TaskStatus) => {
    try { await updateTaskStatus(id, status); toast.success('Status updated'); }
    catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(id); toast.success('Task deleted'); }
    catch { toast.error('Failed to delete task'); }
  };

  const handleEditSave = async (id: string, data: any) => {
    try { await updateTask(id, data); toast.success('Task updated'); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Failed to update task'); throw err; }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1C1A18]">Tasks</h1>
          <p className="text-sm text-[#8A8278] mt-0.5 font-light">
            {tasks.length ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''}` : '—'}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ New Task</Button>
      </div>

      {/* Status summary pills */}
      {!loading && tasks.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="bg-white border border-[#E8DDD4] rounded-lg px-4 py-2.5 flex items-center gap-2">
            <span className="text-xs text-[#8A8278]">To Do</span>
            <span className="font-semibold text-[#1C1A18] text-sm">{counts.todo}</span>
          </div>
          <div className="bg-white border border-[#E8DDD4] rounded-lg px-4 py-2.5 flex items-center gap-2">
            <span className="text-xs text-[#8A8278]">In Progress</span>
            <span className="font-semibold text-[#3B5BDB] text-sm">{counts.inProgress}</span>
          </div>
          <div className="bg-white border border-[#E8DDD4] rounded-lg px-4 py-2.5 flex items-center gap-2">
            <span className="text-xs text-[#8A8278]">Done</span>
            <span className="font-semibold text-[#2F9E44] text-sm">{counts.done}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters({})}
          projects={projects}
          users={users}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-lg border border-[#E8DDD4] animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-14 h-14 bg-[#F5E6DC] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-[#7D1F1F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-semibold text-[#1C1A18] mb-2">No tasks found</h3>
          <p className="text-sm text-[#8A8278] mb-7 font-light">
            {Object.values(filters).some(Boolean) ? 'Try adjusting your filters' : 'Create your first task'}
          </p>
          <Button onClick={() => setShowModal(true)}>Create Task</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatus}
              onDelete={handleDelete}
              onEdit={(t) => setEditingTask(t)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && (meta.hasMore || page > 1) && (
        <div className="flex justify-center items-center gap-3 mt-12">
          <Button variant="secondary" size="sm" disabled={page === 1}
            onClick={goPrev}>← Previous</Button>
          <span className="text-sm text-[#8A8278]">Page {page}</span>
          <Button variant="secondary" size="sm" disabled={!meta.hasMore}
            onClick={goNext}>Next →</Button>
        </div>
      )}

      <CreateTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        projects={projects}
        users={users}
        defaultProjectId={filters.projectId}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleEditSave}
        task={editingTask}
        users={users}
      />
    </AppLayout>
  );
}

export default function TasksPage() {
  return <Suspense><TasksPageInner /></Suspense>;
}

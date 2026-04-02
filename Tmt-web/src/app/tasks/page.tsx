'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import TaskCard from '@/components/tasks/TaskCard';
import Input, { Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import type { CreateTaskForm } from '@/types';

const EMPTY_FORM: CreateTaskForm = {
  title: '',
  description: '',
  projectId: '',
  assignedTo: '',
  dueDate: '',
};

export default function TasksPage() {
  const { tasks, loading, error, createTask, deleteTask } = useTasks(1000);
  const { projects } = useProjects(1000);

  const [form, setForm] = useState<CreateTaskForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchProjectId, setSearchProjectId] = useState('');
  const [searchDueDate, setSearchDueDate] = useState('');

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const filteredTasks = tasks.filter((t) => {
    const matchesText = searchText.trim()
      ? `${t.title} ${t.description ?? ''}`.toLowerCase().includes(searchText.trim().toLowerCase())
      : true;
    const matchesProject = searchProjectId ? t.projectId === searchProjectId : true;
    const matchesDue = searchDueDate
      ? (t.dueDate ? t.dueDate.split('T')[0] === searchDueDate : false)
      : true;
    return matchesText && matchesProject && matchesDue;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.projectId) {
      return toast.error('Title and project are required');
    }
    setSaving(true);
    try {
      await createTask({
        ...form,
        assignedTo: undefined,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      });
      toast.success('Task created');
      setForm(EMPTY_FORM);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1C1A18]">Tasks</h1>
          <p className="text-sm text-[#8A8278] mt-0.5 font-light">
            {filteredTasks.length ? `${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}` : '—'}
          </p>
        </div>
      </div>

      <div className="rounded-lg p-5 mb-6 bg-transparent">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          <Input
            label="Task"
            placeholder="Search task"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            label="Project"
            options={projectOptions}
            value={searchProjectId}
            placeholder="All projects"
            onChange={(e) => setSearchProjectId(e.target.value)}
          />
          <Input
            label="Due date"
            type="date"
            value={searchDueDate}
            onChange={(e) => setSearchDueDate(e.target.value)}
          />
        </div>
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-lg border border-[#E8DDD4] p-5 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
          <Input
            label="Title"
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={1}
            className="min-h-[42px]"
          />
          <Input
            label="Due date"
            type="date"
            placeholder="Due date"
            value={form.dueDate ?? ''}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={saving} className="w-full lg:w-auto">Create Task</Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-lg border border-[#E8DDD4] animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 text-sm text-[#8A8278]">No tasks found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

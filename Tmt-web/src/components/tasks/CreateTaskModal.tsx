'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Project, User, CreateTaskForm } from '@/types';

interface CreateTaskModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onSubmit:     (data: CreateTaskForm) => Promise<void>;
  projects:     Project[];
  users:        User[];
  defaultProjectId?: string;
}

const EMPTY_FORM: CreateTaskForm = {
  title:       '',
  description: '',
  projectId:   '',
  assignedTo:  '',
  dueDate:     '',
};

export default function CreateTaskModal({
  isOpen, onClose, onSubmit, projects, users, defaultProjectId,
}: CreateTaskModalProps) {
  const [form,    setForm]    = useState<CreateTaskForm>({
    ...EMPTY_FORM,
    projectId: defaultProjectId ?? '',
  });
  const [errors,  setErrors]  = useState<Partial<CreateTaskForm>>({});
  const [loading, setLoading] = useState(false);

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));
  const userOptions    = users.map((u)    => ({ value: u.id, label: u.name }));

  const validate = (): boolean => {
    const errs: Partial<CreateTaskForm> = {};
    if (!form.title.trim())    errs.title     = 'Title is required';
    if (!form.projectId.trim()) errs.projectId = 'Project is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        assignedTo: form.assignedTo || undefined,
        dueDate:    form.dueDate    ? new Date(form.dueDate).toISOString() : undefined,
      });
      setForm({ ...EMPTY_FORM, projectId: defaultProjectId ?? '' });
      setErrors({});
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM, projectId: defaultProjectId ?? '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          required
          placeholder="E.g. Implement login page"
          value={form.title}
          error={errors.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <Textarea
          label="Description"
          placeholder="Optional task details..."
          value={form.description ?? ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Select
          label="Project"
          required
          options={projectOptions}
          value={form.projectId}
          placeholder="Select a project"
          error={errors.projectId}
          onChange={(e) => setForm({ ...form, projectId: e.target.value })}
        />

        <Select
          label="Assign to"
          options={userOptions}
          value={form.assignedTo ?? ''}
          placeholder="Unassigned"
          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
        />

        <Input
          label="Due date"
          type="date"
          value={form.dueDate ?? ''}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
        />

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

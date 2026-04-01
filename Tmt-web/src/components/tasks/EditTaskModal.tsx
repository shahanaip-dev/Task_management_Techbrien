'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Task, User, UpdateTaskForm } from '@/types';

interface EditTaskModalProps {
  isOpen:  boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateTaskForm) => Promise<void>;
  task:    Task | null;
  users:   User[];
}

const EMPTY_FORM: UpdateTaskForm = {
  title:       '',
  description: '',
  assignedTo:  '',
  dueDate:     '',
};

export default function EditTaskModal({ isOpen, onClose, onSubmit, task, users }: EditTaskModalProps) {
  const [form,    setForm]    = useState<UpdateTaskForm>(EMPTY_FORM);
  const [errors,  setErrors]  = useState<UpdateTaskForm>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!task) return;
    setForm({
      title:       task.title ?? '',
      description: task.description ?? '',
      assignedTo:  task.assignee?.id ?? task.assignedTo ?? '',
      dueDate:     task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setErrors({});
  }, [task, isOpen]);

  const employeeOptions = users.filter(u => u.role === 'EMPLOYEE').map((u) => ({ value: u.id, label: u.name }));

  const validate = (): boolean => {
    const errs: UpdateTaskForm = {};
    if (!form.title?.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(task.id, {
        title:       form.title?.trim(),
        description: form.description ?? '',
        assignedTo:  form.assignedTo ? String(form.assignedTo) : null,
        dueDate:     form.dueDate ? new Date(String(form.dueDate)).toISOString() : null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          required
          placeholder="Task title"
          value={form.title ?? ''}
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
          label="Assign to"
          options={employeeOptions}
          value={form.assignedTo ?? ''}
          placeholder="Unassigned"
          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
        />

        <Input
          label="Due date"
          type="date"
          value={form.dueDate ?? ''}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

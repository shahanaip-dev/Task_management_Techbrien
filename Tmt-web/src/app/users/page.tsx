'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/context/AuthContext';
import type { CreateUserForm, UpdateUserForm, User } from '@/types';

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers(1000);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<CreateUserForm>({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const teamMembers = users.filter((u) => u.role !== 'ADMIN');

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          You do not have access to this page.
        </div>
      </AppLayout>
    );
  }

  const resetForm = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) {
      return toast.error('Name and email are required');
    }

    if (!editingUser && !form.password.trim()) {
      return toast.error('Password is required');
    }

    setSaving(true);
    try {
      if (editingUser) {
        const payload: UpdateUserForm = { name, email };
        if (form.password.trim()) {
          payload.password = form.password;
        }
        await updateUser(editingUser.id, payload);
        toast.success('User updated');
      } else {
        await createUser({ name, email, password: form.password });
        toast.success('User created');
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '' });
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await deleteUser(u.id);
      toast.success('User deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete user');
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1C1A18]">Team</h1>
          <p className="text-sm text-[#8A8278] mt-0.5 font-light">
            {teamMembers.length ? `${teamMembers.length} user${teamMembers.length !== 1 ? 's' : ''}` : '—'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#E8DDD4] p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Full name" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" placeholder="Password" type="password" required={!editingUser} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="flex justify-end mt-4 gap-3">
          {editingUser && (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={saving}>
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-[#E8DDD4] overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#8A8278] font-semibold">
          <div className="col-span-3">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-3">Created</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#FAF7F2] rounded animate-pulse" />
            ))}
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#8A8278]">No users found</div>
        ) : (
          teamMembers.map((u) => (
            <div key={u.id} className="border-t border-[#E8DDD4] text-sm">
              <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-4 items-center">
                <div className="col-span-3 font-medium text-[#1C1A18]">{u.name}</div>
                <div className="col-span-4 text-[#6B6860] truncate">{u.email}</div>
                <div className="col-span-3 text-[#6B6860]">{formatDate(u.createdAt)}</div>
                <div className="col-span-2 flex justify-end">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(u)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>Delete</Button>
                  </div>
                </div>
              </div>
              <div className="md:hidden px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#7D1F1F] text-sm font-semibold flex-shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1C1A18] truncate">{u.name}</p>
                    <p className="text-xs text-[#6B6860] truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#8A8278]">{formatDate(u.createdAt)}</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(u)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>Delete</Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}

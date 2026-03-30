'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import type { CreateUserForm, UpdateUserForm, User } from '@/types';

const ROLE_OPTIONS = [
  { value: 'ADMIN',    label: 'Admin' },
  { value: 'EMPLOYEE', label: 'Employee' },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Employee',
};

function formatDate(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const { users, meta, loading, error, createUser, updateUser, deleteUser, offset, setOffset } = useUsers(12);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [editing,    setEditing]    = useState<User | null>(null);

  const [createForm, setCreateForm] = useState<CreateUserForm>({
    name: '', email: '', password: '', role: 'EMPLOYEE',
  });
  const [editForm, setEditForm] = useState<UpdateUserForm>({
    name: '', email: '', password: '', role: 'EMPLOYEE',
  });

  const totalUsers = meta?.total ?? 0;
  const isSelf = (u: User) => currentUser?.id === u.id;

  const resetCreate = () => setCreateForm({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const resetEdit = () => setEditForm({ name: '', email: '', password: '', role: 'EMPLOYEE' });

  const openEdit = (u: User) => {
    setEditing(u);
    setEditForm({ name: u.name, email: u.email, role: u.role });
    setShowEdit(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      return toast.error('Name, email, and password are required');
    }
    try {
      await createUser({
        ...createForm,
        name:  createForm.name.trim(),
        email: createForm.email.trim(),
      });
      toast.success('User created');
      resetCreate();
      setShowCreate(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const payload: UpdateUserForm = {};
    const name  = editForm.name?.trim();
    const email = editForm.email?.trim();

    if (name && name !== editing.name) payload.name = name;
    if (email && email !== editing.email) payload.email = email;
    if (editForm.password) payload.password = editForm.password;
    if (editForm.role && editForm.role !== editing.role) payload.role = editForm.role;

    if (Object.keys(payload).length === 0) {
      return toast.error('No changes to save');
    }

    try {
      await updateUser(editing.id, payload);
      toast.success('User updated');
      resetEdit();
      setShowEdit(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update user');
    }
  };

  const handleDelete = async (u: User) => {
    if (isSelf(u)) return toast.error('You cannot delete your own account');
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await deleteUser(u.id);
      toast.success('User deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete user');
    }
  };

  const canRender = useMemo(() => isAdmin, [isAdmin]);

  if (!canRender) {
    return (
      <AppLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          You do not have access to this page.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#1C1A18]">Team</h1>
          <p className="text-sm text-[#8A8278] mt-0.5 font-light">
            {meta ? `${totalUsers} user${totalUsers !== 1 ? 's' : ''}` : '—'}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New User</Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-lg border border-[#E8DDD4] overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-[#FAF7F2] text-[11px] uppercase tracking-wider text-[#8A8278] font-semibold">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#FAF7F2] rounded animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#8A8278]">No users found</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="grid grid-cols-12 gap-3 px-5 py-4 border-t border-[#E8DDD4] text-sm">
              <div className="col-span-3 font-medium text-[#1C1A18]">{u.name}</div>
              <div className="col-span-3 text-[#6B6860]">{u.email}</div>
              <div className="col-span-2 text-[#6B6860]">{ROLE_LABELS[u.role] ?? u.role}</div>
              <div className="col-span-2 text-[#6B6860]">
                {formatDate((u as any).created_at ?? (u as any).createdAt)}
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>Edit</Button>
                <Button size="sm" variant="danger" disabled={isSelf(u)} onClick={() => handleDelete(u)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

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

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New User">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Full name" required value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          <Input label="Email" type="email" required value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
          <Input label="Password" type="password" required value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
          <Select label="Role" value={createForm.role} options={ROLE_OPTIONS}
            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })} />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#E8DDD4]">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit User">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <Input label="Full name" value={editForm.name ?? ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Email" type="email" value={editForm.email ?? ''}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <Input label="New password" type="password" placeholder="Leave blank to keep current"
            value={editForm.password ?? ''}
            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
          <Select label="Role" value={editForm.role ?? 'EMPLOYEE'} options={ROLE_OPTIONS}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })} />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#E8DDD4]">
            <Button variant="secondary" type="button" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

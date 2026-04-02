'use client';

import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '@/lib/api';
import type { User, CreateUserForm, UpdateUserForm } from '@/types';

export function useUsers(limit = 1000) {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.list({ limit });
      setUsers(res.data.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const createUser = useCallback(async (data: CreateUserForm) => {
    const res = await usersApi.create(data);
    await fetchUsers();
    return res.data.data;
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, data: UpdateUserForm) => {
    const res = await usersApi.update(id, data);
    await fetchUsers();
    return res.data.data;
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    await usersApi.delete(id);
    await fetchUsers();
  }, [fetchUsers]);

  return {
    users, loading, error,
    createUser, updateUser, deleteUser,
    refresh: fetchUsers,
  };
}

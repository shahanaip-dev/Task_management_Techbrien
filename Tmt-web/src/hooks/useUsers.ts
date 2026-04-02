'use client';

import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '@/lib/api';
import type { User, PaginatedData, CreateUserForm, UpdateUserForm } from '@/types';

export function useUsers(initialLimit = 10) {
  const [users,   setUsers]   = useState<User[]>([]);
  const [meta,    setMeta]    = useState<PaginatedData<User>['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.list({ limit: initialLimit, cursor });
      setUsers(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [cursor, initialLimit]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const goNext = useCallback(() => {
    if (!meta?.nextCursor) return;
    setCursorStack((s) => [...s, cursor ?? '']);
    setCursor(meta.nextCursor);
    setPage((p) => p + 1);
  }, [meta, cursor]);

  const goPrev = useCallback(() => {
    if (cursorStack.length === 0) return;
    const prev = cursorStack[cursorStack.length - 1];
    setCursorStack((s) => s.slice(0, -1));
    setCursor(prev || undefined);
    setPage((p) => Math.max(1, p - 1));
  }, [cursorStack]);

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
    users, meta, loading, error,
    page,
    goNext, goPrev,
    createUser, updateUser, deleteUser,
    refresh: fetchUsers,
  };
}
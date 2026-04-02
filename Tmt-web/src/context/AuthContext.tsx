'use client';

import React, {
  createContext, useContext, useEffect, useState, useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken, setUser, clearAuth, getToken, getUser } from '@/lib/auth';
import type { User, LoginPayload } from '@/types';

interface AuthContextValue {
  user:     User | null;
  login:    (payload: LoginPayload) => Promise<void>;
  logout:   () => void;
  isAdmin:  boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [user,    setUserState] = useState<User | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = getToken();
    const stored = getUser();
    if (token && stored) {
      setUserState(stored);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    const { token, user: authUser } = res.data.data;
    setToken(token);
    setUser(authUser);
    setUserState(authUser);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
    router.push('/login');
  }, [router]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

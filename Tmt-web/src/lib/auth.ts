/**
 * Auth helpers — stores JWT in both:
 *   - document.cookie  → readable by Next.js middleware (server-side route protection)
 *   - localStorage     → readable by Axios request interceptor (client-side API calls)
 */
import type { User } from '../types';

const TOKEN_KEY = 'tmt_token';
const USER_KEY  = 'tmt_user';

// ── Token ──────────────────────────────────────────────────────────────────

export function setToken(token: string): void {
  // Cookie: accessible by middleware (not httpOnly so JS can also read it)
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
  // localStorage: used by Axios interceptor
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  // Expire the cookie immediately
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  localStorage.removeItem(TOKEN_KEY);
}

// ── User ───────────────────────────────────────────────────────────────────

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ── Combined ───────────────────────────────────────────────────────────────

export function clearAuth(): void {
  removeToken();
  removeUser();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

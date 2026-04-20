'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginOrCreateUserAction } from '@/app/actions/user-actions';

type UserState =
  | { status: 'anonymous' }
  | { status: 'authenticated'; userId: string; username: string };

type UserContextValue = {
  user: UserState;
  login: (username: string) => Promise<{ success: true } | { success: false; error: string }>;
  logout: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = 'taskmaster.user';

function readStoredUser(): { userId: string; username: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'userId' in parsed &&
      'username' in parsed &&
      typeof (parsed as any).userId === 'string' &&
      typeof (parsed as any).username === 'string'
    ) {
      return { userId: (parsed as any).userId, username: (parsed as any).username };
    }
    return null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: { userId: string; username: string } | null) {
  if (typeof window === 'undefined') return;
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>({ status: 'anonymous' });

  useEffect(() => {
    const stored = readStoredUser();
    if (stored) {
      setUser({ status: 'authenticated', userId: stored.userId, username: stored.username });
    }
  }, []);

  const login = useCallback(async (username: string) => {
    const result = await loginOrCreateUserAction(username);
    if (!result.success) return { success: false as const, error: result.error };

    const next = { status: 'authenticated' as const, userId: result.data.id, username: result.data.username };
    setUser(next);
    writeStoredUser({ userId: next.userId, username: next.username });
    return { success: true as const };
  }, []);

  const logout = useCallback(() => {
    setUser({ status: 'anonymous' });
    writeStoredUser(null);
  }, []);

  const value = useMemo<UserContextValue>(() => ({ user, login, logout }), [user, login, logout]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}


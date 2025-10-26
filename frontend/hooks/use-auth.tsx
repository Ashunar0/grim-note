'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

type AuthState = {
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  loading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_REQUIRED_PATHS = ['/timeline', '/posts/new'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });
  const router = useRouter();
  const pathname = usePathname();

  const refresh = async () => {
    try {
      const res = await apiClient.get<{
        status: string;
        data: {
          user: {
            id: number;
            name: string;
            email: string;
          };
        };
      }>('/me');

      setState({ user: res.data.user, loading: false, error: null });
    } catch (error: any) {
      setState({ user: null, loading: false, error: null });
    }
  };

  const logout = async () => {
    try {
      await apiClient.delete('/logout');
    } finally {
      setState({ user: null, loading: false, error: null });
      router.push('/login');
      router.refresh();
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.loading && !state.user && AUTH_REQUIRED_PATHS.some((path) => pathname?.startsWith(path))) {
      router.push('/login');
    }
  }, [state.user, state.loading, pathname, router]);

  const value: AuthContextValue = {
    ...state,
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiFetch, clearTokens, setTokens } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  register: (data: { email: string; name: string; phone?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        clearTokens();
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Verify token is still valid by fetching profile
      apiFetch<{ user: User }>('/users/me', { auth: true })
        .then((data) => {
          if (cancelled) return;
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        })
        .catch(() => {
          if (cancelled) return;
          clearTokens();
          setUser(null);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiFetch<{
        tokens: { accessToken: string; refreshToken: string };
        user: User;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string };
      if (apiErr.status === 403) {
        return { success: false, needsVerification: true, error: 'Akun belum diverifikasi' };
      }
      return {
        success: false,
        error: apiErr.message || 'Login gagal',
      };
    }
  }, []);

  const register = useCallback(async (data: { email: string; name: string; phone?: string; password: string }) => {
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { success: true };
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      return { success: false, error: apiErr.message || 'Registrasi gagal' };
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    document.cookie = 'user-role=; path=/; max-age=0; SameSite=Lax';
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string }) => {
    try {
      const result = await apiFetch<{ user: User }>('/users/me', {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify(data),
      });
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      return { success: true };
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      return { success: false, error: apiErr.message || 'Gagal mengupdate profil' };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

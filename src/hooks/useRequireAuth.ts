'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook untuk memproteksi aksi yang memerlukan autentikasi.
 * Jika user belum login, redirect ke /login dengan returnUrl.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const requireAuth = useCallback(
    (action: () => void) => {
      if (isAuthenticated) {
        action();
        return;
      }

      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
    },
    [isAuthenticated, router]
  );

  return { requireAuth, isAuthenticated };
}

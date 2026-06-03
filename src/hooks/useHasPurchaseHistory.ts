'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { apiFetch } from '@/lib/api/client';

/**
 * Check if authenticated user has purchase history.
 * Returns undefined while loading, then true/false.
 * Returns false for unauthenticated users.
 */
export function useHasPurchaseHistory(): boolean | undefined {
  const { user } = useAuth();
  const [hasHistory, setHasHistory] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      setHasHistory(false);
      return;
    }

    let cancelled = false;

    apiFetch<{ hasHistory: boolean }>('/orders/has-history', { auth: true })
      .then((data) => {
        if (!cancelled) setHasHistory(data.hasHistory);
      })
      .catch(() => {
        if (!cancelled) setHasHistory(false);
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  return hasHistory;
}

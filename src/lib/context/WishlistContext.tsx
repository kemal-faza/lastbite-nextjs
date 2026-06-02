'use client';

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';

interface WishlistState {
  ids: string[];
}

type WishlistAction =
  | { type: 'TOGGLE'; payload: { id: string } }
  | { type: 'CLEAR' };

const STORAGE_KEY = 'lastbite-wishlist';

function loadStored(): WishlistState {
  if (typeof window === 'undefined') return { ids: [] };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ids: [] };
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) return { ids: parsed };
    return { ids: [] };
  } catch {
    return { ids: [] };
  }
}

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'TOGGLE': {
      const exists = state.ids.includes(action.payload.id);
      return {
        ids: exists
          ? state.ids.filter((id) => id !== action.payload.id)
          : [...state.ids, action.payload.id],
      };
    }
    case 'CLEAR':
      return { ids: [] };
    default:
      return state;
  }
}

const WishlistContext = createContext<{
  ids: string[];
  toggle: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  count: number;
} | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, { ids: [] }, loadStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.ids));
  }, [state.ids]);

  const toggle = (id: string) => dispatch({ type: 'TOGGLE', payload: { id } });

  const isWishlisted = (id: string) => state.ids.includes(id);

  return (
    <WishlistContext.Provider
      value={{
        ids: state.ids,
        toggle,
        isWishlisted,
        count: state.ids.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

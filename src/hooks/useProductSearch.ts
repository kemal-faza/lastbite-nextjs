'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useDebounce } from './useDebounce';
import type { ProductData } from '@/lib/api/products';

interface SearchResponse {
  products: ProductData[];
  total: number;
  page: number;
  limit: number;
  query: string;
}

interface UseProductSearchResult {
  results: ProductData[];
  total: number;
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (q: string) => void;
}

export function useProductSearch(): UseProductSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setTotal(0);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    apiFetch<SearchResponse>(`/products/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((data) => {
        if (!cancelled) {
          setResults(data.products);
          setTotal(data.total);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Pencarian gagal');
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return { results, total, loading, error, query, setQuery };
}

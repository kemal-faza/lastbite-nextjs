'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchProduct, type ProductData, type ProductListResponse, type FetchProductsParams } from '@/lib/api/products';

interface UseProductResult {
  product: ProductData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProduct(id: string): UseProductResult {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProduct(id);
      setProduct(res.product);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat produk'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { product, loading, error, refetch: load };
}

interface UseProductsResult {
  products: ProductData[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProducts(params: FetchProductsParams = {}): UseProductsResult {
  const { category, sort, page, limit } = params;
  const [products, setProducts] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: ProductListResponse = await fetchProducts({ category, sort, page, limit });
      setProducts(res.products);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat produk'));
    } finally {
      setLoading(false);
    }
  }, [category, sort, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, total, totalPages, loading, error, refetch: load };
}

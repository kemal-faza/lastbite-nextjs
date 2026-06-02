import { apiFetch } from './client';

export interface ProductData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  stock: number;
  imageUrl: string | null;
  storeName: string;
  storeAddress: string | null;
  storeLat: number | null;
  storeLng: number | null;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: ProductData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchProductsParams {
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  const path = `/products${query ? '?' + query : ''}`;
  return apiFetch<ProductListResponse>(path);
}

export async function fetchProduct(id: string): Promise<{ product: ProductData }> {
  return apiFetch<{ product: ProductData }>(`/products/${id}`);
}

export async function createProduct(data: {
  name: string;
  description?: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
  imageUrl?: string | null;
  storeName: string;
  storeAddress?: string;
  expiresAt: string;
}): Promise<{ product: ProductData }> {
  return apiFetch<{ product: ProductData }>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function uploadImage(file: File): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const res = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = 'Upload gagal';
    try {
      const body = await res.json();
      errorMsg = body.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}

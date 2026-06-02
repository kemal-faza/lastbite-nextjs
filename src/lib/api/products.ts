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

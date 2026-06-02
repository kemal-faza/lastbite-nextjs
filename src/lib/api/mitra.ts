import { apiFetch } from './client';
import type { ProductData } from './products';

export interface MitraProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string | null;
  storeAddress: string | null;
  storeLat: number | null;
  storeLng: number | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface RegisterMitraInput {
  storeName: string;
  storeDescription?: string;
  storeAddress?: string;
  storeLat?: number | null;
  storeLng?: number | null;
}

export async function registerMitra(data: RegisterMitraInput): Promise<{ profile: MitraProfile }> {
  return apiFetch<{ profile: MitraProfile }>('/mitra/register', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function getMitraProfile(): Promise<{ profile: MitraProfile }> {
  return apiFetch<{ profile: MitraProfile }>('/mitra/me', { auth: true });
}

export async function updateMitraProfile(data: Partial<RegisterMitraInput>): Promise<{ profile: MitraProfile }> {
  return apiFetch<{ profile: MitraProfile }>('/mitra/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function fetchMitraProducts(): Promise<{ products: ProductData[] }> {
  return apiFetch<{ products: ProductData[] }>('/mitra/products', { auth: true });
}

export async function updateMitraProduct(id: string, data: Partial<{
  name: string;
  description: string | null;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
  imageUrl: string | null;
  storeName: string;
  storeAddress: string | null;
  expiresAt: string;
  isActive: boolean;
}>): Promise<{ product: ProductData }> {
  return apiFetch<{ product: ProductData }>(`/mitra/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function deleteMitraProduct(id: string): Promise<void> {
  await apiFetch(`/mitra/products/${id}`, { method: 'DELETE', auth: true });
}

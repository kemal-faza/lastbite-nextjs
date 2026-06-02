import { apiFetch } from './client';

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

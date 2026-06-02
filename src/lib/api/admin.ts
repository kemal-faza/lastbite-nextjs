import { apiFetch } from './client';

// ---- Types ----
export interface MitraVerificationItem {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string | null;
  storeAddress: string | null;
  storeLat: number | null;
  storeLng: number | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  user: {
    email: string;
    name: string;
    phone: string | null;
    registeredAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- Mitra Verification ----
export async function getMitraVerifications(params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ profiles: MitraVerificationItem[]; total: number; page: number; limit: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  return apiFetch(`/admin/mitra-verifications?${query}`, { auth: true });
}

export async function verifyMitra(
  profileId: string,
  status: 'VERIFIED' | 'REJECTED'
): Promise<{ id: string; storeName: string; verificationStatus: string }> {
  return apiFetch(`/admin/mitra-verifications/${profileId}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ status }),
  });
}

// ---- User Management ----
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export async function getUsers(params: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: AdminUser[]; total: number; page: number; limit: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  return apiFetch(`/admin/users?${query}`, { auth: true });
}

export async function updateUser(
  userId: string,
  data: { name?: string; phone?: string; isVerified?: boolean }
): Promise<AdminUser> {
  return apiFetch(`/admin/users/${userId}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(data),
  });
}

// ---- Product Moderation ----
export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
  storeName: string;
  isActive: boolean;
  mitraEmail: string | null;
  createdAt: string;
}

export async function getProducts(params: {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: AdminProduct[]; total: number; page: number; limit: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.isActive !== undefined) query.set('isActive', String(params.isActive));
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  return apiFetch(`/admin/products?${query}`, { auth: true });
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  return apiFetch(`/admin/products/${productId}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ isActive }),
  });
}

// ---- Dashboard ----
export interface AdminDashboardStats {
  totalUsers: number;
  totalMitra: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeProducts: number;
}

export async function getAdminDashboard(): Promise<AdminDashboardStats> {
  return apiFetch('/admin/dashboard', { auth: true });
}

// ---- Platform Config ----
export interface PlatformConfig {
  commissionRate: number;
  maxPickupHours: number;
  categories: string[];
  featureFlags: Record<string, boolean>;
  supportPhone: string;
  termsUrl: string;
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  return apiFetch('/admin/config', { auth: true });
}

export async function updatePlatformConfig(data: Partial<PlatformConfig>): Promise<PlatformConfig> {
  return apiFetch('/admin/config', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(data),
  });
}

// ---- Audit Log ----
export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export async function getAuditLogs(params: {
  actorId?: string;
  entity?: string;
  page?: number;
  limit?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number; page: number; limit: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params.actorId) query.set('actorId', params.actorId);
  if (params.entity) query.set('entity', params.entity);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  return apiFetch(`/admin/audit-logs?${query}`, { auth: true });
}

import { apiFetch, API_BASE } from './client';

export interface SalesTrendEntry {
  date: string;
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
  totalSavings: number;
}

export interface AnalyticsQueryParams {
  from: string;
  to: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export async function fetchSalesTrend(params: AnalyticsQueryParams): Promise<{ trend: SalesTrendEntry[] }> {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    granularity: params.granularity || 'daily',
  });
  return apiFetch<{ trend: SalesTrendEntry[] }>(`/mitra/analytics/sales?${query}`, { auth: true });
}

export interface RevenueSummary {
  totalRevenue: number;
  totalSavings: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
}

export async function fetchRevenueSummary(params: AnalyticsQueryParams): Promise<{ summary: RevenueSummary }> {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  return apiFetch<{ summary: RevenueSummary }>(`/mitra/analytics/revenue?${query}`, { auth: true });
}

export interface ProductPerformanceEntry {
  productId: string;
  productName: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
}

export async function fetchProductPerformance(params: AnalyticsQueryParams): Promise<{ products: ProductPerformanceEntry[] }> {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  return apiFetch<{ products: ProductPerformanceEntry[] }>(`/mitra/analytics/products?${query}`, { auth: true });
}

export interface PeakHourEntry {
  hour: number;
  label: string;
  orders: number;
  items: number;
  revenue: number;
}

export async function fetchPeakHours(params: AnalyticsQueryParams): Promise<{ hours: PeakHourEntry[] }> {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  return apiFetch<{ hours: PeakHourEntry[] }>(`/mitra/analytics/peak-hours?${query}`, { auth: true });
}

export function getExportCsvUrl(from: string, to: string): string {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const query = new URLSearchParams({ from, to });
  if (token) query.set('token', token);
  return `${API_BASE}/mitra/analytics/export?${query}`;
}

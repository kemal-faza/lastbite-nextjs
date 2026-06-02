import { apiFetch } from './client';

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

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

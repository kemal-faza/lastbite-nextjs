'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import type { SalesTrendEntry } from '@/lib/api/analytics';
import { TrendUpIcon } from '@phosphor-icons/react';

interface Props {
  data: SalesTrendEntry[];
  granularity: 'daily' | 'weekly' | 'monthly';
  loading?: boolean;
}

function formatDateLabel(dateStr: string, granularity: 'daily' | 'weekly' | 'monthly'): string {
  if (granularity === 'monthly') {
    const [year, month] = dateStr.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(d, 'MMM yyyy', { locale: id });
  }
  if (granularity === 'weekly') {
    return dateStr.replace('-W', ' W');
  }
  return format(parseISO(dateStr), 'dd MMM', { locale: id });
}

export default function SalesTrendChart({ data, granularity, loading }: Props) {
  const chartData = useMemo(() =>
    data.map((entry) => ({
      ...entry,
      label: formatDateLabel(entry.date, granularity),
    })),
    [data, granularity]
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <TrendUpIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-600">Belum Ada Data</h3>
        <p className="text-xs text-gray-400 mt-1">Data penjualan akan muncul setelah ada pesanan yang selesai.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">Tren Penjualan</h3>
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={granularity === 'daily' ? Math.ceil(chartData.length / 7) : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="totalRevenue" fill="var(--primary, #11676a)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

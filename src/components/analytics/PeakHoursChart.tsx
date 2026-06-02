'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { PeakHourEntry } from '@/lib/api/analytics';
import { Clock } from 'lucide-react';

interface Props {
  data: PeakHourEntry[];
  loading?: boolean;
}

export default function PeakHoursChart({ data, loading }: Props) {
  const maxOrders = useMemo(
    () => Math.max(...data.map((d) => d.orders), 1),
    [data]
  );

  const peakHour = useMemo(() => {
    if (data.length === 0) return null;
    return data.reduce((max, curr) => (curr.orders > max.orders ? curr : max), data[0]);
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (data.every((d) => d.orders === 0)) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-600">Belum Ada Data</h3>
        <p className="text-xs text-gray-400 mt-1">Data jam sibuk akan muncul setelah ada beberapa pesanan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600">Jam Sibuk</h3>
        {peakHour && (
          <span className="text-xs text-[var(--secondary)] font-medium">
            Puncak: {peakHour.label}
          </span>
        )}
      </div>
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value, name) => {
                if (name === 'orders') return [`${value} pesanan`, 'Pesanan'];
                return [String(value), name];
              }} />}
            />
            <Bar dataKey="orders" radius={[3, 3, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.orders === maxOrders ? 'var(--primary, #11676a)' : '#d1d5db'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <p className="text-xs text-gray-400 text-center mt-2">
        Distribusi pesanan berdasarkan jam dalam sehari
      </p>
    </div>
  );
}

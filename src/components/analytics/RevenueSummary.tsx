'use client';

import type { RevenueSummary } from '@/lib/api/analytics';
import { DollarSign, TrendingDown, ShoppingBag, Package } from 'lucide-react';

interface Props {
  data: RevenueSummary;
  loading?: boolean;
}

function formatRupiah(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

const skeletonCards = [
  { label: 'Total Pendapatan', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Total Hemat Pembeli', icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Jumlah Pesanan', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Item Terjual', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function RevenueSummaryComponent({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {skeletonCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Pendapatan', value: formatRupiah(data.totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Hemat Pembeli', value: formatRupiah(data.totalSavings), icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Jumlah Pesanan', value: data.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Item Terjual', value: data.totalItems.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl shadow-sm p-4">
          <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

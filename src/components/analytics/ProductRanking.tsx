'use client';

import type { ProductPerformanceEntry } from '@/lib/api/analytics';
import { Package } from 'lucide-react';

interface Props {
  data: ProductPerformanceEntry[];
  loading?: boolean;
}

function formatRupiah(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

const categoryLabels: Record<string, string> = {
  meals: 'Makanan',
  bakery: 'Roti & Kue',
  drinks: 'Minuman',
};

export default function ProductRanking({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1" />
              <div className="h-2 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-600">Belum Ada Penjualan</h3>
        <p className="text-xs text-gray-400 mt-1">Data performa produk akan muncul setelah ada pesanan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">Produk Terlaris</h3>
      <div className="space-y-0">
        {data.map((product, idx) => (
          <div
            key={product.productId}
            className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--primary)]">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{product.productName}</p>
              <p className="text-xs text-gray-400">{categoryLabels[product.category] || product.category}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-gray-800">{product.totalSold} terjual</p>
              <p className="text-xs text-gray-400">{formatRupiah(product.totalRevenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getAdminDashboard, type AdminDashboardStats } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Store, ShoppingBag, DollarSign, ShieldCheck, Package } from 'lucide-react';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const statCards = [
  { key: 'totalUsers' as const, label: 'Food Saver', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'totalMitra' as const, label: 'Mitra', icon: Store, color: 'text-[#dda63a]', bg: 'bg-amber-50' },
  { key: 'activeProducts' as const, label: 'Produk Aktif', icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'totalOrders' as const, label: 'Total Pesanan', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'totalRevenue' as const, label: 'Pendapatan', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', format: formatCurrency },
  { key: 'pendingVerifications' as const, label: 'Verifikasi Pending', icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Memuat dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-500">Gagal memuat data dashboard</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const value = stats[card.key];
          const displayValue = card.format
            ? card.format(value as number)
            : String(value);

          return (
            <Card key={card.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {card.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{displayValue}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

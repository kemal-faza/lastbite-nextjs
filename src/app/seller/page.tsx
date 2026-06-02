'use client';

import { ArrowLeft, Store, Package, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getMitraProfile, fetchMitraStats, fetchMitraProducts, type MitraProfile, type MitraStats } from '@/lib/api/mitra';
import type { ProductData } from '@/lib/api/products';
import DashboardStatCards from '@/components/DashboardStatCards';
import ProductManagementList from '@/components/ProductManagementList';

export default function SellerDashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<MitraProfile | null>(null);
  const [stats, setStats] = useState<MitraStats | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [profileRes, statsRes, productsRes] = await Promise.all([
        getMitraProfile().catch(() => null),
        fetchMitraStats().catch(() => null),
        fetchMitraProducts().catch(() => ({ products: [] as ProductData[] })),
      ]);
      setProfile(profileRes?.profile ?? null);
      setStats(statsRes?.stats ?? null);
      setProducts(productsRes.products);
    } catch {
      // User not mitra
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Food Saver view -- not yet registered as Mitra
  if (!profile) {
    return (
      <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
        <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/profile')} className="p-1.5 -ml-1.5 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center text-white" aria-label="Kembali ke Mode Pembeli">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-base font-bold text-center">Dashboard Mitra</h1>
            <Store className="w-5 h-5 text-white/80" />
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
          <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
            <Store className="w-10 h-10 text-[var(--primary)]" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Jadi Mitra LastBite</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs">
            Daftarkan toko kamu dan mulai jual Makanan Surplus tanpa biaya platform. Bantu kurangi food waste sambil tambah penghasilan.
          </p>
          <button
            onClick={() => router.push('/seller/register')}
            className="bg-[var(--primary)] text-white font-semibold px-8 py-3 rounded-2xl hover:bg-[var(--primary)]/90 transition-colors shadow-sm"
          >
            Daftar Sebagai Mitra
          </button>
        </div>
      </div>
    );
  }

  // Mitra view -- full dashboard
  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      {/* Header */}
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/profile')} className="p-1.5 -ml-1.5 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center text-white" aria-label="Kembali ke Mode Pembeli">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-base font-bold text-center">{profile.storeName}</h1>
          <Store className="w-5 h-5 text-white/80" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28 space-y-6">
        {/* Stats */}
        {stats && (
          <section>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Ringkasan Hari Ini
            </h2>
            <DashboardStatCards stats={stats} />
            {stats.activeOrders > 0 && (
              <button
                onClick={() => router.push('/seller/orders')}
                className="mt-3 w-full bg-[var(--secondary)]/10 text-[var(--secondary)] font-medium text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--secondary)]/20 transition-colors"
              >
                <Package className="w-4 h-4" />
                {stats.activeOrders} Pesanan Masuk
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </section>
        )}

        {/* Platform Info */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Mitra LastBite</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Kamu tidak dikenakan biaya platform.
                <br />Biaya layanan ditanggung sepenuhnya oleh LastBite
                sebagai bentuk dukungan untuk mitra mengurangi food waste.
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Produk ({stats?.productCount ?? products.length})
            </h2>
            <button
              onClick={() => router.push('/seller/add')}
              className="text-xs font-medium text-[var(--primary)] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </button>
          </div>
          <ProductManagementList products={products} onProductDeleted={loadData} />
        </section>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/seller/add')}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--primary)]/90 transition-colors z-50"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}

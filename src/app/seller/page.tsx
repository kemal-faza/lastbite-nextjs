'use client';

import { ArrowLeftIcon, StorefrontIcon, PackageIcon, PlusIcon, ArrowSquareOutIcon, SpinnerIcon, ChartBarIcon, SquaresFourIcon, PencilIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getMitraProfile, fetchMitraStats, fetchMitraProducts, type MitraProfile, type MitraStats } from '@/lib/api/mitra';
import type { ProductData } from '@/lib/api/products';
import { fetchSalesTrend, fetchRevenueSummary, fetchProductPerformance, fetchPeakHours } from '@/lib/api/analytics';
import type { SalesTrendEntry, RevenueSummary, ProductPerformanceEntry, PeakHourEntry } from '@/lib/api/analytics';
import DashboardStatCards from '@/components/DashboardStatCards';
import ProductManagementList from '@/components/ProductManagementList';
import DateRangeFilter from '@/components/analytics/DateRangeFilter';
import SalesTrendChart from '@/components/analytics/SalesTrendChart';
import RevenueSummaryComponent from '@/components/analytics/RevenueSummary';
import ProductRanking from '@/components/analytics/ProductRanking';
import PeakHoursChart from '@/components/analytics/PeakHoursChart';
import CsvExportButton from '@/components/analytics/CsvExportButton';

type Tab = 'overview' | 'analytics';

export default function SellerDashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<MitraProfile | null>(null);
  const [stats, setStats] = useState<MitraStats | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Analytics state
  const [dateRange, setDateRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [salesTrend, setSalesTrend] = useState<SalesTrendEntry[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [productPerf, setProductPerf] = useState<ProductPerformanceEntry[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourEntry[]>([]);

  const loadData = async () => {
    setLoadError(null);
    try {
      const [profileRes, statsRes, productsRes] = await Promise.all([
        getMitraProfile().catch((err: any) => {
          // MITRA_NOT_FOUND (404) = user is not registered as mitra
          if (err?.code === 'MITRA_NOT_FOUND') return null;
          // Other errors (network, auth, etc.)
          throw err;
        }),
        fetchMitraStats().catch(() => null),
        fetchMitraProducts().catch(() => ({ products: [] as ProductData[] })),
      ]);
      const hasProfile = profileRes?.profile ?? null;
      const productList = productsRes.products;
      setProfile(hasProfile);
      setStats(statsRes?.stats ?? null);
      setProducts(productList);

      // Defense: profile null tapi ada produk → mitra valid, coba fetch stats ulang
      if (!hasProfile && productList.length > 0) {
        fetchMitraStats().then(r => setStats(r?.stats ?? null)).catch(() => null);
      }
    } catch (err: any) {
      console.error('Failed to load seller data:', err);
      setLoadError(err?.message || 'Gagal memuat data. Silakan coba lagi.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = useCallback(async () => {
    if (!profile) return;
    setAnalyticsLoading(true);
    try {
      const params = {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        granularity: 'daily' as const,
      };

      const [trendRes, revenueRes, productsRes, hoursRes] = await Promise.allSettled([
        fetchSalesTrend(params),
        fetchRevenueSummary(params),
        fetchProductPerformance(params),
        fetchPeakHours(params),
      ]);

      if (trendRes.status === 'fulfilled') setSalesTrend(trendRes.value.trend);
      if (revenueRes.status === 'fulfilled') setRevenueSummary(revenueRes.value.summary);
      if (productsRes.status === 'fulfilled') setProductPerf(productsRes.value.products);
      if (hoursRes.status === 'fulfilled') setPeakHours(hoursRes.value.hours);
    } catch {
      // analytics fetch failed silently
    } finally {
      setAnalyticsLoading(false);
    }
  }, [profile, dateRange]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && profile) {
      loadAnalytics();
    }
  }, [activeTab, dateRange, profile, loadAnalytics]);

  // Polling: refresh stats every 30s when on overview tab
  const prevActiveOrders = useRef<number | null>(null);
  useEffect(() => {
    if (activeTab !== 'overview' || !profile) return;
    const interval = setInterval(async () => {
      try {
        const statsRes = await fetchMitraStats().catch(() => null);
        if (statsRes?.stats) {
          prevActiveOrders.current = statsRes.stats.activeOrders;
          setStats(statsRes.stats);
        }
      } catch {
        // silent
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab, profile]);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-[var(--background)]">
        <SpinnerIcon className="w-6 h-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Error state - API failure
  if (loadError) {
    return (
      <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
        <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/profile')} className="p-1.5 -ml-1.5 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center text-white" aria-label="Kembali ke Mode Pembeli">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-base font-bold text-center">Dashboard Mitra</h1>
            <StorefrontIcon className="w-5 h-5 text-white/80" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <StorefrontIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Gagal Memuat Data</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs">{loadError}</p>
          <button
            onClick={() => { setLoading(true); loadData(); }}
            className="bg-[var(--primary)] text-white font-semibold px-8 py-3 rounded-2xl hover:bg-[var(--primary)]/90 transition-colors shadow-sm"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Profile null tapi ada produk → mitra valid, API profile bermasalah
  if (!profile && products.length > 0) {
    return (
      <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
        <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/profile')} className="p-1.5 -ml-1.5 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center text-white" aria-label="Kembali ke Mode Pembeli">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-base font-bold text-center">Dashboard Mitra</h1>
            <StorefrontIcon className="w-5 h-5 text-white/80" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <StorefrontIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Data Mitra Tidak Lengkap</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs">
            Profil mitra tidak ditemukan meskipun kamu memiliki produk. Silakan hubungi admin.
          </p>
          <button
            onClick={() => { setLoading(true); loadData(); }}
            className="bg-[var(--primary)] text-white font-semibold px-8 py-3 rounded-2xl hover:bg-[var(--primary)]/90 transition-colors shadow-sm"
          >
            Coba Lagi
          </button>
        </div>
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
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-base font-bold text-center">Dashboard Mitra</h1>
            <StorefrontIcon className="w-5 h-5 text-white/80" />
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
          <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
            <StorefrontIcon className="w-10 h-10 text-[var(--primary)]" />
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

  // Mitra view
  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      {/* Header */}
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/profile')} className="p-1.5 -ml-1.5 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center text-white" aria-label="Kembali ke Mode Pembeli">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-base font-bold text-center">{profile.storeName}</h1>
          <StorefrontIcon className="w-5 h-5 text-white/80" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-[var(--primary)] shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <SquaresFourIcon className="w-3.5 h-3.5" />
            Ringkasan
          </button>
          <button
            onClick={() => {
              setActiveTab('analytics');
              router.push('/seller');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-[var(--primary)] shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <ChartBarIcon className="w-3.5 h-3.5" />
            Analitik
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28">
        {activeTab === 'overview' ? (
          /* === OVERVIEW TAB === */
          <div className="space-y-6">
            {stats && (
              <section>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Ringkasan Hari Ini
                </h2>
                <DashboardStatCards stats={stats} onCardClick={(key) => {
                  if (key === 'totalSold') {
                    setActiveTab('analytics');
                    router.push('/seller');
                  } else {
                    document.getElementById('seller-products-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} />
                <button
                  onClick={() => router.push('/seller/orders')}
                  className="mt-3 w-full bg-[var(--secondary)]/10 text-[var(--secondary)] font-medium text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--secondary)]/20 transition-colors relative"
                >
                  <PackageIcon className="w-4 h-4" />
                  {stats.activeOrders > 0 ? `${stats.activeOrders} Pesanan Masuk` : 'Lihat Pesanan'}
                  <ArrowSquareOutIcon className="w-3.5 h-3.5" />
                  {stats.activeOrders > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {stats.activeOrders > 9 ? '9+' : stats.activeOrders}
                    </span>
                  )}
                </button>
              </section>
            )}

            {/* Aksi Cepat */}
            <section>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Aksi Cepat
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => router.push('/seller/add')}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                    <PlusIcon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Tambah Produk</span>
                </button>
                <button
                  onClick={() => router.push('/seller/orders')}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <PackageIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Pesanan Masuk</span>
                </button>
                <button
                  onClick={() => router.push('/seller')}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Lihat Analitik</span>
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <PencilIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Edit Profil</span>
                </button>
              </div>
            </section>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <StorefrontIcon className="w-5 h-5 text-green-700" />
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

            <section id="seller-products-section">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Produk ({stats?.productCount ?? products.length})
                </h2>
                <button
                  onClick={() => router.push('/seller/add')}
                  className="text-xs font-medium text-[var(--primary)] flex items-center gap-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Tambah
                </button>
              </div>
              <ProductManagementList products={products} onProductDeleted={loadData} />
            </section>
          </div>
        ) : (
          /* === ANALYTICS TAB === */
          <div className="space-y-5">
            {/* Date Range + Export */}
            <div className="flex items-center justify-between">
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
              <CsvExportButton
                from={dateRange.from.toISOString()}
                to={dateRange.to.toISOString()}
                disabled={analyticsLoading}
              />
            </div>

            {/* Revenue Summary */}
            <RevenueSummaryComponent
              data={revenueSummary || { totalRevenue: 0, totalSavings: 0, totalOrders: 0, totalItems: 0, averageOrderValue: 0 }}
              loading={analyticsLoading}
            />

            {/* Sales Trend */}
            <SalesTrendChart data={salesTrend} granularity="daily" loading={analyticsLoading} />

            {/* Peak Hours */}
            <PeakHoursChart data={peakHours} loading={analyticsLoading} />

            {/* Product Ranking */}
            <ProductRanking data={productPerf} loading={analyticsLoading} />
          </div>
        )}
      </div>

      {/* FAB - only on overview tab */}
      {activeTab === 'overview' && (
        <button
          onClick={() => router.push('/seller/add')}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--primary)]/90 transition-colors z-50"
        >
          <PlusIcon className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}

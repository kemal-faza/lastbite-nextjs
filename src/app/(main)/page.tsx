'use client';

import { useState, useCallback } from 'react';
import { ShieldCheckIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductGrid } from '@/components/ProductGrid';
import { AIRecommendation } from '@/components/AIRecommendation';
import { FilterBar } from '@/components/FilterBar';
import { useProducts } from '@/hooks/useProduct';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useHasPurchaseHistory } from '@/hooks/useHasPurchaseHistory';
import type { SortOption } from '@/components/FilterBar';
import type { FilterValues } from '@/components/FilterModal';

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [filters, setFilters] = useState<FilterValues>({
    maxDistance: 10,
    maxPrice: 100000,
    maxExpiry: 'Hari Ini',
  });

  const { lat, lng } = useGeolocation();
  const hasPurchaseHistory = useHasPurchaseHistory();

  // Map frontend sort to backend sort param
  const sortParam =
    sortBy === 'price-asc' ? 'price_asc' :
    sortBy === 'price-desc' ? 'price_desc' :
    sortBy === 'distance-asc' ? 'distance_asc' :
    sortBy === 'remaining-asc' ? 'stock_asc' :
    undefined;

  const radiusParam = filters.maxDistance < 10 ? filters.maxDistance : undefined;

  const { products, loading, error } = useProducts({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    sort: sortParam,
    lat: lat ?? undefined,
    lng: lng ?? undefined,
    radius: radiusParam,
  });

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [router]);

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-6 space-y-4">
        <SearchBar value="" onChange={handleSearch} />
        <div className="bg-[var(--primary)]/5 rounded-xl p-3 flex items-center gap-3 border border-[var(--primary)]/10">
          <div className="bg-[var(--primary)]/10 p-1.5 rounded-full">
            <ShieldCheckIcon className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <p className="text-xs text-[var(--primary)] leading-relaxed">
            <span className="font-semibold">Makanan Surplus Aman.</span> Setiap produk melewati cek kualitas. Diproduksi hari yang sama dengan standar higienis terjamin.
          </p>
        </div>
        {hasPurchaseHistory === true && (
          <AIRecommendation products={products} />
        )}
        {hasPurchaseHistory === undefined && (
          <div className="mb-6 p-4 rounded-xl bg-gray-50 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48 mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-32 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
          </div>
        )}
        <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
        <FilterBar
          activeSort={sortBy}
          onSortChange={setSortBy}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <ProductGrid
          products={products}
          loading={loading}
          error={error?.message ?? null}
        />
      </div>
    </div>
  );
}

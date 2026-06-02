'use client';

import { useState, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductGrid } from '@/components/ProductGrid';
import { AIRecommendation } from '@/components/AIRecommendation';
import { FilterBar } from '@/components/FilterBar';
import { useProducts } from '@/hooks/useProduct';
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

  // Map frontend sort to backend sort param
  const sortParam =
    sortBy === 'price-asc' ? 'price_asc' :
    sortBy === 'price-desc' ? 'price_desc' :
    sortBy === 'remaining-asc' ? 'oldest' :
    undefined;

  const { products, loading, error } = useProducts({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    sort: sortParam,
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
            <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <p className="text-xs text-[var(--primary)] leading-relaxed">
            <span className="font-semibold">Makanan Surplus Aman.</span> Setiap produk melewati cek kualitas. Diproduksi hari yang sama dengan standar higienis terjamin.
          </p>
        </div>
        <AIRecommendation />
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
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

'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductGrid } from '@/components/ProductGrid';
import { AIRecommendation } from '@/components/AIRecommendation';
import { FilterBar } from '@/components/FilterBar';
import type { SortOption } from '@/components/FilterBar';
import type { FilterValues } from '@/components/FilterModal';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [filters, setFilters] = useState<FilterValues>({
    maxDistance: 10,
    maxPrice: 100000,
    maxExpiry: 'Hari Ini'
  });

  return (
    <div className="flex flex-col">
      <Header />
      <div className="px-4 pt-4 pb-6 space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
          selectedCategory={selectedCategory} 
          searchQuery={searchQuery} 
          sortBy={sortBy} 
          filters={filters}
        />
      </div>
    </div>
  );
}

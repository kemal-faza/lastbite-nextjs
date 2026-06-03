'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, ClockIcon, TrendUpIcon, XIcon } from '@phosphor-icons/react';
import { useProductSearch } from '@/hooks/useProductSearch';
import { ProductCard } from '@/components/ProductCard';

const RECENT_SEARCHES = ['Roti Gandum', 'Salad', 'Kopi', 'Croissant'];
const TRENDING_SEARCHES = [
  'Sushi',
  'Nasi Goreng',
  'Smoothie',
  'Tiramisu',
  'Buah Segar',
];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 p-4">
      <div className="h-40 bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
    </div>
  );
}

export default function SearchPage() {
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);
  const { results, total, loading, error, query, setQuery } = useProductSearch();

  const handleSearch = (term: string) => {
    setQuery(term);
    if (term.trim() && !recentSearches.includes(term)) {
      setRecentSearches((prev) => [term, ...prev].slice(0, 5));
    }
  };

  const removeRecent = (itemToRemove: string) => {
    setRecentSearches(
      recentSearches.filter((item) => item !== itemToRemove),
    );
  };

  return (
    <div className="flex flex-col bg-white h-screen">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white pb-3 px-4 pt-3 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm transition-all"
            placeholder="Cari makanan atau toko..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setQuery('')}>
              <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {!query ? (
          <div className="space-y-8 mt-2">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Pencarian Terakhir
                  </h2>
                  <button
                    onClick={() => setRecentSearches([])}
                    className="text-xs font-medium text-red-500 hover:text-red-600">
                    Hapus Semua
                  </button>
                </div>
                <div className="space-y-3">
                  {recentSearches.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between group">
                      <button
                        type="button"
                        className="flex items-center gap-3 cursor-pointer flex-1 text-left"
                        onClick={() =>
                          handleSearch(item)
                        }>
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {item}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          removeRecent(item)
                        }
                        className="p-1">
                        <XIcon className="w-4 h-4 text-gray-300 hover:text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Searches */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendUpIcon className="w-4 h-4 text-green-500" />
                Populer Saat Ini
              </h2>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(item)}
                    className="px-4 py-2 bg-green-50 text-green-700 text-sm rounded-full border border-green-100 hover:bg-green-100 transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : loading ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Mencari &quot;{query}&quot;...
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 mt-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XIcon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              Pencarian gagal
            </h3>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">
                {total} hasil untuk &quot;{query}&quot;
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 mt-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              Tidak ada hasil untuk &quot;{query}&quot;
            </h3>
            <p className="text-sm text-gray-500">
              Coba kata kunci lain atau cek kategori yang tersedia
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { products } from '@/lib/data/products';
import { type ProductData } from '@/lib/api/products';
import type { SortOption } from './FilterBar';
import type { FilterValues } from './FilterModal';

interface ProductGridProps {
	selectedCategory: string;
	searchQuery: string;
	sortBy: SortOption;
	filters: FilterValues;
}

function parseDistance(d: string): number {
  const s = d.toLowerCase().replace(/[^0-9.]/g, '');
  const num = parseFloat(s) || 0;
  if (d.toLowerCase().includes('km')) return num * 1000;
  return num || 999;
}

function parseExpiry(e: string): number {
	const num = parseInt(e.replace(/\D/g, ''), 10) || 0;
	if (e.includes('menit') || e.includes('min')) return num;
	if (e.includes('jam')) return num * 60;
	return 999;
}

function toProductData(p: typeof products[number]): ProductData {
  return {
    id: String(p.id),
    name: p.name,
    description: null,
    category: p.category,
    originalPrice: p.originalPrice,
    discountedPrice: p.discountedPrice,
    discountPercent: p.discount,
    stock: p.remaining,
    imageUrl: p.image,
    storeName: p.store,
    storeAddress: null,
    storeLat: null,
    storeLng: null,
    expiresAt: new Date(Date.now() + parseInt(p.expiresIn) * 3600000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function ProductGrid({
	selectedCategory,
	searchQuery,
	sortBy,
	filters,
}: ProductGridProps) {
	const filteredProducts = useMemo(() => {
		let result = products.filter((product) => {
			const matchesCategory =
				selectedCategory === 'all' ||
				product.category === selectedCategory;
			const matchesSearch =
				product.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				product.store.toLowerCase().includes(searchQuery.toLowerCase());
			
			// Filter harga
			const matchesPrice = product.discountedPrice <= filters.maxPrice;
			
			// Filter jarak (konversi km ke meter)
			const matchesDistance =
				filters.maxDistance === 10 ||
				parseDistance(product.distance) <= filters.maxDistance * 1000;
			
			// Filter kedaluwarsa
			let maxExpiryMinutes = 9999;
			if (filters.maxExpiry === '< 1 Jam') maxExpiryMinutes = 60;
			else if (filters.maxExpiry === '< 3 Jam') maxExpiryMinutes = 180;
			else if (filters.maxExpiry === '< 6 Jam') maxExpiryMinutes = 360;
			
			const matchesExpiry =
				filters.maxExpiry === 'Hari Ini' ||
				parseExpiry(product.expiresIn) <= maxExpiryMinutes;

			return matchesCategory && matchesSearch && matchesPrice && matchesDistance && matchesExpiry;
		});

		switch (sortBy) {
			case 'price-asc':
				result.sort((a, b) => a.discountedPrice - b.discountedPrice);
				break;
			case 'price-desc':
				result.sort((a, b) => b.discountedPrice - a.discountedPrice);
				break;
			case 'distance-asc':
				result.sort(
					(a, b) =>
						parseDistance(a.distance) - parseDistance(b.distance),
				);
				break;
			case 'remaining-asc':
				result.sort(
					(a, b) =>
						a.remaining - b.remaining,
				);
				break;
			default:
				break;
		}

		return result;
	}, [selectedCategory, searchQuery, sortBy, filters]);

	const productDataList = useMemo(() => filteredProducts.map(toProductData), [filteredProducts]);

	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<h2 className="font-semibold text-gray-900">
					{filteredProducts.length} Produk Tersedia
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-4 pb-12">
				{productDataList.map((product) => (
					<ProductCard
						key={product.id}
						product={product}
					/>
				))}
			</div>

			{filteredProducts.length === 0 && (
				<div className="text-center py-12">
					<p className="text-gray-500">Tidak ada produk ditemukan</p>
				</div>
			)}
		</div>
	);
}

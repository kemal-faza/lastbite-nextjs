'use client';

import { useState, useMemo } from 'react';
import { Search as SearchIcon, Clock, TrendingUp, X } from 'lucide-react';
import { products } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';

const RECENT_SEARCHES = ['Roti Gandum', 'Salad', 'Kopi', 'Croissant'];
const TRENDING_SEARCHES = [
	'Sushi',
	'Nasi Goreng',
	'Smoothie',
	'Tiramisu',
	'Buah Segar',
];

export default function SearchPage() {
	const [query, setQuery] = useState('');
	const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

	const searchResults = useMemo(() => {
		if (!query.trim()) return [];
		const q = query.toLowerCase();
		return products.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.store.toLowerCase().includes(q) ||
				p.category.toLowerCase().includes(q),
		);
	}, [query]);

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
		<div className="flex flex-col bg-white h-full">
			{/* Search Header */}
			<div className="sticky top-0 z-10 bg-white pt-6 pb-3 px-4 border-b border-gray-100">
				<h1 className="text-xl font-bold text-gray-900 mb-4">
					Pencarian
				</h1>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<SearchIcon className="h-5 w-5 text-gray-400" />
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
							<X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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
												<Clock className="w-4 h-4 text-gray-400" />
												<span className="text-sm text-gray-700">
													{item}
												</span>
											</button>
											<button
												onClick={() =>
													removeRecent(item)
												}
												className="p-1">
												<X className="w-4 h-4 text-gray-300 hover:text-gray-500" />
											</button>
										</div>
									))}
								</div>
							</section>
						)}

						{/* Trending Searches */}
						<section>
							<h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<TrendingUp className="w-4 h-4 text-green-500" />
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
				) : searchResults.length > 0 ? (
					<div>
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-sm font-semibold text-gray-900">
								{searchResults.length} hasil untuk &quot;{query}&quot;
							</h2>
						</div>
						<div className="grid grid-cols-1 gap-4">
							{searchResults.map((product) => (
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
							<SearchIcon className="w-8 h-8 text-gray-400" />
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

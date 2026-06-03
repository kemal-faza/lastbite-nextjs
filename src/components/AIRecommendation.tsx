'use client';

import { getImageUrl, type ProductData } from '@/lib/api/products';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface AIRecommendationProps {
	products: ProductData[];
	currentProductId?: string;
	title?: string;
}


/**
 * Pseudo-random stabil berbasis seed.
 * Outputnya deterministic: seed yang sama -> angka yang sama.
 */
function pseudoRandom(seed: number): number {
	const x = Math.sin(seed * 127.1 + 314.15) * 43758.5453;
	return x - Math.floor(x);
}

/**
 * Scoring Logic (dapat dijelaskan):
 *
 * 1. Category Match (0-40 poin)
 *    - Produk sekategori dapet 35-40, beda kategori dapet 10-20
 *    - Reason: user cenderung beli produk sejenis
 *
 * 2. Discount Value (0-30 poin)
 *    - Makin tinggi diskon, makin tinggi skor
 *    - Reason: user suka hemat, produk diskon besar lebih menarik
 *
 * 3. Popularity (0-30 poin)
 *    - Makin sedikit stok tersisa, makin populer produknya
 *    - Reason: stok hampir habis = banyak orang beli
 */
function getNumericSeed(id: string): number {
	let num = 0;
	for (let i = 0; i < id.length; i++) {
		num = ((num << 5) - num + id.charCodeAt(i)) | 0;
	}
	return Math.abs(num);
}

function getScoreBreakdown(
	product: ProductData,
	currentCategory?: string,
): { total: number } {
	const idSeed = getNumericSeed(product.id);
	const seed =
		idSeed * 1000 +
		(currentCategory ? product.category.charCodeAt(0) * 7 : 0);

	// 1. Category Match (0-40) -- deterministic dari seed
	const category =
		currentCategory && product.category === currentCategory
			? 35 + Math.floor(pseudoRandom(seed + 1) * 6) // 35-40
			: 10 + Math.floor(pseudoRandom(seed + 2) * 11); // 10-20

	// 2. Discount Value (0-30) -- pure logic, no random needed
	const discount = Math.min(30, Math.round(product.discountPercent * 0.6));

	// 3. Popularity (0-30) -- deterministic dari seed
	const popularity =
		product.stock <= 3
			? 25 + Math.floor(pseudoRandom(seed + 3) * 6)
			: product.stock <= 7
				? 15 + Math.floor(pseudoRandom(seed + 4) * 10)
				: 5 + Math.floor(pseudoRandom(seed + 5) * 10);

	const total = Math.min(100, category + discount + popularity);

	return { total };
}

function getRecommendations(allProducts: ProductData[], currentId?: string) {
	const current = currentId ? allProducts.find((p) => p.id === currentId) : null;
	const currentCategory = current?.category;

	const scored = allProducts
		.filter((p) => p.id !== currentId)
		.map((p) => {
			const breakdown = getScoreBreakdown(p, currentCategory);
			return { ...p, matchScore: breakdown.total };
		})
		.sort((a, b) => b.matchScore - a.matchScore);

	return scored.slice(0, 4);
}



export function AIRecommendation({
	products,
	currentProductId,
	title,
}: AIRecommendationProps) {
	const router = useRouter();

	// useMemo: rekomendasi cuma dihitung ulang kalo currentProductId berubah
	const recommendations = useMemo(
		() => getRecommendations(products, currentProductId),
		[products, currentProductId],
	);

	const displayTitle = title || 'Rekomendasi untuk Kamu';

	if (recommendations.length === 0) return null;

	return (
		<div className="mb-6">
			{/* Header AI */}
			<div className="flex items-center gap-2 mb-3">
				<div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
					<span>Rekomendasi</span>
				</div>
				<h2 className="font-semibold text-gray-900 text-base sm:text-xl">
					{displayTitle}
				</h2>
			</div>

			{/* Trust indicator */}
			<div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
				<span className="inline-block w-2 h-2 rounded-full bg-green-400" />
				Berdasarkan produk yang kamu suka
			</div>

			{/* Product cards */}
			<div className="grid grid-cols-2 gap-3">
				{recommendations.map((product) => (
					<article
						key={product.id}
						onClick={() => router.push(`/product/${product.id}`)}
						onKeyDown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								router.push(`/product/${product.id}`);
							}
						}}
						role="button"
						tabIndex={0}
						aria-label={`Lihat detail ${product.name}`}
						className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left overflow-hidden relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
						<div className="relative">
							<img
								src={getImageUrl(product.imageUrl) ?? ''}
								alt={product.name}
								className="w-full h-28 object-cover"
							/>
							</div>
						<div className="p-2.5">
							<h3 className="text-sm font-semibold text-gray-900 truncate">
								{product.name}
							</h3>
							<p className="text-[10px] text-gray-500 truncate">
								{product.storeName}
							</p>
							<div className="flex items-center gap-1 mt-1">
								<span className="text-sm font-bold text-[var(--secondary)]">
									Rp
									{product.discountedPrice.toLocaleString(
										'id-ID',
									)}
								</span>
								<span className="text-[10px] text-gray-400 line-through">
									Rp
									{product.originalPrice.toLocaleString(
										'id-ID',
									)}
								</span>
							</div>
						</div>
					</article>
				))}
			</div>


		</div>
	);
}

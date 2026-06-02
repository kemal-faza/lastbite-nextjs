'use client';

import { useParams, useRouter } from 'next/navigation';
import {
	ChevronLeft,
	Clock,
	Heart,
	MapPin,
	Star,
	Check,
	ShoppingBag,
	ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useProduct, useProducts } from '@/hooks/useProduct';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { AIRecommendation } from '@/components/AIRecommendation';
import { useCart } from '@/lib/context/CartContext';
import { useWishlist } from '@/lib/context/WishlistContext';
import { QueueIndicator } from '@/components/QueueIndicator';
import { MapModal } from '@/components/MapModal';
import { ReviewList } from '@/components/ReviewList';
import { useReviews } from '@/hooks/useReviews';
import { fetchTrustBadges } from '@/lib/api/reviews';
import { useState, useEffect } from 'react';
import { formatExpiry } from '@/lib/utils/date';
import { formatDistance } from '@/lib/utils/distance';

function LoadingSkeleton() {
	return (
		<div className="flex flex-col h-full w-full animate-pulse">
			<header className="bg-[var(--primary)] text-white px-4 py-3 flex items-center gap-3 shrink-0">
				<button className="p-1" disabled>
					<ChevronLeft className="w-6 h-6" />
				</button>
				<h1 className="text-lg font-semibold">Detail Produk</h1>
			</header>
			<div className="flex-1 overflow-y-auto pb-44">
				<div className="w-full h-64 bg-gray-200" />
				<div className="px-4 py-4 space-y-4">
					<div className="space-y-2">
						<div className="h-6 bg-gray-200 rounded w-1/3" />
						<div className="h-8 bg-gray-200 rounded w-2/3" />
					</div>
					<div className="h-8 bg-gray-200 rounded w-1/2" />
					<div className="h-20 bg-gray-200 rounded" />
					<div className="h-20 bg-gray-200 rounded" />
				</div>
			</div>
		</div>
	);
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
	const router = useRouter();
	return (
		<div className="flex flex-col items-center justify-center h-full p-4">
			<p className="text-gray-500 mb-4">{message}</p>
			<div className="flex gap-3">
				<button
					onClick={onRetry}
					className="text-[var(--primary)] font-medium px-4 py-2 rounded-xl border border-[var(--primary)] hover:bg-[var(--primary)]/5"
				>
					Coba Lagi
				</button>
				<button
					onClick={() => router.push('/')}
					className="text-[var(--primary)] font-medium px-4 py-2"
				>
					Kembali ke Beranda
				</button>
			</div>
		</div>
	);
}

export default function DetailProductPage() {
	const { id } = useParams();
	const router = useRouter();
	const { product, loading, error, refetch } = useProduct(id as string);
	const { products: allProducts } = useProducts();
	const { items: cartItems, addItem, clearCart } = useCart();
	const [isMapOpen, setIsMapOpen] = useState(false);
	const { toggle, isWishlisted } = useWishlist();
	const isFav = isWishlisted(product?.id || '');

	const {
		reviews,
		avgRating,
		totalReviews,
		ratingDistribution,
		loading: reviewsLoading,
		error: reviewsError,
		hasMore,
		loadMore,
	} = useReviews(product?.id || '');

	const [trustBadges, setTrustBadges] = useState<Array<{ label: string; icon: string }>>([]);
	useEffect(() => {
		if (!product?.id) return;
		fetchTrustBadges(product.id)
			.then((r) => setTrustBadges(r.badges))
			.catch(() => {});
	}, [product?.id]);

	if (loading) {
		return <LoadingSkeleton />;
	}

	if (error) {
		return <ErrorState message={error.message} onRetry={refetch} />;
	}

	if (!product) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-4">
				<p className="text-gray-500 mb-4">Produk tidak ditemukan</p>
				<button
					onClick={() => router.push('/')}
					className="text-[var(--primary)] font-medium">
					Kembali ke Beranda
				</button>
			</div>
		);
	}

	const cartItem = cartItems.find((item) => item.productId === product.id);
	const isOutOfStock = product.stock <= 0;
	const isCartFull = cartItem ? cartItem.quantity >= product.stock : false;
	const cannotBuy = isOutOfStock || isCartFull;

	return (
		<div className="flex flex-col h-full w-full">
			{/* Header */}
			<header className="bg-[var(--primary)] text-white px-4 py-3 flex items-center gap-3 shrink-0">
				<button
					onClick={() => router.back()}
					className="p-1">
					<ChevronLeft className="w-6 h-6" />
				</button>
				<h1 className="text-lg font-semibold">Detail Produk</h1>
			</header>

			{/* Scrollable content */}
			<div className="flex-1 overflow-y-auto pb-44">
				{/* Product image */}
				<div className="relative">
					<ImageWithFallback
						src={product.imageUrl}
						alt={product.name}
						className="w-full h-64 object-cover"
					/>
					<div className="absolute top-3 right-3 bg-[var(--destructive)] text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
						-{product.discountPercent}%
					</div>
					<div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
						<Clock className="w-3 h-3 text-[var(--secondary)]" />
						<span className="text-xs font-medium text-[var(--secondary)]">
							{formatExpiry(product.expiresAt)}
						</span>
					</div>
					<button
						onClick={(e) => {
							e.stopPropagation();
							toggle(product.id);
						}}
						className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all z-10"
						aria-label={
							isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'
						}>
						<Heart
							className={
								'w-4 h-4 ' +
								(isFav
									? 'fill-red-500 text-red-500'
									: 'text-gray-600')
							}
						/>
					</button>
				</div>

				{/* Product info */}
				<div className="px-4 py-4 space-y-4">
					{/* Dynamic trust badges + name */}
					<div>
						<div className="flex flex-wrap items-center gap-2 mb-2">
							{trustBadges.map((badge) => {
								const iconClass = badge.icon === 'verified'
									? 'bg-green-50 text-green-700 border-green-100'
									: badge.icon === 'hygiene'
									? 'bg-[var(--primary)]/10 text-[var(--primary)]'
									: badge.icon === 'popular'
									? 'bg-amber-50 text-amber-700 border-amber-100'
									: 'bg-gray-50 text-gray-700 border-gray-100';
								return (
									<div key={badge.label} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${iconClass}`}>
										{badge.icon === 'verified' && <ShieldCheck className="w-3.5 h-3.5" />}
										{badge.icon === 'hygiene' && <Check className="w-3 h-3" />}
										{badge.icon === 'popular' && <Star className="w-3 h-3 fill-current" />}
										{badge.label}
									</div>
								);
							})}
						</div>
						<h2 className="text-2xl font-bold text-gray-900 leading-tight">
							{product.name}
						</h2>
						<div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-gray-500">
							<span className="font-semibold text-gray-700">
								{product.storeName}
							</span>
							{product.distanceKm != null && (
								<>
									<span>·</span>
									<span className="text-[var(--primary)] font-semibold text-xs">
										{formatDistance(product.distanceKm)}
									</span>
								</>
							)}
							<span>·</span>
							<span className="bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.5 rounded">
								★ {avgRating !== null ? avgRating.toFixed(1) : '--'} ({totalReviews} ulasan)
							</span>
							<span>·</span>
							<span className="text-green-600 font-medium">
								350+ diselamatkan
							</span>
						</div>
					</div>

					{/* Price */}
					<div>
						<div className="flex items-baseline gap-2">
							<span className="text-2xl font-bold text-[var(--secondary)]">
								Rp
								{product.discountedPrice.toLocaleString(
									'id-ID',
								)}
							</span>
							<span className="text-sm text-gray-400 line-through">
								Rp
								{product.originalPrice.toLocaleString('id-ID')}
							</span>
						</div>
						<p className="text-[var(--destructive)] font-medium text-sm mt-1">
							Sisa {product.stock} porsi
						</p>
					</div>

					{/* Time info */}
					<div className="text-gray-500 text-sm space-y-0.5">
						<p>Diproduksi: 12.00 WIB | Batas konsumsi: 19.00 WIB</p>
					</div>

					{/* Queue */}
					<QueueIndicator
						initialQueue={3}
						storeName={product.storeName}
					/>

					{/* Description */}
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
						<h3 className="font-semibold text-gray-900 mb-2">
							Deskripsi
						</h3>
						<p className="text-gray-700 text-sm leading-relaxed">
							{product.description || `${product.name} dari ${product.storeName}. Masih segar dan layak konsumsi, dibuat pada hari yang sama dengan standar kebersihan terjaga. Hemat hingga ${product.discountPercent}% dan bantu kurangi food waste!`}
						</p>
						<button
							onClick={() => setIsMapOpen(true)}
							className="mt-4 w-full flex items-center justify-center gap-2 py-2 border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
							<MapPin className="w-4 h-4" />
							Lihat di Peta
						</button>
					</div>

					{/* Reviews with real data */}
					<div>
						<h3 className="font-bold text-lg text-gray-900 mb-3">
							Ulasan Pembeli
						</h3>
						<ReviewList
							reviews={reviews}
							avgRating={avgRating}
							totalReviews={totalReviews}
							ratingDistribution={ratingDistribution}
							loading={reviewsLoading}
							error={reviewsError}
							hasMore={hasMore}
							onLoadMore={loadMore}
						/>
					</div>

					{/* AI Recommendation */}
					<div className="pt-2">
						<AIRecommendation
							products={allProducts}
							currentProductId={product.id}
							title="Kamu mungkin juga suka"
						/>
					</div>
				</div>
			</div>

			{/* Bottom CTA */}
			<div className="fixed bottom-[72px] left-4 right-4 max-w-[calc(theme(maxWidth.md)-2rem)] mx-auto bg-white/95 backdrop-blur-md border border-gray-100 p-4 z-40 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]">
				<button
					disabled={cannotBuy}
					onClick={() => {
						if (
							cartItems.length > 0 &&
							cartItems[0].store !== product.storeName
						) {
							const confirmed = window.confirm(
								'Keranjangmu berisi item dari ' +
									cartItems[0].store +
									'. Hapus dan ganti?',
							);
							if (!confirmed) return;
							clearCart();
						}
						addItem(product.id);
						router.push('/cart');
					}}
					className={
						'w-full font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all ' +
						(cannotBuy
							? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
							: 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 active:scale-[0.98]')
					}>
					<ShoppingBag className="w-5 h-5" />
					{isOutOfStock
						? 'Stok Habis'
						: isCartFull
							? 'Stok di Keranjang Penuh'
							: 'Beli'}
				</button>
				<p className="text-center text-gray-400 text-xs mt-1.5">
					Lanjut ke keranjang untuk checkout
				</p>
			</div>

			<MapModal
				isOpen={isMapOpen}
				onClose={() => setIsMapOpen(false)}
				storeName={product.storeName}
				address={product.storeAddress ?? undefined}
				storeLat={product.storeLat}
				storeLng={product.storeLng}
			/>
		</div>
	);
}

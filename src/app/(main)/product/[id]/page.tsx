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
import { products, type Product } from '@/lib/data/products';
import { AIRecommendation } from '@/components/AIRecommendation';
import { useCart } from '@/lib/context/CartContext';
import { useWishlist } from '@/lib/context/WishlistContext';
import { QueueIndicator } from '@/components/QueueIndicator';
import { MapModal } from '@/components/MapModal';
import { useState } from 'react';

const reviews = [
	{
		id: 1,
		name: 'Andi',
		rating: 5,
		text: 'Enak banget, ayamnya masih fresh. Recommended buat anak kos!',
	},
	{
		id: 2,
		name: 'Sari',
		rating: 4,
		text: 'Lumayan buat anak kos, murah meriah. Packagingnya rapi.',
	},
	{
		id: 3,
		name: 'Dimas',
		rating: 5,
		text: 'Sudah 3x beli di sini, ga pernah mengecewakan.',
	},
];

export default function DetailProductPage() {
	const { id } = useParams();
	const router = useRouter();
	const { items: cartItems, addItem, clearCart } = useCart();

	const product = products.find((p) => p.id === Number(id));
	const [isMapOpen, setIsMapOpen] = useState(false);
	const { toggle, isWishlisted } = useWishlist();
	const isFav = isWishlisted(product?.id ?? 0);

	const cartItem = product
		? cartItems.find((item) => item.id === product.id)
		: undefined;
	const isOutOfStock = product ? product.remaining <= 0 : true;
	const isCartFull =
		product && cartItem ? cartItem.quantity >= product.remaining : false;
	const cannotBuy = isOutOfStock || isCartFull;

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
					<img
						src={product.image}
						alt={product.name}
						className="w-full h-64 object-cover"
					/>
					<div className="absolute top-3 right-3 bg-[var(--destructive)] text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
						-{product.discount}%
					</div>
					<div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
						<Clock className="w-3 h-3 text-[var(--secondary)]" />
						<span className="text-xs font-medium text-[var(--secondary)]">
							{product.expiresIn}
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
					{/* Hygiene badge + name */}
					<div>
						<div className="flex flex-wrap items-center gap-2 mb-2">
							<div className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
								<ShieldCheck className="w-3.5 h-3.5" />
								Mitra Terverifikasi
							</div>
							<div className="inline-flex items-center gap-1 bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-xs font-medium">
								<Check className="w-3 h-3" />
								Higienis A+
							</div>
						</div>
						<h2 className="text-2xl font-bold text-gray-900 leading-tight">
							{product.name}
						</h2>
						<div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-gray-500">
							<span className="font-semibold text-gray-700">
								{product.store}
							</span>
							<span>•</span>
							<span className="bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.5 rounded">
								★ 4.8 (12 ulasan)
							</span>
							<span>•</span>
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
							Sisa {product.remaining} porsi
						</p>
					</div>

					{/* Time info */}
					<div className="text-gray-500 text-sm space-y-0.5">
						<p>Diproduksi: 12.00 WIB | Batas konsumsi: 19.00 WIB</p>
					</div>

					{/* Queue */}
					<QueueIndicator
						initialQueue={3}
						storeName={product.store}
					/>

					{/* Description */}
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
						<h3 className="font-semibold text-gray-900 mb-2">
							Deskripsi
						</h3>
						<p className="text-gray-700 text-sm leading-relaxed">
							{product.name} dari {product.store}. Masih segar dan
							layak konsumsi, dibuat pada hari yang sama dengan
							standar kebersihan terjaga. Hemat hingga{' '}
							{product.discount}% dan bantu kurangi food waste!
						</p>
						<button
							onClick={() => setIsMapOpen(true)}
							className="mt-4 w-full flex items-center justify-center gap-2 py-2 border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
							<MapPin className="w-4 h-4" />
							Lihat di Peta
						</button>
					</div>

					{/* Trust & Safety */}
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
						<h3 className="font-semibold text-gray-900 mb-3">
							Kenapa Produk Ini Aman
						</h3>
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-green-50 rounded-xl p-3">
								<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
									<Check className="w-4 h-4 text-green-700" />
								</div>
								<p className="text-xs font-semibold text-gray-900">
									Diproduksi Hari Ini
								</p>
								<p className="text-[10px] text-gray-500 mt-0.5">
									Makanan fresh, bukan sisa kemarin
								</p>
							</div>
							<div className="bg-blue-50 rounded-xl p-3">
								<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
									<Check className="w-4 h-4 text-blue-700" />
								</div>
								<p className="text-xs font-semibold text-gray-900">
									Higienis & Bersih
								</p>
								<p className="text-[10px] text-gray-500 mt-0.5">
									Standar kebersihan terjamin
								</p>
							</div>
							<div className="bg-purple-50 rounded-xl p-3">
								<div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
									<Check className="w-4 h-4 text-purple-700" />
								</div>
								<p className="text-xs font-semibold text-gray-900">
									Kemasan Food Grade
								</p>
								<p className="text-[10px] text-gray-500 mt-0.5">
									Dikemas dengan standar aman
								</p>
							</div>
							<div className="bg-amber-50 rounded-xl p-3">
								<div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mb-2">
									<Clock className="w-4 h-4 text-amber-700" />
								</div>
								<p className="text-xs font-semibold text-gray-900">
									Batas Konsumsi Jelas
								</p>
								<p className="text-[10px] text-gray-500 mt-0.5">
									Informasi waktu expired transparan
								</p>
							</div>
						</div>
						<div className="mt-4 p-3 bg-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/10 flex items-center gap-3">
							<div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
								<ShieldCheck className="w-7 h-7 text-[var(--primary)]" />
							</div>
							<div>
								<h4 className="text-sm font-bold text-gray-900">
									Terverifikasi LastBite
								</h4>
								<p className="text-[10px] text-gray-500 leading-tight">
									Produk ini telah melewati verifikasi standar
									keamanan pangan harian kami.
								</p>
							</div>
						</div>
					</div>

					{/* Reviews */}
					<div>
						<h3 className="font-bold text-lg text-gray-900 mb-2">
							Ulasan Pembeli
						</h3>
						<div className="flex items-center gap-1 mb-3">
							<Star className="w-4 h-4 fill-[var(--secondary)] text-[var(--secondary)]" />
							<span className="font-semibold text-gray-900">
								4.7
							</span>
							<span className="text-gray-500 text-sm">
								(12 ulasan)
							</span>
						</div>

						<div className="space-y-3">
							{reviews.map((review) => (
								<motion.div
									key={review.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="bg-gray-50 rounded-xl p-3">
									<div className="flex items-center justify-between mb-1">
										<span className="font-medium text-gray-900 text-sm">
											{review.name}
										</span>
										<div className="flex items-center gap-0.5">
											{Array.from({ length: 5 }).map(
												(_, i) => (
													<Star
														key={i}
														className={`w-3 h-3 ${
															i < review.rating
																? 'fill-[var(--secondary)] text-[var(--secondary)]'
																: 'text-gray-300'
														}`}
													/>
												),
											)}
										</div>
									</div>
									<p className="text-gray-600 text-sm">
										{review.text}
									</p>
								</motion.div>
							))}
						</div>
					</div>

					{/* AI Recommendation */}
					<div className="pt-2">
						<AIRecommendation
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
							cartItems[0].store !== product.store
						) {
							const confirmed = window.confirm(
								'Keranjangmu berisi item dari ' +
									cartItems[0].store +
									'. Hapus dan ganti?',
							);
							if (!confirmed) return;
							clearCart();
						}
						addItem({
							id: product.id,
							name: product.name,
							store: product.store,
							price: product.discountedPrice,
							originalPrice: product.originalPrice,
							image: product.image,
						});
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
				storeName={product.store}
			/>
		</div>
	);
}

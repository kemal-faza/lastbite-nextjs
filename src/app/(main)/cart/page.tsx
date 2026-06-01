'use client';

import { useRef, useState } from 'react';
import {
	Minus,
	Plus,
	Trash2,
	ShoppingBag,
	Tag,
	ArrowRight,
	ChevronLeft,
	Check,
	User,
	ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '@/lib/context/CartContext';
import { useOrders } from '@/lib/context/OrderContext';
import { products } from '@/lib/data/products';

const STEPS = ['Keranjang', 'Konfirmasi'];

export default function CartPage() {
	const {
		items,
		removeItem,
		updateQuantity,
		clearCart,
		currentStore,
		itemCount,
		subtotal,
	} = useCart();
	const router = useRouter();
	const [checkoutStep, setCheckoutStep] = useState(1);
	const [paymentInfo, setPaymentInfo] = useState({
		name: '',
		phone: '',
		notes: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isSubmittingRef = useRef(false);

	const totalOriginal = items.reduce(
		(sum, item) => sum + item.originalPrice * item.quantity,
		0,
	);
	const totalSaved = totalOriginal - subtotal;
	const deliveryFee = 0;
	const total = subtotal;

	const { addOrder } = useOrders();

	const handleConfirmOrder = () => {
		if (isSubmittingRef.current || items.length === 0) return;

		isSubmittingRef.current = true;
		setIsSubmitting(true);
		try {
			const orderId = addOrder(
				{
					items: items.map((i) => ({
						id: i.id,
						name: i.name,
						store: i.store,
						price: i.price,
						quantity: i.quantity,
						image: i.image,
					})),
					total,
					paymentMethod: 'cod',
					name: paymentInfo.name,
					phone: paymentInfo.phone,
				},
				{
					requestId:
						typeof crypto !== 'undefined' &&
						typeof crypto.randomUUID === 'function'
							? crypto.randomUUID()
							: 'req-' + Date.now(),
				},
			);
			clearCart();
			router.push('/order/confirm/' + orderId);
		} finally {
			isSubmittingRef.current = false;
			setIsSubmitting(false);
		}
	};

	// Empty State
	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
				<div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
					<ShoppingBag className="w-12 h-12 text-[var(--secondary)]" />
				</div>
				<h2 className="text-xl font-bold text-gray-900 mb-2">
					Keranjang Kosong
				</h2>
				<p className="text-gray-500 mb-8 max-w-[250px]">
					Belum ada makanan yang diselamatkan. Yuk eksplorasi produk
					yang ada!
				</p>
				<Link
					href="/"
					className="bg-[var(--primary)] text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-black/10 hover:bg-[#0d5254] transition-all active:scale-95">
					Cari Makanan
				</Link>
			</div>
		);
	}

	const renderStepIndicator = () => (
		<div className="px-4 pt-6 pb-3 bg-white border-b border-gray-100">
			<div className="flex items-center justify-center">
				{STEPS.map((label, i) => {
					const stepNum = i + 1;
					const isActive = stepNum === checkoutStep;
					const isDone = stepNum < checkoutStep;
					return (
						<div
							key={label}
							className="flex items-center">
							<div className="flex flex-col items-center">
								<div
									className={
										'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ' +
										(isDone
											? 'bg-[var(--primary)] text-white'
											: isActive
												? 'bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20'
												: 'bg-gray-100 text-gray-400')
									}>
									{isDone ? (
										<Check className="w-4 h-4" />
									) : (
										stepNum
									)}
								</div>
								<span
									className={
										'text-[10px] mt-1 font-medium ' +
										(isActive
											? 'text-[var(--primary)]'
											: 'text-gray-400')
									}>
									{label}
								</span>
							</div>
							{i < STEPS.length - 1 && (
								<div
									className={
										'w-12 h-0.5 mx-2 mb-5 ' +
										(isDone
											? 'bg-[var(--primary)]'
											: 'bg-gray-200')
									}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);

	const renderCartItems = () => (
		<div className="p-4 space-y-4">
			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				{items.map((item, index) => {
					const productMaster = products.find((p) => p.id === item.id);
					const maxStock = productMaster ? productMaster.remaining : 99;
					const isMaxStockReached = item.quantity >= maxStock;

					return (
						<div
							key={item.id}
							className={
								'p-4 flex gap-4' +
								(index !== items.length - 1
									? ' border-b border-gray-100'
									: '')
							}>
							<img
								src={item.image}
								alt={item.name}
								className="w-20 h-20 object-cover rounded-xl bg-gray-100"
							/>
							<div className="flex-1 flex flex-col justify-between">
								<div>
									<div className="flex justify-between items-start">
										<div>
											<h3 className="font-semibold text-gray-900 leading-tight">
												{item.name}
											</h3>
											<p className="text-xs text-gray-500 mt-1">
												{item.store}
											</p>
										</div>
										<button
											onClick={() => removeItem(item.id)}
											className="p-1 -mr-1 hover:bg-red-50 rounded-lg transition-colors"
											aria-label={'Hapus ' + item.name}>
											<Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
										</button>
									</div>
								</div>
								<div className="flex items-center justify-between mt-3 flex-wrap gap-y-2">
									<div>
										<span className="font-bold text-[var(--secondary)] text-sm">
											Rp {item.price.toLocaleString('id-ID')}
										</span>
										<span className="text-xs text-gray-400 line-through ml-2">
											Rp{' '}
											{item.originalPrice.toLocaleString(
												'id-ID',
											)}
										</span>
									</div>
									<div className="flex flex-col items-end gap-1">
										<div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
											<button
												onClick={() =>
													updateQuantity(item.id, -1)
												}
												className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-600 active:scale-95 transition-transform hover:shadow-md"
												aria-label="Kurangi jumlah">
												<Minus className="w-3 h-3" />
											</button>
											<span className="text-sm font-semibold w-5 text-center">
												{item.quantity}
											</span>
											<button
												onClick={() =>
													updateQuantity(item.id, 1)
												}
												disabled={isMaxStockReached}
												className={
													'w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm transition-all ' +
													(isMaxStockReached
														? 'opacity-40 text-gray-400 cursor-not-allowed'
														: 'text-[var(--secondary)] active:scale-95 hover:shadow-md')
												}
												aria-label="Tambah jumlah">
												<Plus className="w-3 h-3" />
											</button>
										</div>
										{isMaxStockReached && (
											<span className="text-[10px] font-medium text-[var(--destructive)]">
												Stok maks. tercapai
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Ringkasan Pembayaran */}
			<div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 space-y-3">
				<h3 className="font-semibold text-gray-900 text-sm">
					Ringkasan Pembayaran
				</h3>
				<div className="space-y-2 text-xs">
					<div className="flex justify-between text-gray-600">
						<span>Subtotal ({itemCount} item)</span>
						<span>Rp {subtotal.toLocaleString('id-ID')}</span>
					</div>
					<div className="flex justify-between text-green-600 text-xs">
						<span>Gratis Biaya Layanan</span>
						<span>(Ditanggung Mitra)</span>
					</div>
					<div className="pt-2.5 border-t border-gray-100 flex justify-between items-center font-semibold">
						<span className="text-gray-900">Total Bayar</span>
						<span className="text-[var(--secondary)]">
							Rp {total.toLocaleString('id-ID')}
						</span>
					</div>
				</div>
			</div>

			<div className="bg-[var(--primary)]/5 rounded-xl p-3 flex items-start gap-3 border border-[var(--primary)]/10">
				<div className="bg-[var(--primary)]/10 p-1.5 rounded-full mt-0.5">
					<Tag className="w-4 h-4 text-[var(--primary)]" />
				</div>
				<div>
					<h4 className="text-sm font-semibold text-[var(--primary)]">
						Yay! Kamu hemat banyak
					</h4>
					<p className="text-xs text-[var(--primary)] mt-0.5">
						Dengan pesanan ini kamu menghemat{' '}
						<b>Rp {totalSaved.toLocaleString('id-ID')}</b> dan
						mencegah makanan terbuang!
					</p>
				</div>
			</div>
		</div>
	);

	const renderPaymentStep = () => (
		<div className="p-4 space-y-4">
			<div className="bg-white rounded-2xl shadow-sm p-4 space-y-4 border border-gray-100">
				<h3 className="font-semibold text-gray-900 flex items-center gap-2">
					<User className="w-4 h-4 text-[var(--primary)]" />
					Informasi Pemesan
				</h3>
				<div>
					<label className="text-sm font-medium text-gray-700 block mb-1.5">
						Nama Lengkap
					</label>
					<input
						type="text"
						value={paymentInfo.name}
						onChange={(e) =>
							setPaymentInfo((p) => ({
								...p,
								name: e.target.value,
							}))
						}
						placeholder="Masukkan namamu"
						className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-gray-50"
					/>
				</div>
				<div>
					<label className="text-sm font-medium text-gray-700 block mb-1.5">
						Nomor Telepon
					</label>
					<input
						type="tel"
						value={paymentInfo.phone}
						onChange={(e) =>
							setPaymentInfo((p) => ({
								...p,
								phone: e.target.value,
							}))
						}
						placeholder="08xxxxxxxxxx"
						className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-gray-50"
					/>
				</div>
				<div>
					<label className="text-sm font-medium text-gray-700 block mb-2">
						Metode Pembayaran
					</label>
					<div className="rounded-xl border-2 border-[var(--primary)] bg-[var(--primary)]/5 p-3">
						<p className="text-sm font-medium text-gray-900">
							Bayar di Tempat (COD)
						</p>
						<p className="text-xs text-gray-500">
							Pembayaran default. Bayar saat mengambil pesanan.
						</p>
					</div>
				</div>
				<div>
					<label className="text-sm font-medium text-gray-700 block mb-1.5">
						Catatan (opsional)
					</label>
					<textarea
						value={paymentInfo.notes}
						onChange={(e) =>
							setPaymentInfo((p) => ({
								...p,
								notes: e.target.value,
							}))
						}
						placeholder="Misal: datang jam 12.30"
						rows={2}
						className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-gray-50 resize-none"
					/>
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
				<h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
					<ClipboardList className="w-4 h-4 text-[var(--primary)]" />
					Ringkasan Pesanan
				</h3>
				<div className="text-sm space-y-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="flex justify-between text-gray-600">
							<span>
								{item.quantity}x {item.name}
							</span>
							<span>
								Rp{' '}
								{(item.price * item.quantity).toLocaleString(
									'id-ID',
								)}
							</span>
						</div>
					))}
				</div>
				<div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
					<div className="flex justify-between text-gray-600">
						<span>Subtotal</span>
						<span>Rp {subtotal.toLocaleString('id-ID')}</span>
					</div>
					<div className="flex justify-between text-green-600 text-xs">
						<span>Gratis Biaya Layanan</span>
						<span>(Ditanggung Mitra)</span>
					</div>
					<div className="pt-2.5 border-t border-gray-100 flex justify-between items-center font-semibold text-sm text-gray-900">
						<span>Total Bayar</span>
						<span className="text-[var(--secondary)]">Rp {total.toLocaleString('id-ID')}</span>
					</div>
				</div>
			</div>
		</div>
	);

	const renderConfirmStep = () => (
		<div className="p-4 space-y-4">
			<div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
				<h3 className="font-semibold text-gray-900 mb-3">
					Ringkasan Pembayaran
				</h3>
				<div className="space-y-3">
					<div className="flex justify-between text-sm text-gray-600">
						<span>Subtotal ({itemCount} item)</span>
						<span>Rp {subtotal.toLocaleString('id-ID')}</span>
					</div>
					<div className="flex justify-between text-sm text-green-600">
						<span>Gratis Biaya Layanan</span>
						<span>(Ditanggung Mitra)</span>
					</div>
					<div className="pt-3 border-t border-gray-100 flex justify-between items-center">
						<span className="font-bold text-gray-900">
							Total Harga
						</span>
						<span className="font-bold text-lg text-[var(--secondary)]">
							Rp {total.toLocaleString('id-ID')}
						</span>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
				<h3 className="font-semibold text-gray-900 mb-3">
					Data Pemesan
				</h3>
				<div className="text-sm space-y-2 text-gray-600">
					<div className="flex justify-between">
						<span>Nama</span>
						<span className="font-medium text-gray-900">
							{paymentInfo.name || '-'}
						</span>
					</div>
					<div className="flex justify-between">
						<span>Telepon</span>
						<span className="font-medium text-gray-900">
							{paymentInfo.phone || '-'}
						</span>
					</div>
					<div className="flex justify-between">
						<span>Pembayaran</span>
						<span className="font-medium text-gray-900">
							Bayar di Tempat (COD)
						</span>
					</div>
					<div className="flex justify-between">
						<span>Catatan</span>
						<span className="font-medium text-gray-900">
							{paymentInfo.notes || '-'}
						</span>
					</div>
				</div>
			</div>
		</div>
	);

	const renderStepContent = () => {
		switch (checkoutStep) {
			case 1:
				return (
					<>
						{renderCartItems()}
						{renderPaymentStep()}
					</>
				);
			case 2:
				return renderConfirmStep();
			default:
				return null;
		}
	};

	const renderBottomBar = () => {
		if (checkoutStep === 1) {
			return (
				<div className="flex gap-3">
					<button
						onClick={() => setCheckoutStep(2)}
						disabled={!paymentInfo.name.trim()}
						className={
							'flex-1 font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ' +
							(paymentInfo.name.trim()
								? 'bg-[var(--primary)] text-white shadow-black/10 hover:bg-[#0d5254] active:scale-[0.98]'
								: 'bg-gray-200 text-gray-400 cursor-not-allowed')
						}>
						Lanjut ke Konfirmasi
						<ArrowRight className="w-4 h-4" />
					</button>
				</div>
			);
		}
		if (checkoutStep === 2) {
			return (
				<div className="flex gap-3">
					<button
						onClick={() => setCheckoutStep(1)}
						className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">
						<ChevronLeft className="w-4 h-4" />
						Kembali
					</button>
					<button
						onClick={handleConfirmOrder}
						disabled={isSubmitting}
						className={
							'flex-[2] font-bold py-3.5 px-4 rounded-xl shadow-lg transition-colors active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] focus-visible:ring-offset-2 ' +
							(isSubmitting
								? 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-none'
								: 'bg-[var(--secondary)] text-white shadow-black/10 hover:bg-[#c9952e]')
						}>
						<Check className="w-5 h-5" />
						{isSubmitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
					</button>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="flex flex-col bg-[var(--background)]">
			{/* Fixed Header */}
			<div className="bg-white shadow-sm sticky top-0 z-10">
				<div className="px-4 py-4 flex items-center gap-3">
					{checkoutStep > 1 ? (
						<button
							onClick={() => setCheckoutStep(checkoutStep - 1)}
							className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
							aria-label="Kembali">
							<ChevronLeft className="w-5 h-5 text-gray-700" />
						</button>
					) : null}
					<h1 className="text-lg font-bold text-gray-900">
						{checkoutStep === 1 ? 'Keranjang & Pembayaran' : 'Konfirmasi'}
					</h1>
					{currentStore && checkoutStep === 1 && (
						<p className="text-xs text-gray-500 ml-auto">
							Pesanan dari <span className="font-semibold text-gray-700">{currentStore}</span>
						</p>
					)}
				</div>
				{renderStepIndicator()}
			</div>

			{/* Content */}
			<AnimatePresence mode="wait">
				<motion.div
					className="pb-[172px]"
					key={checkoutStep}
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.2 }}>
					{renderStepContent()}
				</motion.div>
			</AnimatePresence>

			{/* Bottom CTA */}
			<div className="fixed bottom-[72px] left-4 right-4 max-w-[calc(theme(maxWidth.md)-2rem)] mx-auto bg-white/95 backdrop-blur-md border border-gray-100 p-4 z-40 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]">
				{renderBottomBar()}
			</div>
		</div>
	);
}

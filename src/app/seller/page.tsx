'use client';

import { ArrowLeft, Store, Package, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const todayProducts = [
  { id: 1, name: 'Roti Coklat', quantity: 8, price: 3000, sold: 5 },
  { id: 2, name: 'Roti Keju', quantity: 6, price: 3500, sold: 2 },
  { id: 3, name: 'Roti Pisang', quantity: 4, price: 3000, sold: 0 },
];

export default function SellerDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState(todayProducts);

  useEffect(() => {
    const saved = localStorage.getItem('lastbite-seller-products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts([...todayProducts, ...parsed]);
        }
      } catch (e) {
        console.error('Gagal muat produk tersimpan', e);
      }
    }
  }, []);

  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalSold = products.reduce((sum, p) => sum + p.sold, 0);
  const remaining = totalStock - totalSold;

  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      {/* Header */}
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="p-1.5 -ml-1.5 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center text-white"
            aria-label="Kembali ke Mode Pembeli"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-base font-bold text-center">Dashboard Seller</h1>
          <Store className="w-5 h-5 text-white/80" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28 space-y-6">
        {/* Ringkasan Hari Ini */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
            Ringkasan Hari Ini
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-2xl shadow-sm px-4 py-5 text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{totalStock}</p>
              <p className="text-xs text-gray-500 mt-1">Stok Produk</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-sm px-4 py-5 text-center">
              <p className="text-2xl font-bold text-[var(--secondary)]">{totalSold}</p>
              <p className="text-xs text-gray-500 mt-1">Terjual</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-sm px-4 py-5 text-center">
              <p className="text-2xl font-bold text-[var(--destructive)]">{remaining}</p>
              <p className="text-xs text-gray-500 mt-1">Sisa</p>
            </div>
          </div>
        </section>
			{/* Informasi Biaya Platform */}
			<div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100">
				<div className="flex items-start gap-3">
					<div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
						<Store className="w-5 h-5 text-green-700" />
					</div>
					<div>
						<h3 className="font-semibold text-gray-900 text-sm">Mitra LastBite</h3>
						<p className="text-xs text-gray-600 mt-1 leading-relaxed">
							Kamu tidak dikenakan biaya platform.
							<br />Biaya layanan ditanggung sepenuhnya oleh LastBite
							sebagai bentuk dukungan untuk mitra mengurangi food waste.
						</p>
					</div>
				</div>
			</div>

        {/* Produk Hari Ini */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
            Produk Hari Ini
          </h2>
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm px-4 py-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {product.quantity} pcs | Rp{product.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-4 text-xs">
                    <span>
                      Terjual:{' '}
                      <span className="font-semibold text-[var(--secondary)]">
                        {product.sold}
                      </span>
                    </span>
                    <span>
                      Sisa:{' '}
                      <span
                        className={`font-semibold ${
                          product.quantity - product.sold > 0
                            ? 'text-[var(--primary)]'
                            : 'text-[var(--destructive)]'
                        }`}
                      >
                        {product.quantity - product.sold}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/product/' + product.id)}
                    className="text-xs font-medium text-[var(--primary)] hover:underline"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/seller/add')}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--primary)]/90 transition-colors z-50"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}

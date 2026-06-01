'use client';

import { Heart, ShoppingBag, ArrowLeft, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/lib/context/WishlistContext';
import { products } from '@/lib/data/products';
import { ProductCard } from '@/components/ProductCard';
import { useState } from 'react';

interface WishlistItemProps {
  product: any;
}

function WishlistItem({ product }: WishlistItemProps) {
  const [notifActive, setNotifActive] = useState(false);
  return (
    <div className="bg-white rounded-2xl p-2.5 border border-gray-100 flex flex-col gap-2.5 shadow-sm">
      <ProductCard product={product} />
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 px-1">
        <span className="text-[10px] font-medium text-gray-500">
          {notifActive ? 'Notifikasi stok aktif' : 'Kabari saya jika stok tersedia kembali'}
        </span>
        <button
          onClick={() => setNotifActive(!notifActive)}
          className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-[10px] font-bold ${
            notifActive
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell className={`w-3 h-3 ${notifActive ? 'fill-amber-600' : ''}`} />
          {notifActive ? 'Aktif' : 'Ingatkan'}
        </button>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { ids, count } = useWishlist();
  const router = useRouter();

  const wishlistedProducts = products.filter((p) => ids.includes(p.id));

  return (
    <div className="flex flex-col min-h-full bg-[var(--background)]">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button
          onClick={() => router.push('/profile')}
          className="p-1 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Favorit Saya</h1>
        <span className="text-sm text-gray-500 ml-auto">{count} item</span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 pb-28">
        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {wishlistedProducts.map((product) => (
              <WishlistItem key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-red-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Favorit Kosong</h2>
            <p className="text-gray-500 mb-8 max-w-[250px]">
              Simpan produk favoritmu dengan menekan icon hati di kartu produk.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[var(--primary)] text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-black/10 hover:bg-[#0d5254] transition-all active:scale-95"
            >
              Cari Makanan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

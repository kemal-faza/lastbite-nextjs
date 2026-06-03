'use client';

import { Clock, MapPin, ShoppingBag, Heart, ShieldCheck } from 'lucide-react';
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import type { ProductData } from '@/lib/api/products';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useWishlist } from '@/lib/context/WishlistContext';
import { ImageWithFallback } from './ImageWithFallback';
import { formatExpiry } from '@/lib/utils/date';
import { formatDistance } from '@/lib/utils/distance';
import { useRequireAuth } from '@/hooks/useRequireAuth';

interface ProductCardProps {
  product: ProductData;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();
  const { items: cartItems, addItem, clearCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const isFav = isWishlisted(product.id);
  const { requireAuth } = useRequireAuth();

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (cartItems.length > 0 && cartItems[0].store !== product.storeName) {
      const confirmed = window.confirm(
        'Keranjangmu berisi item dari ' + cartItems[0].store + '. Hapus dan ganti dengan item dari ' + product.storeName + '?'
      );
      if (!confirmed) return;
      clearCart();
    }

    setIsAdded(true);
    addItem(product.id);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  }, [product, addItem, cartItems, clearCart]);

  const expiryText = formatExpiry(product.expiresAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => router.push('/product/' + product.id)}
      className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden rounded-t-2xl bg-gray-100">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={(e) => { e.stopPropagation(); toggle(product.id); }}
          className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all z-10"
          aria-label={isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        >
          <Heart
            className={'w-4 h-4 ' + (isFav ? 'fill-red-500 text-red-500' : 'text-gray-600')}
          />
        </button>
        <div className="absolute top-3 right-3 bg-[var(--destructive)] text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
          -{product.discountPercent}%
        </div>
        <div className="absolute top-3 left-12 bg-green-600/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <ShieldCheck className="w-3 h-3 text-white" />
          <span className="text-[10px] font-bold text-white">Higienis</span>
        </div>
        <div className="absolute top-12 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Clock className="w-3 h-3 text-[var(--secondary)]" />
          <span className="text-xs font-medium text-[var(--secondary)]">{expiryText}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>

        <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
          <MapPin className="w-3 h-3" />
          <span>{product.storeName}</span>
          {product.distanceKm != null && (
            <>
              <span className="text-gray-300 mx-0.5">·</span>
              <span className="text-[var(--primary)] font-medium text-xs">
                {formatDistance(product.distanceKm)}
              </span>
            </>
          )}
        </div>

        <p className="text-xs text-[var(--destructive)] mb-3">
          Sisa {product.stock} porsi
        </p>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[var(--secondary)]">
                Rp {product.discountedPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <span className="text-sm text-gray-400 line-through">
              Rp {product.originalPrice.toLocaleString('id-ID')}
            </span>
          </div>

          {product.stock === 0 ? (
            <button
              disabled
              className="min-w-[88px] px-4 py-2 rounded-xl font-medium bg-gray-200 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
              aria-label={'Stok habis: ' + product.name}
            >
              <ShoppingBag className="w-4 h-4" />
              Stok Habis
            </button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => requireAuth(() => handleAddToCart(e))}
              disabled={product.stock <= 0}
              aria-label={isAdded ? 'Ditambahkan ' + product.name + ' ke keranjang' : 'Beli ' + product.name}
              className={
                'min-w-[88px] px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 ' +
                (isAdded
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] cursor-default'
                  : 'bg-[var(--primary)] text-white hover:bg-[#0d5254]')
              }
            >
              <ShoppingBag className="w-4 h-4" />
              {isAdded ? 'Ditambahkan!' : 'Beli'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

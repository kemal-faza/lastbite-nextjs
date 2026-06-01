import { Clock, MapPin, ShoppingBag, Heart } from 'lucide-react';
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { type Product } from '../data/products';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const { items: cartItems, addItem, clearCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const isFav = isWishlisted(product.id);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (cartItems.length > 0 && cartItems[0].store !== product.store) {
      const confirmed = window.confirm(
        'Keranjangmu berisi item dari ' + cartItems[0].store + '. Hapus dan ganti dengan item dari ' + product.store + '?'
      );
      if (!confirmed) return;
      clearCart();
    }

    setIsAdded(true);
    addItem({
      id: product.id,
      name: product.name,
      store: product.store,
      price: product.discountedPrice,
      originalPrice: product.originalPrice,
      image: product.image,
    });
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  }, [product, addItem, cartItems, clearCart]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/product/' + product.id)}
      className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-t-2xl bg-gray-100">
        {imgError ? (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-xs text-gray-400">{product.name}</span>
            </div>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
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
          -{product.discount}%
        </div>
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Clock className="w-3 h-3 text-[var(--secondary)]" />
          <span className="text-xs font-medium text-[var(--secondary)]">{product.expiresIn}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>

        <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
          <MapPin className="w-3 h-3" />
          <span>{product.store}</span>
          <span className="text-gray-400 mx-1">·</span>
          <span className="text-gray-500">{product.distance}</span>
        </div>

        <p className="text-xs text-[var(--destructive)] mb-3">
          Sisa {product.remaining} porsi
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

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            aria-label={isAdded ? 'Ditambahkan ' + product.name + ' ke keranjang' : 'Beli ' + product.name}
            className={
              'min-w-[88px] px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ' +
              (isAdded
                ? 'bg-[var(--primary)]/10 text-[var(--primary)] cursor-default'
                : 'bg-[var(--primary)] text-white hover:bg-[#0d5254]')
            }
          >
            <ShoppingBag className="w-4 h-4" />
            {isAdded ? 'Ditambahkan!' : 'Beli'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

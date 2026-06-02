'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItem,
  removeCartItem,
  clearCart as apiClearCart,
  type CartData,
  type CartItemData,
  type CartProductData,
} from '@/lib/api/cart';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  store: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  stock: number;
}

function toCartItem(item: CartItemData): CartItem {
  const p: CartProductData = item.product;
  return {
    id: item.id,
    productId: item.productId,
    name: p.name,
    store: p.storeName,
    price: p.discountedPrice,
    originalPrice: p.originalPrice,
    image: p.imageUrl || '/placeholder.png',
    quantity: item.quantity,
    stock: p.stock,
  };
}

const CartContext = createContext<{
  items: CartItem[];
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  currentStore: string | null;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    fetchCart()
      .then((data) => setItems(data.items.map(toCartItem)))
      .catch((err) => {
        if (err.status !== 401) {
          console.error('Failed to load cart:', err);
        }
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const addItem = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      const data = await apiAddToCart(productId, quantity);
      setItems(data.items.map(toCartItem));
    } catch (err: unknown) {
      const apiErr = err as { status?: number; code?: string; message?: string };
      if (apiErr.code === 'DIFFERENT_STORE') {
        toast.error('Keranjang hanya bisa berisi produk dari satu toko.');
      } else if (apiErr.code === 'INSUFFICIENT_STOCK') {
        toast.error(apiErr.message || 'Stok tidak mencukupi.');
      } else if (apiErr.status === 401) {
        toast.error('Silakan login untuk menambah ke keranjang.');
      } else {
        toast.error('Gagal menambah ke keranjang.');
      }
    }
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    try {
      const data = await removeCartItem(productId);
      setItems(data.items.map(toCartItem));
    } catch {
      toast.error('Gagal menghapus item.');
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, delta: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) {
      return removeItem(productId);
    }
    if (newQty > item.stock) {
      toast.error('Stok tidak mencukupi.');
      return;
    }

    try {
      const data = await updateCartItem(productId, newQty);
      setItems(data.items.map(toCartItem));
    } catch {
      toast.error('Gagal mengubah jumlah.');
    }
  }, [items, removeItem]);

  const clearCartFn = useCallback(async () => {
    try {
      await apiClearCart();
      setItems([]);
    } catch {
      toast.error('Gagal mengosongkan keranjang.');
    }
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currentStore = items.length > 0 ? items[0].store : null;

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: clearCartFn,
        itemCount,
        subtotal,
        currentStore,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

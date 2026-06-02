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
  createOrder as apiCreateOrder,
  fetchOrders,
  verifyPickup as apiVerifyPickup,
  type OrderData,
} from '@/lib/api/orders';
import { toast } from 'sonner';

export interface OrderItem {
  id: string;
  name: string;
  store: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  saving: number;
  buyerName: string;
  buyerPhone: string;
  storeName: string;
  timestamp: number;
  status: string;
  pickupCode: string;
  pickupExpiresAt: string;
}

function toOrder(data: OrderData): Order {
  return {
    id: data.id,
    items: data.items.map((item) => ({
      id: item.id,
      name: item.name,
      store: item.storeName,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: item.quantity,
      image: item.imageUrl || '/placeholder.png',
    })),
    total: data.totalAmount,
    saving: data.savingAmount,
    buyerName: data.buyerName,
    buyerPhone: data.buyerPhone,
    storeName: data.storeName,
    timestamp: new Date(data.createdAt).getTime(),
    status: data.status,
    pickupCode: data.pickupCode,
    pickupExpiresAt: data.pickupExpiresAt,
  };
}

const OrderContext = createContext<{
  orders: Order[];
  pendingOrders: Order[];
  loading: boolean;
  createOrder: (input: { buyerName: string; buyerPhone: string; notes?: string }) => Promise<string | null>;
  verifyPickup: (id: string, pickupCode: string) => Promise<boolean>;
  markPickedUp: (id: string, code: string) => boolean;
  getOrderById: (id: string) => Order | undefined;
  pendingCount: number;
} | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    setLoading(true);
    fetchOrders()
      .then((data) => setOrders(data.map(toOrder)))
      .catch((err) => {
        if (err.status !== 401) {
          console.error('Failed to load orders:', err);
        }
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const doCreateOrder = useCallback(
    async (input: { buyerName: string; buyerPhone: string; notes?: string }): Promise<string | null> => {
      try {
        const orderData = await apiCreateOrder(input);
        setOrders((prev) => [toOrder(orderData), ...prev]);
        return orderData.id;
      } catch (err: unknown) {
        const apiErr = err as { status?: number; code?: string; message?: string };
        if (apiErr.code === 'CART_EMPTY') {
          toast.error('Keranjang kosong.');
        } else if (apiErr.code === 'INSUFFICIENT_STOCK') {
          toast.error(apiErr.message || 'Stok tidak mencukupi.');
        } else if (apiErr.status === 401) {
          toast.error('Silakan login untuk membuat pesanan.');
        } else {
          toast.error('Gagal membuat pesanan.');
        }
        return null;
      }
    },
    []
  );

  const doVerifyPickup = useCallback(async (id: string, pickupCode: string): Promise<boolean> => {
    try {
      const orderData = await apiVerifyPickup(id, pickupCode);
      setOrders((prev) => prev.map((o) => (o.id === id ? toOrder(orderData) : o)));
      toast.success('Pesanan berhasil diambil!');
      return true;
    } catch (err: unknown) {
      const apiErr = err as { status?: number; code?: string; message?: string };
      if (apiErr.code === 'INVALID_PICKUP_CODE') {
        toast.error('Kode pickup tidak sesuai.');
      } else if (apiErr.code === 'PICKUP_EXPIRED') {
        toast.error('Kode pickup sudah kadaluarsa.');
      } else if (apiErr.status === 401) {
        toast.error('Silakan login untuk verifikasi.');
      } else {
        toast.error('Gagal memverifikasi pickup.');
      }
      return false;
    }
  }, []);

  // Keep markPickedUp for backward compatibility with confirmation page
  const markPickedUp = useCallback((id: string, code: string): boolean => {
    doVerifyPickup(id, code);
    return true;
  }, [doVerifyPickup]);

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const pendingOrders = orders.filter(
    (o) => o.status !== 'PICKED_UP' && o.status !== 'CANCELLED'
  );

  return (
    <OrderContext.Provider
      value={{
        orders,
        pendingOrders,
        loading,
        createOrder: doCreateOrder,
        verifyPickup: doVerifyPickup,
        markPickedUp,
        getOrderById,
        pendingCount: pendingOrders.length,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}

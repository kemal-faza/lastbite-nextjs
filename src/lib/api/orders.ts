import { apiFetch } from './client';

export interface OrderItemData {
  id: string;
  productId: string;
  name: string;
  storeName: string;
  price: number;
  originalPrice: number;
  quantity: number;
  imageUrl: string | null;
}

export type OrderStatus = 'PENDING' | 'PROCESSED' | 'READY' | 'PICKED_UP' | 'CANCELLED';

export interface OrderData {
  id: string;
  userId: string;
  storeName: string;
  status: OrderStatus;
  pickupCode: string;
  pickupExpiresAt: string;
  totalAmount: number;
  savingAmount: number;
  buyerName: string;
  buyerPhone: string;
  notes: string | null;
  createdAt: string;
  items: OrderItemData[];
}

export interface CreateOrderInput {
  buyerName: string;
  buyerPhone: string;
  notes?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderData> {
  const res = await apiFetch<{ order: OrderData }>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
    auth: true,
  });
  return res.order;
}

export async function fetchOrders(): Promise<OrderData[]> {
  const res = await apiFetch<{ orders: OrderData[] }>('/orders', { auth: true });
  return res.orders;
}

export async function fetchOrder(id: string): Promise<OrderData> {
  const res = await apiFetch<{ order: OrderData }>(`/orders/${id}`, { auth: true });
  return res.order;
}

export async function verifyPickup(id: string, pickupCode: string): Promise<OrderData> {
  const res = await apiFetch<{ order: OrderData; message: string }>(
    `/orders/${id}/verify-pickup`,
    {
      method: 'POST',
      body: JSON.stringify({ pickupCode }),
      auth: true,
    }
  );
  return res.order;
}

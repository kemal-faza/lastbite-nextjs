'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { useEffect } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  store: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  name: string;
  phone: string;
  timestamp: number;
  status: 'pending-pickup' | 'picked-up';
  pickupCode: string;
}

type OrderAction =
  | {
      type: 'ADD_ORDER';
      payload: Omit<Order, 'id' | 'pickupCode' | 'timestamp' | 'status'> & { requestId?: string };
    }
  | { type: 'SET_STATUS'; payload: { id: string; status: Order['status'] } };

interface OrderState {
  orders: Order[];
}

const ORDER_STORAGE_KEY = 'lastbite-orders';
const ORDER_STORAGE_TTL_MS = 24 * 60 * 60 * 1000;

function generatePickupCode(): string {
  return 'LAST-' + (1000 + Math.floor(Math.random() * 9000));
}

function generateOrderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'ord-' + crypto.randomUUID();
  }
  return 'ord-' + Date.now() + '-' + Math.floor(Math.random() * 1_000_000);
}

function normalizeOrderItem(value: unknown): OrderItem | null {
  if (typeof value !== 'object' || value === null) return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== 'string' ||
    typeof item.name !== 'string' ||
    typeof item.store !== 'string' ||
    typeof item.price !== 'number' ||
    typeof item.quantity !== 'number' ||
    typeof item.image !== 'string'
  ) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    store: item.store,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  };
}

function normalizeOrder(value: unknown): Order | null {
  if (typeof value !== 'object' || value === null) return null;
  const order = value as Record<string, unknown>;
  if (
    typeof order.id !== 'string' ||
    !Array.isArray(order.items) ||
    typeof order.total !== 'number' ||
    typeof order.paymentMethod !== 'string' ||
    typeof order.timestamp !== 'number' ||
    (order.status !== 'pending-pickup' && order.status !== 'picked-up') ||
    typeof order.pickupCode !== 'string'
  ) {
    return null;
  }

  const items = order.items
    .map(normalizeOrderItem)
    .filter((item): item is OrderItem => item !== null);
  if (items.length === 0) return null;

  return {
    id: order.id,
    items,
    total: order.total,
    paymentMethod: order.paymentMethod,
    name: typeof order.name === 'string' ? order.name : '',
    phone: typeof order.phone === 'string' ? order.phone : '',
    timestamp: order.timestamp,
    status: order.status,
    pickupCode: order.pickupCode,
  };
}

function loadStoredOrders(): OrderState {
  const initialState: OrderState = { orders: [] };
  if (typeof window === 'undefined') return initialState;
  const saved = localStorage.getItem(ORDER_STORAGE_KEY);
  if (!saved) return initialState;

  try {
    const parsed = JSON.parse(saved) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return initialState;

    const payload = parsed as { savedAt?: unknown; orders?: unknown };
    if (typeof payload.savedAt === 'number' && Date.now() - payload.savedAt > ORDER_STORAGE_TTL_MS) {
      localStorage.removeItem(ORDER_STORAGE_KEY);
      return initialState;
    }

    if (!Array.isArray(payload.orders)) return initialState;

    return {
      orders: payload.orders
        .map(normalizeOrder)
        .filter((order): order is Order => order !== null),
    };
  } catch (error) {
    console.error('Failed to parse stored orders', error);
    localStorage.removeItem(ORDER_STORAGE_KEY);
    return initialState;
  }
}

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'ADD_ORDER': {
      if (
        action.payload.requestId &&
        state.orders.some((order) => order.id === action.payload.requestId)
      ) {
        return state;
      }
      const { requestId, ...orderPayload } = action.payload;
      const newOrder: Order = {
        ...orderPayload,
        id: requestId ?? generateOrderId(),
        pickupCode: generatePickupCode(),
        timestamp: Date.now(),
        status: 'pending-pickup',
      };
      return { orders: [newOrder, ...state.orders] };
    }
    case 'SET_STATUS':
      return {
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? { ...o, status: action.payload.status } : o
        ),
      };
    default:
      return state;
  }
}

const OrderContext = createContext<{
  orders: Order[];
  pendingOrders: Order[];
  addOrder: (
    order: Omit<Order, 'id' | 'pickupCode' | 'timestamp' | 'status'>,
    options?: { requestId?: string }
  ) => string;
  markPickedUp: (id: string, pickupCodeInput: string) => boolean;
  getOrderById: (id: string) => Order | undefined;
  pendingCount: number;
} | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, { orders: [] }, loadStoredOrders);

  useEffect(() => {
    const safeToPersist = {
      savedAt: Date.now(),
      orders: state.orders.map((order) => ({
        ...order,
        name: '',
        phone: '',
      })),
    };
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(safeToPersist));
  }, [state]);

  const addOrder = (
    order: Omit<Order, 'id' | 'pickupCode' | 'timestamp' | 'status'>,
    options?: { requestId?: string }
  ) => {
    const orderId = options?.requestId ?? generateOrderId();
    dispatch({ type: 'ADD_ORDER', payload: { ...order, requestId: orderId } });
    return orderId;
  };

  const markPickedUp = (id: string, pickupCodeInput: string) => {
    const order = state.orders.find((value) => value.id === id);
    if (!order || order.status !== 'pending-pickup') return false;

    const normalizedInput = pickupCodeInput.trim().toUpperCase();
    if (!normalizedInput || normalizedInput !== order.pickupCode) return false;

    dispatch({ type: 'SET_STATUS', payload: { id, status: 'picked-up' } });
    return true;
  };

  const getOrderById = (id: string) => state.orders.find((order) => order.id === id);

  const pendingOrders = state.orders.filter((o) => o.status === 'pending-pickup');

  return (
    <OrderContext.Provider
      value={{
        orders: state.orders,
        pendingOrders,
        addOrder,
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

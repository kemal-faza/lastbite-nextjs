'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { products } from '@/lib/data/products';

export interface CartItem {
  id: number;
  name: string;
  store: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; delta: number } }
  | { type: 'CLEAR_CART' };

interface CartState {
  items: CartItem[];
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.payload.id);
      const product = products.find((p) => p.id === action.payload.id);
      const maxStock = product ? product.remaining : 99;
      if (existing) {
        const newQty = Math.min(maxStock, existing.quantity + 1);
        return {
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: newQty }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.id !== action.payload.id) };
    case 'UPDATE_QUANTITY': {
      const product = products.find((p) => p.id === action.payload.id);
      const maxStock = product ? product.remaining : 99;
      return {
        items: state.items.map((item) => {
          if (item.id === action.payload.id) {
            const newQuantity = Math.max(1, Math.min(maxStock, item.quantity + action.payload.delta));
            return { ...item, quantity: newQuantity };
          }
          return item;
        }),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
}

const CartContext = createContext<{
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  currentStore: string | null;
} | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = (item: Omit<CartItem, 'quantity'>) =>
    dispatch({ type: 'ADD_ITEM', payload: item });

  const removeItem = (id: number) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });

  const updateQuantity = (id: number, delta: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, delta } });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currentStore = state.items.length > 0 ? state.items[0].store : null;

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        currentStore,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

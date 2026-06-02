import { apiFetch } from './client';

export interface CartProductData {
  id: string;
  name: string;
  discountedPrice: number;
  originalPrice: number;
  stock: number;
  imageUrl: string | null;
  storeName: string;
  isActive: boolean;
}

export interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  product: CartProductData;
}

export interface CartData {
  id: string;
  userId: string;
  storeName: string | null;
  items: CartItemData[];
}

export async function fetchCart(): Promise<CartData> {
  const res = await apiFetch<{ cart: CartData }>('/cart', { auth: true });
  return res.cart;
}

export async function addToCart(productId: string, quantity: number = 1): Promise<CartData> {
  const res = await apiFetch<{ cart: CartData }>('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
    auth: true,
  });
  return res.cart;
}

export async function updateCartItem(productId: string, quantity: number): Promise<CartData> {
  const res = await apiFetch<{ cart: CartData }>(`/cart/items/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
    auth: true,
  });
  return res.cart;
}

export async function removeCartItem(productId: string): Promise<CartData> {
  const res = await apiFetch<{ cart: CartData }>(`/cart/items/${productId}`, {
    method: 'DELETE',
    auth: true,
  });
  return res.cart;
}

export async function clearCart(): Promise<void> {
  await apiFetch('/cart', { method: 'DELETE', auth: true });
}

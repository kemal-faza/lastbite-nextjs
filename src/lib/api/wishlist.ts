import { apiFetch } from './client';
import { fetchProduct, type ProductData } from './products';

export async function fetchWishlistProducts(ids: string[]): Promise<ProductData[]> {
  if (ids.length === 0) return [];
  const results = await Promise.allSettled(ids.map((id) => fetchProduct(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<{ product: ProductData }> => r.status === 'fulfilled')
    .map((r) => r.value.product)
    .filter((p) => p.isActive);
}

export async function subscribeToStockAlert(productId: string) {
  return apiFetch<{ subscription: { id: string; productId: string } }>(
    '/wishlist-subscriptions',
    { method: 'POST', auth: true, body: JSON.stringify({ productId }) }
  );
}

export async function unsubscribeFromStockAlert(productId: string) {
  await apiFetch(`/wishlist-subscriptions/${productId}`, { method: 'DELETE', auth: true });
}

export async function getStockAlertSubscriptions(): Promise<string[]> {
  const data = await apiFetch<{ productIds: string[] }>(
    '/wishlist-subscriptions',
    { auth: true }
  );
  return data.productIds;
}

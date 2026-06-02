import { fetchProduct, type ProductData } from './products';

export async function fetchWishlistProducts(ids: string[]): Promise<ProductData[]> {
  if (ids.length === 0) return [];
  const results = await Promise.allSettled(ids.map((id) => fetchProduct(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<{ product: ProductData }> => r.status === 'fulfilled')
    .map((r) => r.value.product)
    .filter((p) => p.isActive);
}

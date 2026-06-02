import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { ProductResponse, ProductListResponse, ProductSearchResponse } from '../types/index.js';

export class ProductNotFoundError extends Error {
  constructor() {
    super('Produk tidak ditemukan');
    this.name = 'ProductNotFoundError';
  }
}

export interface ProductListOptions {
  category?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

function toISO(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function toProductResponse(product: {
  id: string;
  name: string;
  description: string | null;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
  imageUrl: string | null;
  storeName: string;
  storeAddress: string | null;
  storeLat: number | null;
  storeLng: number | null;
  expiresAt: Date | string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}): ProductResponse {
  const discountPercent = Math.round(
    ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
  );
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    originalPrice: product.originalPrice,
    discountedPrice: product.discountedPrice,
    discountPercent,
    stock: product.stock,
    imageUrl: product.imageUrl,
    storeName: product.storeName,
    storeAddress: product.storeAddress,
    storeLat: product.storeLat,
    storeLng: product.storeLng,
    expiresAt: toISO(product.expiresAt),
    isActive: product.isActive,
    createdAt: toISO(product.createdAt),
    updatedAt: toISO(product.updatedAt),
  };
}

export async function findAll(options: ProductListOptions = {}): Promise<ProductListResponse> {
  const { category, sort = 'newest', page = 1, limit = 20 } = options;

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (category) {
    where.category = category as Prisma.EnumCategoryFilter['equals'];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (sort) {
    case 'price_asc':
      orderBy = { discountedPrice: 'asc' };
      break;
    case 'price_desc':
      orderBy = { discountedPrice: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(toProductResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findById(id: string): Promise<ProductResponse> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new ProductNotFoundError();
  }
  return toProductResponse(product);
}

export interface SearchOptions {
  q: string;
  category?: string;
  page: number;
  limit: number;
}

export async function search(options: SearchOptions): Promise<ProductSearchResponse> {
  const { q, category, page, limit } = options;

  // Use raw SQL for tsvector search with ILIKE fallback
  const categoryFilter = category ? `AND p."category" = $4` : '';
  const params: any[] = [q, limit, (page - 1) * limit];
  if (category) params.push(category);

  const products = await prisma.$queryRawUnsafe<Array<any>>(
    `SELECT p."id", p."name", p."description", p."category",
       p."originalPrice", p."discountedPrice", p."stock",
       p."imageUrl", p."storeName", p."storeAddress",
       p."storeLat", p."storeLng", p."expiresAt", p."isActive",
       p."createdAt", p."updatedAt",
       ts_rank(p."searchVector", plainto_tsquery('indonesian', $1)) AS rank
     FROM "products" p
     WHERE p."isActive" = true
       AND (p."searchVector" @@ plainto_tsquery('indonesian', $1)
            OR p."name" ILIKE '%' || $1 || '%'
            OR p."storeName" ILIKE '%' || $1 || '%')
       ${categoryFilter}
     ORDER BY rank DESC, p."createdAt" DESC
     LIMIT $2 OFFSET $3`,
    ...params
  );

  const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::int as count
     FROM "products" p
     WHERE p."isActive" = true
       AND (p."searchVector" @@ plainto_tsquery('indonesian', $1)
            OR p."name" ILIKE '%' || $1 || '%'
            OR p."storeName" ILIKE '%' || $1 || '%')
       ${categoryFilter}`,
    ...params.slice(0, category ? 2 : 1)
  );

  const total = Number(countResult[0]?.count || 0);

  return {
    products: products.map(toProductResponse),
    total,
    page,
    limit,
    query: q,
  };
}

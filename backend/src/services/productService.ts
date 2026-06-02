import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { ProductResponse, ProductListResponse } from '../types/index.js';

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

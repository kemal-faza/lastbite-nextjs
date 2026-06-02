import { z } from 'zod';

export const productQuerySchema = z.object({
  category: z.enum(['meals', 'bakery', 'drinks']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(200, 'Nama produk maksimal 200 karakter'),
  description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
  category: z.enum(['meals', 'bakery', 'drinks']),
  originalPrice: z.number().int().positive('Harga asli harus positif'),
  discountedPrice: z.number().int().positive('Harga diskon harus positif'),
  stock: z.number().int().min(0, 'Stok minimal 0'),
  imageUrl: z.string().url('URL gambar tidak valid').optional().nullable(),
  storeName: z.string().min(1, 'Nama toko wajib diisi').max(200),
  storeAddress: z.string().max(500).optional().nullable(),
  storeLat: z.number().optional().nullable(),
  storeLng: z.number().optional().nullable(),
  expiresAt: z.string().datetime('Format tanggal tidak valid'),
});

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.enum(['meals', 'bakery', 'drinks']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

import { z } from 'zod';

export const registerMitraSchema = z.object({
  storeName: z.string().trim().min(1, 'Nama toko wajib diisi').max(200, 'Nama toko maksimal 200 karakter'),
  storeDescription: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
  storeAddress: z.string().max(500, 'Alamat maksimal 500 karakter').optional(),
  storeLat: z.number().min(-90).max(90).optional().nullable(),
  storeLng: z.number().min(-180).max(180).optional().nullable(),
});

export const updateMitraProfileSchema = z.object({
  storeName: z.string().trim().min(1).max(200).optional(),
  storeDescription: z.string().max(1000).optional().nullable(),
  storeAddress: z.string().max(500).optional().nullable(),
  storeLat: z.number().min(-90).max(90).optional().nullable(),
  storeLng: z.number().min(-180).max(180).optional().nullable(),
});

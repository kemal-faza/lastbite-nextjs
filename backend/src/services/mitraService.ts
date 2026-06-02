import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { MitraProfileResponse } from '../types/index.js';

export class MitraError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'MitraError';
  }
}

function toMitraProfileResponse(p: {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string | null;
  storeAddress: string | null;
  storeLat: number | null;
  storeLng: number | null;
  verificationStatus: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}): MitraProfileResponse {
  const toISO = (v: Date | string) => v instanceof Date ? v.toISOString() : v;
  return {
    id: p.id,
    userId: p.userId,
    storeName: p.storeName,
    storeDescription: p.storeDescription,
    storeAddress: p.storeAddress,
    storeLat: p.storeLat,
    storeLng: p.storeLng,
    verificationStatus: p.verificationStatus as 'PENDING' | 'VERIFIED' | 'REJECTED',
    createdAt: toISO(p.createdAt),
    updatedAt: toISO(p.updatedAt),
  };
}

export async function registerMitra(
  userId: string,
  input: {
    storeName: string;
    storeDescription?: string;
    storeAddress?: string;
    storeLat?: number | null;
    storeLng?: number | null;
  }
): Promise<MitraProfileResponse> {
  // Note: no separate findUnique check here -- TOCTOU race avoided by catching P2002
  try {
    const [profile] = await prisma.$transaction([
      prisma.mitraProfile.create({
        data: {
          userId,
          storeName: input.storeName,
          storeDescription: input.storeDescription ?? null,
          storeAddress: input.storeAddress ?? null,
          storeLat: input.storeLat ?? null,
          storeLng: input.storeLng ?? null,
          verificationStatus: 'VERIFIED', // Auto-verify for M4; admin verification comes in M10
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: 'MITRA' },
      }),
    ]);

    return toMitraProfileResponse(profile);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new MitraError('Anda sudah terdaftar sebagai Mitra', 'ALREADY_MITRA');
    }
    throw err;
  }
}

export async function getMitraProfile(userId: string): Promise<MitraProfileResponse> {
  const profile = await prisma.mitraProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new MitraError('Profil mitra tidak ditemukan', 'MITRA_NOT_FOUND');
  }
  return toMitraProfileResponse(profile);
}

export async function updateMitraProfile(
  userId: string,
  input: {
    storeName?: string;
    storeDescription?: string | null;
    storeAddress?: string | null;
    storeLat?: number | null;
    storeLng?: number | null;
  }
): Promise<MitraProfileResponse> {
  try {
    const profile = await prisma.mitraProfile.update({
      where: { userId },
      data: {
        ...(input.storeName !== undefined && { storeName: input.storeName }),
        ...(input.storeDescription !== undefined && { storeDescription: input.storeDescription }),
        ...(input.storeAddress !== undefined && { storeAddress: input.storeAddress }),
        ...(input.storeLat !== undefined && { storeLat: input.storeLat }),
        ...(input.storeLng !== undefined && { storeLng: input.storeLng }),
      },
    });

    return toMitraProfileResponse(profile);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new MitraError('Profil mitra tidak ditemukan', 'MITRA_NOT_FOUND');
    }
    throw err;
  }
}

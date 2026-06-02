import { prisma } from '../lib/prisma.js';
import type { UserResponse } from '../types/index.js';

function toUserResponse(user: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  isVerified: boolean;
  createdAt: Date;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

export class UserNotFoundError extends Error {
  constructor() {
    super('Pengguna tidak ditemukan');
    this.name = 'UserNotFoundError';
  }
}

export async function getProfile(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UserNotFoundError();
  }
  return toUserResponse(user);
}

export async function updateProfile(
  userId: string,
  data: { name?: string; phone?: string }
): Promise<UserResponse> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
  });
  return toUserResponse(user);
}

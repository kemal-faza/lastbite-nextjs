import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/password.js';
import { getOtpSender } from '../lib/otpSender.js';
import { config } from '../config.js';
import type { UserResponse } from '../types/index.js';

function generateOtpCode(): string {
  const min = Math.pow(10, config.otpLength - 1);
  const max = Math.pow(10, config.otpLength) - 1;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

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

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super('Email sudah terdaftar');
    this.name = 'EmailAlreadyExistsError';
  }
}

export async function register(input: {
  email: string;
  name: string;
  phone?: string;
  password: string;
}): Promise<{ user: UserResponse }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new EmailAlreadyExistsError();
  }

  const passwordHash = await hashPassword(input.password);
  const verificationCode = generateOtpCode();
  const verificationCodeExpiresAt = new Date(
    Date.now() + config.otpExpiryMinutes * 60 * 1000
  );

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      phone: input.phone || null,
      passwordHash,
      verificationCode,
      verificationCodeExpiresAt,
    },
  });

  await getOtpSender().sendOtp(user.email, verificationCode);

  return { user: toUserResponse(user) };
}

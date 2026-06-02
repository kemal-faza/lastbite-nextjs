# M1: Auth & User Foundation -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development, superpowers:dispatching-parallel-agents, or superpowers:executing-plans. See the Task Grouping section for parallel vs sequential execution strategy.

**Goal:** Real user accounts with register, OTP verification, login, profile management, and logout -- backed by Express + PostgreSQL.

**Architecture:** Monorepo with a new `backend/` directory (Express 4 + TypeScript + Prisma + PostgreSQL) alongside the existing Next.js 15 prototype. The Next.js app gains new auth pages (`(auth)` route group) and an AuthContext provider. All tasks are vertical slices spanning database, API, and frontend.

**Execution Strategy:** Sequential -- all four tasks form a single dependency chain (register -> login -> OTP verify -> profile). Each builds on the previous.

**Tech Stack:** Express 4, TypeScript 5, Prisma 6, PostgreSQL, bcryptjs, jsonwebtoken, zod (validation), vitest (backend tests), Next.js 15 (frontend), react-hook-form (forms), input-otp (OTP input, already installed), shadcn/ui (components, already installed)

**Design System (unchanged from prototype):**
- Primary: `#11676a` (teal) -- headers, primary buttons
- Secondary: `#dda63a` (gold) -- accents
- Background: `#e4dcca` (cream)
- Radii: `--radius: 0.625rem`
- Mobile-first, max-w-md container

**Key decisions:**
- OTP delivery is mocked (console.log in dev). Interface `otpSender.ts` allows swapping to Twilio/WaGateway later without code changes.
- JWT access token (15min) + refresh token (7 days). Tokens stored in localStorage on the frontend (httpOnly cookie not viable with separate backend port in dev).
- Passwords hashed with bcryptjs (12 salt rounds).
- Email used as primary identifier. Phone optional during registration.

---

## File Structure Map

| File | Purpose |
|------|---------|
| `backend/package.json` | Backend dependencies & scripts |
| `backend/tsconfig.json` | TypeScript config (Node target) |
| `backend/vitest.config.ts` | Test runner config |
| `backend/.env.example` | Env template (DATABASE_URL, JWT_SECRET) |
| `backend/prisma/schema.prisma` | User model + migration |
| `backend/src/index.ts` | Entry point: listen on port |
| `backend/src/app.ts` | Express app (separate for supertest) |
| `backend/src/config.ts` | Env vars with defaults |
| `backend/src/lib/prisma.ts` | Prisma client singleton |
| `backend/src/lib/jwt.ts` | signAccessToken, signRefreshToken, verifyToken |
| `backend/src/lib/password.ts` | hashPassword, verifyPassword |
| `backend/src/lib/otpSender.ts` | sendOtp(email, code) -- mock impl |
| `backend/src/middleware/auth.ts` | JWT auth middleware |
| `backend/src/middleware/errorHandler.ts` | Global error handler |
| `backend/src/validators/auth.ts` | Zod schemas for auth routes |
| `backend/src/validators/users.ts` | Zod schemas for user routes |
| `backend/src/services/authService.ts` | register, login, verifyOtp, resendOtp |
| `backend/src/services/userService.ts` | getProfile, updateProfile |
| `backend/src/routes/auth.ts` | /auth/* routes |
| `backend/src/routes/users.ts` | /users/* routes |
| `backend/src/types/index.ts` | Shared TypeScript types |
| `backend/tests/setup.ts` | Test DB setup/teardown |
| `backend/tests/auth/register.test.ts` | Register endpoint tests |
| `backend/tests/auth/login.test.ts` | Login endpoint tests |
| `backend/tests/auth/verify-otp.test.ts` | OTP verification tests |
| `backend/tests/users/profile.test.ts` | Profile endpoint tests |
| `src/app/(auth)/layout.tsx` | Auth layout (no BottomNav, centered) |
| `src/app/(auth)/register/page.tsx` | Register form |
| `src/app/(auth)/login/page.tsx` | Login form |
| `src/app/(auth)/verify-otp/page.tsx` | OTP input screen |
| `src/lib/api/client.ts` | Fetch wrapper with JWT injection |
| `src/lib/context/AuthContext.tsx` | Auth state provider |
| `src/app/providers.tsx` | MODIFY: add AuthProvider |
| `src/app/(main)/profile/page.tsx` | MODIFY: real data, edit mode, logout |

---

## Shared Types (defined here, used across all tasks)

```typescript
// backend/src/types/index.ts
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: UserResponse;
}

export interface ApiError {
  error: string;
  code: string;
}
```

---

## Task Grouping

All tasks are in one sequential chain because each task's frontend depends on the backend endpoint from the previous task, and auth state flows through all of them.

```
Sequential Chain 1: M1 Auth Foundation
  Task 1: Backend foundation + Register (AFK, blocked by: None)
    ↓ depends on
  Task 2: Login + JWT auth (AFK, blocked by: Task 1)
    ↓ depends on
  Task 3: OTP verification (AFK, blocked by: Task 1, Task 2)
    ↓ depends on
  Task 4: Profile CRUD + AuthContext (AFK, blocked by: Task 2, Task 3)
```

---

### Task 1: Backend Foundation + Registration Flow

**Type:** `AFK`
**Blocked by:** None

**Files:**
- Create: `backend/package.json`, `backend/tsconfig.json`, `backend/vitest.config.ts`, `backend/.env.example`
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/index.ts`, `backend/src/app.ts`, `backend/src/config.ts`
- Create: `backend/src/lib/prisma.ts`, `backend/src/lib/password.ts`
- Create: `backend/src/lib/otpSender.ts`
- Create: `backend/src/middleware/errorHandler.ts`
- Create: `backend/src/validators/auth.ts`
- Create: `backend/src/services/authService.ts`
- Create: `backend/src/routes/auth.ts`
- Create: `backend/src/types/index.ts`
- Create: `backend/tests/setup.ts`
- Create: `backend/tests/auth/register.test.ts`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Initialize backend project**

Run: `mkdir -p backend/src/lib backend/src/middleware backend/src/validators backend/src/services backend/src/routes backend/src/types backend/tests/auth backend/tests/users backend/prisma`

- [ ] **Step 2: Write backend package.json**

```json
{
  "name": "lastbite-backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.15.0",
    "@types/supertest": "^6.0.2",
    "prisma": "^6.0.0",
    "supertest": "^7.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Write backend tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 4: Write backend/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 15000,
  },
});
```

- [ ] **Step 5: Write backend/.env.example**

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lastbite_dev"
JWT_SECRET="change-me-in-production-use-64-char-random-string"
JWT_REFRESH_SECRET="change-me-too-different-from-jwt-secret"
PORT=4000
```

Copy to `.env` and `.env.test` with `DATABASE_URL` pointing to `lastbite_test` for the test database.

- [ ] **Step 6: Write Prisma schema**

```prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                         String    @id @default(uuid())
  email                      String    @unique
  name                       String
  phone                      String?
  passwordHash               String
  isVerified                 Boolean   @default(false)
  verificationCode           String?
  verificationCodeExpiresAt  DateTime?
  refreshToken               String?
  createdAt                  DateTime  @default(now())
  updatedAt                  DateTime  @updatedAt

  @@map("users")
}
```

- [ ] **Step 7: Run initial Prisma migration**

```bash
cd backend && npm install && npx prisma migrate dev --name init
```

Expected: `Applying migration... Your database is now in sync with your schema.`

- [ ] **Step 8: Write config.ts**

```typescript
// backend/src/config.ts
import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-not-for-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-not-for-production',
  jwtAccessExpiry: '15m',
  jwtRefreshExpiry: '7d',
  otpExpiryMinutes: 5,
  otpLength: 6,
  bcryptSaltRounds: 12,
};
```

- [ ] **Step 9: Write lib/prisma.ts**

```typescript
// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 10: Write lib/password.ts**

```typescript
// backend/src/lib/password.ts
import bcrypt from 'bcryptjs';
import { config } from '../config.js';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.bcryptSaltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

- [ ] **Step 11: Write lib/otpSender.ts**

```typescript
// backend/src/lib/otpSender.ts

export interface OtpSender {
  sendOtp(email: string, code: string): Promise<void>;
}

export class MockOtpSender implements OtpSender {
  async sendOtp(email: string, code: string): Promise<void> {
    console.log(`\n[MOCK OTP] To: ${email} | Code: ${code}\n`);
  }
}

let instance: OtpSender | null = null;

export function getOtpSender(): OtpSender {
  if (!instance) {
    instance = new MockOtpSender();
  }
  return instance;
}

export function setOtpSender(sender: OtpSender): void {
  instance = sender;
}
```

- [ ] **Step 12: Write validators/auth.ts**

```typescript
// backend/src/validators/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit').optional(),
  password: z.string().min(8, 'Password minimal 8 karakter').max(128, 'Password maksimal 128 karakter'),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  code: z.string().length(6, 'Kode verifikasi harus 6 digit'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});
```

- [ ] **Step 13: Write types/index.ts** (shared types defined in preamble above)

```typescript
// backend/src/types/index.ts
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: UserResponse;
}

export interface ApiError {
  error: string;
  code: string;
}
```

- [ ] **Step 14: Write services/authService.ts (register only for now)**

```typescript
// backend/src/services/authService.ts
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/password.js';
import { getOtpSender } from '../lib/otpSender.js';
import { config } from '../config.js';
import { Prisma } from '@prisma/client';
import type { UserResponse } from '../types/index.js';

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
```

- [ ] **Step 15: Write routes/auth.ts (register only for now)**

```typescript
// backend/src/routes/auth.ts
import { Router, type Request, type Response, type NextFunction } from 'express';
import { registerSchema } from '../validators/auth.js';
import { register, EmailAlreadyExistsError } from '../services/authService.js';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await register(parsed.data);
    res.status(201).json({
      user: result.user,
      message: 'Registrasi berhasil. Kode verifikasi telah dikirim ke email Anda.',
    });
  } catch (err) {
    if (err instanceof EmailAlreadyExistsError) {
      res.status(409).json({ error: err.message, code: 'EMAIL_EXISTS' });
      return;
    }
    next(err);
  }
});
```

- [ ] **Step 16: Write middleware/errorHandler.ts**

```typescript
// backend/src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message);
  res.status(500).json({
    error: 'Terjadi kesalahan pada server',
    code: 'INTERNAL_ERROR',
  });
}
```

- [ ] **Step 17: Write app.ts**

```typescript
// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/auth', authRouter);

  app.use(errorHandler);

  return app;
}
```

- [ ] **Step 18: Write index.ts**

```typescript
// backend/src/index.ts
import { config } from './config.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[LastBite Backend] Running on http://localhost:${config.port}`);
});
```

- [ ] **Step 19: Write test setup**

```typescript
// backend/tests/setup.ts
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Export for use in tests
export { prisma };
```

- [ ] **Step 20: Write failing register test**

```typescript
// backend/tests/auth/register.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';

const app = createApp();

describe('POST /auth/register', () => {
  it('should register a new user and return 201', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
      isVerified: false,
    });
    expect(res.body.user.id).toBeDefined();
    expect(res.body.message).toContain('verifikasi');

    const dbUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.verificationCode).toBeDefined();
    expect(dbUser!.verificationCode!.length).toBe(6);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        name: 'Test',
        password: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should return 409 for duplicate email', async () => {
    await request(app).post('/auth/register').send({
      email: 'dup@example.com',
      name: 'First',
      password: 'password123',
    });

    const res = await request(app).post('/auth/register').send({
      email: 'dup@example.com',
      name: 'Second',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_EXISTS');
  });

  it('should return 400 when name is empty', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        name: '',
        password: 'password123',
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is less than 8 characters', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        name: 'Test',
        password: 'short',
      });

    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 21: Run tests to verify they fail**

```bash
cd backend && npm test
```

Expected: FAIL -- the register endpoint should be working but we need to verify all test expectations. Some tests may pass since we already implemented the code. Run to confirm test/module setup works.

- [ ] **Step 22: Install backend dependencies and run test**

```bash
cd backend && npm install && npm test
```

Expected: Tests pass (green). The register endpoint was implemented alongside the test code to keep the task self-contained.

- [ ] **Step 23: Write register page frontend**

```typescript
// src/app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, ChevronLeft, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const registerFormSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          phone: data.phone || undefined,
          password: data.password,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setServerError(body.error || 'Registrasi gagal. Silakan coba lagi.');
        return;
      }

      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch {
      setServerError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-lg font-bold text-[var(--primary)]">LastBite</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Akun Baru</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mulai hemat dan kurangi food waste bersama LastBite
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-[var(--destructive)]">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Nadia Putri"
              className="mt-1.5"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              className="mt-1.5"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Nomor Telepon (opsional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08123456789"
              className="mt-1.5"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Masukkan ulang password"
              className="mt-1.5"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-[var(--primary)] hover:bg-[#0d5558] text-white font-medium py-3 rounded-xl"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[var(--primary)] font-medium">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 24: Write auth layout**

```typescript
// src/app/(auth)/layout.tsx
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--background)]">
      {children}
    </div>
  );
}
```

- [ ] **Step 25: Install zod and react-hook-form resolver**

```bash
npm install zod @hookform/resolvers
```

- [ ] **Step 26: Verify registration flow end-to-end**

```bash
# Terminal 1: start backend
cd backend && npm run dev

# Terminal 2: start frontend
npm run dev

# Test: open http://localhost:3000/register
# Fill form, submit. Should redirect to /verify-otp?email=...
# Check backend terminal for OTP code logged to console
```

- [ ] **Step 27: Commit**

```bash
git add backend/ src/app/\(auth\)/ package.json package-lock.json
git commit -m "feat(m1): add backend foundation with user registration flow

- Express 4 + TypeScript backend with Prisma + PostgreSQL
- POST /auth/register with zod validation, bcrypt password hashing
- Mock OTP sender (console.log), swappable via interface
- Register page with react-hook-form + shadcn/ui
- Backend tests with vitest + supertest"
```

---

### Task 2: Login + JWT Auth

**Type:** `AFK`
**Blocked by:** Task 1

**Files:**
- Create: `backend/src/lib/jwt.ts`
- Create: `backend/src/middleware/auth.ts`
- Modify: `backend/src/services/authService.ts` (add login, refresh)
- Modify: `backend/src/routes/auth.ts` (add login, refresh routes)
- Create: `backend/tests/auth/login.test.ts`
- Create: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Write JWT utility**

```typescript
// backend/src/lib/jwt.ts
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signAccessToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtAccessExpiry });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiry });
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, config.jwtRefreshSecret) as { userId: string };
}
```

- [ ] **Step 2: Write auth middleware**

```typescript
// backend/src/middleware/auth.ts
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type JwtPayload } from '../lib/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.', code: 'UNAUTHORIZED' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Sesi telah berakhir. Silakan login kembali.', code: 'TOKEN_EXPIRED' });
  }
}
```

- [ ] **Step 3: Add login and refresh to authService.ts**

Append these exports after the existing `register` function:

```typescript
// Add to backend/src/services/authService.ts (after existing imports)
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { verifyPassword } from '../lib/password.js';
import type { AuthTokens, LoginResponse } from '../types/index.js';

// Add these new error classes
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Email atau password salah');
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountNotVerifiedError extends Error {
  constructor() {
    super('Akun belum diverifikasi. Silakan verifikasi OTP terlebih dahulu.');
    this.name = 'AccountNotVerifiedError';
  }
}

// Add these new functions after register()
export async function login(input: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const passwordValid = await verifyPassword(input.password, user.passwordHash);
  if (!passwordValid) {
    throw new InvalidCredentialsError();
  }

  if (!user.isVerified) {
    throw new AccountNotVerifiedError();
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    tokens: { accessToken, refreshToken },
    user: toUserResponse(user),
  };
}

export async function refreshAccessToken(token: string): Promise<AuthTokens> {
  const payload = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== token) {
    throw new Error('Refresh token tidak valid');
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
}
```

- [ ] **Step 4: Add login and refresh routes**

Append these routes to the authRouter after the register route in `backend/src/routes/auth.ts`:

```typescript
// Add to imports at top of routes/auth.ts
import { login, refreshAccessToken, InvalidCredentialsError, AccountNotVerifiedError } from '../services/authService.js';
import { loginSchema } from '../validators/auth.js';

// Add these routes before the closing of the file (before `export { authRouter }`)

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await login(parsed.data);
    res.json(result);
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({ error: err.message, code: 'INVALID_CREDENTIALS' });
      return;
    }
    if (err instanceof AccountNotVerifiedError) {
      res.status(403).json({ error: err.message, code: 'ACCOUNT_NOT_VERIFIED' });
      return;
    }
    next(err);
  }
});

authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token wajib disertakan', code: 'VALIDATION_ERROR' });
      return;
    }

    const tokens = await refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: 'Refresh token tidak valid atau telah kedaluwarsa', code: 'INVALID_REFRESH_TOKEN' });
  }
});
```

- [ ] **Step 5: Write failing login tests**

```typescript
// backend/tests/auth/login.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { hashPassword } from '../../src/lib/password.js';

const app = createApp();

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        email: 'verified@example.com',
        name: 'Verified User',
        passwordHash: await hashPassword('password123'),
        isVerified: true,
      },
    });
    await prisma.user.create({
      data: {
        email: 'unverified@example.com',
        name: 'Unverified User',
        passwordHash: await hashPassword('password123'),
        isVerified: false,
      },
    });
  });

  it('should login verified user and return tokens', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'verified@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.tokens.accessToken).toBeDefined();
    expect(res.body.tokens.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe('verified@example.com');
    expect(res.body.user.isVerified).toBe(true);
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'verified@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'unknown@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('should return 403 for unverified account', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'unverified@example.com', password: 'password123' });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ACCOUNT_NOT_VERIFIED');
  });
});

describe('POST /auth/refresh', () => {
  it('should return new tokens with valid refresh token', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'verified@example.com', password: 'password123' });

    const refreshToken = loginRes.body.tokens.refreshToken;

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.accessToken).not.toBe(loginRes.body.tokens.accessToken);
  });

  it('should return 401 for invalid refresh token', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'invalid-token' });

    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 6: Run login tests**

```bash
cd backend && npm test -- tests/auth/login.test.ts
```

Expected: PASS (tests should pass since we implemented the service alongside the tests)

- [ ] **Step 7: Write login page frontend**

```typescript
// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, ChevronLeft, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginFormSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        if (body.code === 'ACCOUNT_NOT_VERIFIED') {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
          return;
        }
        setServerError(body.error || 'Login gagal. Periksa email dan password Anda.');
        return;
      }

      localStorage.setItem('accessToken', body.tokens.accessToken);
      localStorage.setItem('refreshToken', body.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(body.user));

      router.push('/');
    } catch {
      setServerError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-lg font-bold text-[var(--primary)]">LastBite</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masuk untuk melanjutkan berburu makanan surplus
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-[var(--destructive)]">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              className="mt-1.5"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[var(--destructive)] mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-[var(--primary)] hover:bg-[#0d5558] text-white font-medium py-3 rounded-xl"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-[var(--primary)] font-medium">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Verify login flow end-to-end**

Start backend + frontend. Navigate to `/login`, enter credentials, verify redirect to home page.

- [ ] **Step 9: Commit**

```bash
git add backend/src/lib/jwt.ts backend/src/middleware/auth.ts backend/src/services/authService.ts backend/src/routes/auth.ts backend/tests/auth/login.test.ts src/app/\(auth\)/login/
git commit -m "feat(m1): add login with JWT auth and refresh tokens

- POST /auth/login with credential validation
- POST /auth/refresh for token renewal
- JWT access token (15min) + refresh token (7 days)
- requireAuth middleware for protected routes
- Login page with form validation and error states
- Unverified account redirects to OTP page"
```

---

### Task 3: OTP Verification

**Type:** `AFK`
**Blocked by:** Task 1 (register endpoint), Task 2 (login endpoint)

**Files:**
- Modify: `backend/src/services/authService.ts` (add verifyOtp, resendOtp)
- Modify: `backend/src/routes/auth.ts` (add verify-otp, resend-otp routes)
- Create: `backend/tests/auth/verify-otp.test.ts`
- Create: `src/app/(auth)/verify-otp/page.tsx`

- [ ] **Step 1: Add verifyOtp and resendOtp to authService.ts**

Append to `backend/src/services/authService.ts`:

```typescript
// Add new error class
export class InvalidOtpError extends Error {
  constructor() {
    super('Kode verifikasi tidak valid atau telah kedaluwarsa');
    this.name = 'InvalidOtpError';
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('Pengguna tidak ditemukan');
    this.name = 'UserNotFoundError';
  }
}

// Add new functions
export async function verifyOtp(input: { email: string; code: string }): Promise<{ verified: boolean }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UserNotFoundError();
  }

  if (user.isVerified) {
    return { verified: true };
  }

  if (
    user.verificationCode !== input.code ||
    !user.verificationCodeExpiresAt ||
    user.verificationCodeExpiresAt < new Date()
  ) {
    throw new InvalidOtpError();
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
    },
  });

  return { verified: true };
}

export async function resendOtp(input: { email: string }): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UserNotFoundError();
  }

  if (user.isVerified) {
    return;
  }

  const verificationCode = generateOtpCode();
  const verificationCodeExpiresAt = new Date(
    Date.now() + config.otpExpiryMinutes * 60 * 1000
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationCode, verificationCodeExpiresAt },
  });

  await getOtpSender().sendOtp(user.email, verificationCode);
}
```

- [ ] **Step 2: Add verify-otp and resend-otp routes**

Append to `backend/src/routes/auth.ts`:

```typescript
// Add to imports
import { verifyOtp, resendOtp, InvalidOtpError, UserNotFoundError } from '../services/authService.js';
import { verifyOtpSchema, resendOtpSchema } from '../validators/auth.js';

// Add routes

authRouter.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await verifyOtp(parsed.data);
    res.json({ verified: result.verified, message: 'Verifikasi berhasil. Akun Anda telah aktif.' });
  } catch (err) {
    if (err instanceof InvalidOtpError) {
      res.status(400).json({ error: err.message, code: 'INVALID_OTP' });
      return;
    }
    if (err instanceof UserNotFoundError) {
      res.status(404).json({ error: err.message, code: 'USER_NOT_FOUND' });
      return;
    }
    next(err);
  }
});

authRouter.post('/resend-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = resendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    await resendOtp(parsed.data);
    res.json({ message: 'Kode verifikasi baru telah dikirim.' });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      res.status(404).json({ error: err.message, code: 'USER_NOT_FOUND' });
      return;
    }
    next(err);
  }
});
```

- [ ] **Step 3: Write OTP test**

```typescript
// backend/tests/auth/verify-otp.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { hashPassword } from '../../src/lib/password.js';

const app = createApp();

describe('POST /auth/verify-otp', () => {
  beforeEach(async () => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.user.create({
      data: {
        email: 'pending@example.com',
        name: 'Pending User',
        passwordHash: await hashPassword('password123'),
        verificationCode: '123456',
        verificationCodeExpiresAt: expiresAt,
        isVerified: false,
      },
    });
    await prisma.user.create({
      data: {
        email: 'expired@example.com',
        name: 'Expired User',
        passwordHash: await hashPassword('password123'),
        verificationCode: '654321',
        verificationCodeExpiresAt: new Date(Date.now() - 1000),
        isVerified: false,
      },
    });
  });

  it('should verify account with correct code', async () => {
    const res = await request(app)
      .post('/auth/verify-otp')
      .send({ email: 'pending@example.com', code: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);

    const user = await prisma.user.findUnique({ where: { email: 'pending@example.com' } });
    expect(user!.isVerified).toBe(true);
    expect(user!.verificationCode).toBeNull();
  });

  it('should return 400 for wrong code', async () => {
    const res = await request(app)
      .post('/auth/verify-otp')
      .send({ email: 'pending@example.com', code: '999999' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_OTP');
  });

  it('should return 400 for expired code', async () => {
    const res = await request(app)
      .post('/auth/verify-otp')
      .send({ email: 'expired@example.com', code: '654321' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_OTP');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .post('/auth/verify-otp')
      .send({ email: 'unknown@example.com', code: '123456' });

    expect(res.status).toBe(404);
  });
});

describe('POST /auth/resend-otp', () => {
  it('should resend OTP for unverified user', async () => {
    const res = await request(app)
      .post('/auth/resend-otp')
      .send({ email: 'pending@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('dikirim');

    const user = await prisma.user.findUnique({ where: { email: 'pending@example.com' } });
    expect(user!.verificationCode).toBeDefined();
    expect(user!.verificationCode).not.toBe('123456');
  });
});
```

- [ ] **Step 4: Run OTP tests**

```bash
cd backend && npm test -- tests/auth/verify-otp.test.ts
```

Expected: PASS

- [ ] **Step 5: Write OTP verify page**

```typescript
// src/app/(auth)/verify-otp/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Utensils, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = useCallback(async (otpCode: string) => {
    if (otpCode.length !== 6) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || 'Verifikasi gagal');
        setCode('');
        return;
      }

      router.push('/login?verified=true');
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, router]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !isSubmitting) {
      const timer = setTimeout(() => handleVerify(code), 300);
      return () => clearTimeout(timer);
    }
  }, [code, isSubmitting, handleVerify]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendMessage('');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || 'Gagal mengirim ulang kode');
        return;
      }

      setResendMessage('Kode baru telah dikirim!');
      setResendCooldown(30);
    } catch {
      setError('Tidak dapat terhubung ke server.');
    }
  };

  const handleDigitInput = (digit: string) => {
    if (code.length >= 6 || isSubmitting) return;
    const newCode = code + digit;
    setCode(newCode);
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Email</h1>
          <p className="text-sm text-gray-500 mt-2">
            Masukkan 6 digit kode yang telah dikirim ke{' '}
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-[var(--destructive)] text-center">{error}</p>
          </div>
        )}

        {resendMessage && (
          <div className="w-full mb-4 p-3 rounded-xl bg-green-50 border border-green-100">
            <p className="text-sm text-green-700 text-center">{resendMessage}</p>
          </div>
        )}

        {/* OTP Display */}
        <div className="flex gap-3 mb-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-colors ${
                code[i]
                  ? 'border-[var(--primary)] bg-white text-gray-900'
                  : 'border-gray-200 bg-white text-gray-300'
              } ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {code[i] || ''}
            </div>
          ))}
        </div>

        {isSubmitting && (
          <p className="text-sm text-gray-400 mt-2">Memverifikasi...</p>
        )}

        {/* Custom Number Pad */}
        <div className="grid grid-cols-3 gap-3 mt-8 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitInput(num.toString())}
              disabled={code.length >= 6 || isSubmitting}
              className="h-14 rounded-xl bg-white border border-gray-200 text-xl font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-40"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigitInput('0')}
            disabled={code.length >= 6 || isSubmitting}
            className="h-14 rounded-xl bg-white border border-gray-200 text-xl font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-40"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={code.length === 0 || isSubmitting}
            className="h-14 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-40"
          >
            Hapus
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Tidak menerima kode?{' '}
            {resendCooldown > 0 ? (
              <span className="text-gray-400">Kirim ulang dalam {resendCooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                className="text-[var(--primary)] font-medium hover:underline"
              >
                Kirim Ulang
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify OTP flow**

Start backend + frontend. Register a new user, check console for OTP code. Navigate to `/verify-otp?email=...`, enter the code. Verify redirect to login.

- [ ] **Step 7: Commit**

```bash
git add backend/src/services/authService.ts backend/src/routes/auth.ts backend/tests/auth/verify-otp.test.ts src/app/\(auth\)/verify-otp/
git commit -m "feat(m1): add OTP verification with custom number pad

- POST /auth/verify-otp with code validation and expiry check
- POST /auth/resend-otp with 30s cooldown
- OTP page with custom number pad UI
- Auto-submit on 6th digit
- Resend cooldown timer"
```

---

### Task 4: Profile CRUD + AuthContext Integration

**Type:** `AFK`
**Blocked by:** Task 2 (JWT middleware), Task 3 (OTP flow)

**Files:**
- Create: `backend/src/services/userService.ts`
- Create: `backend/src/validators/users.ts`
- Create: `backend/src/routes/users.ts`
- Modify: `backend/src/app.ts` (add usersRouter)
- Create: `backend/tests/users/profile.test.ts`
- Create: `src/lib/api/client.ts`
- Create: `src/lib/context/AuthContext.tsx`
- Modify: `src/app/providers.tsx` (add AuthProvider)
- Modify: `src/app/(main)/profile/page.tsx` (real data + edit + logout)

- [ ] **Step 1: Write users validator**

```typescript
// backend/src/validators/users.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter').optional(),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit').optional(),
});
```

- [ ] **Step 2: Write userService.ts**

```typescript
// backend/src/services/userService.ts
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
```

- [ ] **Step 3: Write users routes**

```typescript
// backend/src/routes/users.ts
import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, updateProfile, UserNotFoundError } from '../services/userService.js';
import { updateProfileSchema } from '../validators/users.js';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getProfile(req.user!.userId);
    res.json({ user });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      res.status(404).json({ error: err.message, code: 'USER_NOT_FOUND' });
      return;
    }
    next(err);
  }
});

usersRouter.patch('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const user = await updateProfile(req.user!.userId, parsed.data);
    res.json({ user });
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      res.status(404).json({ error: err.message, code: 'USER_NOT_FOUND' });
      return;
    }
    next(err);
  }
});
```

- [ ] **Step 4: Modify app.ts to include users router**

In `backend/src/app.ts`, add the users router import and mount it:

```typescript
// Add import at top
import { usersRouter } from './routes/users.js';

// Add route mount before errorHandler
app.use('/users', usersRouter);
```

- [ ] **Step 5: Write profile tests**

```typescript
// backend/tests/users/profile.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { hashPassword } from '../../src/lib/password.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('GET /users/me', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'profile@example.com',
        name: 'Profile User',
        passwordHash: await hashPassword('password123'),
        isVerified: true,
      },
    });
    userId = user.id;
    accessToken = signAccessToken({ userId: user.id, email: user.email });
  });

  it('should return user profile with valid token', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('profile@example.com');
    expect(res.body.user.name).toBe('Profile User');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /users/me', () => {
  let accessToken: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'edit@example.com',
        name: 'Edit User',
        passwordHash: await hashPassword('password123'),
        isVerified: true,
      },
    });
    accessToken = signAccessToken({ userId: user.id, email: user.email });
  });

  it('should update user name', async () => {
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Name');
  });

  it('should update user phone', async () => {
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ phone: '08123456789' });

    expect(res.status).toBe(200);
    expect(res.body.user.phone).toBe('08123456789');
  });
});
```

- [ ] **Step 6: Run profile tests**

```bash
cd backend && npm test -- tests/users/profile.test.ts
```

Expected: PASS

- [ ] **Step 7: Write API client**

```typescript
// src/lib/api/client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const body = await res.json();
    setTokens(body.accessToken, body.refreshToken);
    return body.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res = await fetch(`${API_BASE}${path}`, { ...rest, headers });

  if (res.status === 401 && auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...rest, headers });
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new ApiError(401, 'UNAUTHORIZED', 'Sesi berakhir');
    }
  }

  const body = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, body.code || 'UNKNOWN', body.error || 'Unknown error');
  }

  return body as T;
}
```

- [ ] **Step 8: Write AuthContext**

```typescript
// src/lib/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiFetch, clearTokens, setTokens } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  register: (data: { email: string; name: string; phone?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);

        apiFetch<{ user: User }>('/users/me', { auth: true })
          .then((data) => setUser(data.user))
          .catch(() => {
            clearTokens();
            setUser(null);
          })
          .finally(() => setIsLoading(false));
      } catch {
        clearTokens();
        setUser(null);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiFetch<{
        tokens: { accessToken: string; refreshToken: string };
        user: User;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setTokens(data.tokens.accessToken, data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string };
      if (apiErr.status === 403) {
        return { success: false, needsVerification: true, error: 'Akun belum diverifikasi' };
      }
      return {
        success: false,
        error: apiErr.message || 'Login gagal',
      };
    }
  }, []);

  const register = useCallback(async (data: { email: string; name: string; phone?: string; password: string }) => {
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { success: true };
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      return { success: false, error: apiErr.message || 'Registrasi gagal' };
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; phone?: string }) => {
    try {
      const result = await apiFetch<{ user: User }>('/users/me', {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify(data),
      });
      setUser(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      return { success: true };
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      return { success: false, error: apiErr.message || 'Gagal mengupdate profil' };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
```

- [ ] **Step 9: Modify providers.tsx to add AuthProvider**

Change `src/app/providers.tsx`:

```typescript
// In the imports at top, add:
import { AuthProvider } from '@/lib/context/AuthContext';

// Change the JSX wrapping to include AuthProvider as outermost provider:
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              {children}
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

The edit location is at the return statement. Wrap everything with `<AuthProvider>`.

- [ ] **Step 10: Modify profile page with real data, edit mode, and logout**

Modify `src/app/(main)/profile/page.tsx` -- replace the entire file:

```typescript
'use client';

import { useState } from 'react';
import {
  User,
  Settings,
  Clock,
  Heart,
  Award,
  ChevronRight,
  LogOut,
  Shield,
  HelpCircle,
  Store,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MENU_ITEMS = [
  { icon: Clock, label: 'Riwayat Pesanan', path: '/orders' },
  { icon: Heart, label: 'Menu Favorit', path: '/wishlist' },
  { icon: Store, label: 'Dashboard Mitra', path: '/seller' },
  { icon: Shield, label: 'Keamanan Akun', path: '#' },
  { icon: Settings, label: 'Pengaturan', path: '#' },
  { icon: HelpCircle, label: 'Pusat Bantuan', path: '#' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const handleStartEdit = () => {
    if (!user) return;
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setIsEditing(true);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setEditError('Nama tidak boleh kosong');
      return;
    }

    setIsSaving(true);
    setEditError('');

    const result = await updateProfile({
      name: editName.trim(),
      phone: editPhone.trim() || undefined,
    });

    if (result.success) {
      setIsEditing(false);
    } else {
      setEditError(result.error || 'Gagal menyimpan');
    }

    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Belum Masuk</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Masuk untuk melihat profil, riwayat pesanan, dan mengelola akun Anda
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-xl hover:bg-[#0d5558] transition-colors"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Masuk
        </button>
        <button
          onClick={() => router.push('/register')}
          className="mt-3 text-sm text-[var(--primary)] font-medium"
        >
          Belum punya akun? Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[var(--background)] pb-20 h-full">
      {/* Profile Header */}
      <div className="bg-white px-4 pt-8 pb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=11676a&color=fff&size=200`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <Award className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="editName" className="text-xs">Nama</Label>
                  <Input
                    id="editName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone" className="text-xs">Telepon</Label>
                  <Input
                    id="editPhone"
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="08123456789"
                    className="h-9 text-sm"
                  />
                </div>
                {editError && (
                  <p className="text-xs text-[var(--destructive)]">{editError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)] text-white text-xs font-medium rounded-lg hover:bg-[#0d5558] disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200"
                  >
                    <X className="w-3.5 h-3.5" />
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                  <button
                    onClick={handleStartEdit}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                {user.phone && (
                  <p className="text-xs text-gray-400 mb-2">{user.phone}</p>
                )}
                <div className="inline-flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-medium text-green-700">
                    Food Saver
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="px-4 mt-4 mb-2">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 px-1">
          Dampak Kamu Sejauh Ini
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <span className="text-green-600 font-bold text-lg">Rp</span>
            </div>
            <span className="text-xl font-bold text-gray-900 leading-none mb-1">
              0
            </span>
            <span className="text-xs text-gray-500">Uang Dihemat</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <span className="text-green-600 font-bold text-lg">0</span>
            </div>
            <span className="text-xl font-bold text-gray-900 leading-none mb-1">
              0
            </span>
            <span className="text-xs text-gray-500">Makanan Diselamatkan</span>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => item.path !== '#' && router.push(item.path)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-500" />
                <span className="flex-1 text-sm font-medium text-gray-700 text-left">
                  {item.label}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 11: Commit**

```bash
git add backend/src/services/userService.ts backend/src/validators/users.ts backend/src/routes/users.ts backend/src/app.ts backend/tests/users/ src/lib/api/client.ts src/lib/context/AuthContext.tsx src/app/providers.tsx src/app/\(main\)/profile/
git commit -m "feat(m1): add profile CRUD with AuthContext integration

- GET /users/me and PATCH /users/me (authenticated)
- AuthContext provider with login/register/logout/updateProfile
- API client with automatic token refresh
- Profile page: real data, inline edit mode, logout
- Unauthenticated state with login/register prompts"
```

- [ ] **Step 12: Run full test suite**

```bash
cd backend && npm test
```

Expected: All 17 tests pass across auth and users.

- [ ] **Step 13: Verify full end-to-end flow**

1. Start backend + frontend
2. Navigate to `/register` -- register new user
3. Check backend console for OTP code
4. Navigate to `/verify-otp?email=...` -- enter OTP
5. Redirect to `/login` -- login with credentials
6. Redirect to `/` (home) -- verify authenticated state
7. Navigate to `/profile` -- see real user data
8. Click edit pencil icon -- edit name, save
9. Click Logout -- verify redirect to /login, tokens cleared
10. Navigate to `/profile` -- see "Belum Masuk" state

---

## Self-Review

### 1. Spec Coverage

| M1 Requirement | Task(s) | Status |
|---------------|---------|--------|
| User table (PostgreSQL) | Task 1 (Prisma schema) | Covered |
| Password hashing (bcrypt) | Task 1 (lib/password.ts) | Covered |
| JWT auth | Task 2 (lib/jwt.ts, middleware) | Covered |
| Phone/email OTP verification | Task 3 (verify-otp, resend-otp) | Covered |
| POST /auth/register | Task 1 (routes/auth.ts) | Covered |
| POST /auth/login | Task 2 (routes/auth.ts) | Covered |
| POST /auth/verify-otp | Task 3 (routes/auth.ts) | Covered |
| GET/PATCH /users/me | Task 4 (routes/users.ts) | Covered |
| Register screen | Task 1 (register/page.tsx) | Covered |
| Login screen | Task 2 (login/page.tsx) | Covered |
| OTP verify screen | Task 3 (verify-otp/page.tsx) | Covered |
| Profile page (read/edit) | Task 4 (profile/page.tsx) | Covered |
| Logout | Task 4 (AuthContext + profile) | Covered |

All M1 requirements covered. No gaps.

### 2. Placeholder Scan

No TBD, TODO, "implement later", or "add validation" patterns found. All code is fully specified with complete implementations. Error handling is explicit in every endpoint and form. Edge cases (duplicate email, wrong credentials, expired OTP, unverified login, empty profile state) are all handled with specific code.

### 3. Type Consistency

- `UserResponse` defined in Task 1 (`backend/src/types/index.ts`) and used in Tasks 2-4. Fields: `id`, `email`, `name`, `phone`, `isVerified`, `createdAt` -- consistent across all references.
- `AuthTokens` (`accessToken`, `refreshToken`) used in Task 2 login response and Task 4 API client.
- `JwtPayload` (`userId`, `email`) set in Task 2 middleware and consumed in Task 4 routes.
- Frontend `User` interface in AuthContext matches `UserResponse` shape.
- No naming collisions or signature drift.

### 4. Vertical Slice Check

Each task touches 3 layers (database, API, frontend):
- Task 1: Prisma schema + POST /auth/register + register page
- Task 2: JWT lib + POST /auth/login + login page
- Task 3: OTP DB fields + POST /auth/verify-otp + OTP page
- Task 4: User model + GET/PATCH /users/me + profile page with AuthContext

All tasks are vertical slices. No horizontal-only tasks.

### 5. HITL/AFK Check

All 4 tasks marked AFK. No human interaction required -- TDD + structured implementation covers everything. The design decisions (OTP mock, framework choice, token storage strategy) are already documented in the architecture section.

### 6. Task Grouping Check

Single sequential chain. Each task depends on the previous:
- Task 2 (login) needs user data from Task 1 (register)
- Task 3 (OTP) needs register endpoint from Task 1 and login endpoint from Task 2
- Task 4 (profile) needs JWT auth from Task 2 and verified users from Task 3

No parallel opportunities since each task builds on all previous ones. Grouping omitted per skill rules (single linear chain).

### 7. Demoability Check

After completing Task 1: Can register via curl and see user in database.
After completing Task 2: Can login via curl and get JWT tokens.
After completing Task 3: Can complete register-verify-login flow end-to-end via API.
After completing Task 4: Can use the full app UI: register -> verify -> login -> profile -> edit -> logout.

Each task produces a working, testable increment. M1 is fully demoable as: "User registers, verifies OTP, logs in, views and edits profile, logs out."

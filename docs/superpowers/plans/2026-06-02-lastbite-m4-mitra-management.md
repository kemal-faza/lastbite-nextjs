# M4: Mitra Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development, superpowers:dispatching-parallel-agents, or superpowers:executing-plans. See the Task Grouping section for parallel vs sequential execution strategy.

**Goal:** Mitra (sellers) can register via a separate onboarding flow, manage their own products with full CRUD, view a real-time dashboard of stock/sold/remaining stats, and manage incoming orders with status updates.

**Architecture:** Add a `MitraProfile` model (1:1 with User) for store details and verification status. Extend the backend with `/mitra/*` routes (register, profile, products, orders, stats). Rebuild the Next.js `/seller/*` pages from static/localStorage prototypes to API-backed production code using JWT auth and the existing `requireMitra` middleware.

**Execution Strategy:** Hybrid -- Sequential Chain 1 for foundation, then Parallel Batch 1 (Task 3 + Task 4) after Chain 1 completes.

**Tech Stack:** Express 4 + TypeScript 5 + Prisma 6 + PostgreSQL (backend), Next.js 15 + React 18 + Tailwind CSS 4 + shadcn/ui (frontend), Vitest + Supertest (tests)

---

## Pre-Existing Foundation (Do Not Recreate)

These already exist from M1-M3 and are used by this plan:

| What | Where | Notes |
|------|-------|-------|
| `User.role` enum (`FOOD_SAVER`, `MITRA`) | `backend/prisma/schema.prisma:16-19` | Middleware checks `role === 'MITRA'` |
| `requireMitra` middleware | `backend/src/middleware/auth.ts:32-49` | Checks JWT + queries DB for role |
| `Product.mitraId` FK to User | `backend/prisma/schema.prisma:55-56` | Already populated by `POST /products` |
| `POST /products` (mitra-only) | `backend/src/routes/products.ts:56-76` | Uses `requireMitra`, auto-sets `mitraId` |
| `POST /uploads` (mitra-only) | `backend/src/routes/uploads.ts` | Image upload for products |
| `apiFetch<T>` with auto JWT + refresh | `src/lib/api/client.ts` | Frontend API client |
| `createProduct`, `uploadImage` | `src/lib/api/products.ts:61-101` | Frontend product API helpers |
| `AuthContext` with `user.role` | `src/lib/context/AuthContext.tsx` | Provides `user` with role |
| Test patterns (vitest + supertest + prisma) | `backend/tests/**` | See `orders/orders.test.ts` for reference |

---

## File Structure

```
backend/
  prisma/
    schema.prisma                          [MODIFY] Add MitraProfile model + VerificationStatus enum
    migrations/                            [CREATE] Auto-generated migration
  src/
    routes/
      mitra.ts                             [CREATE] /mitra/register, /mitra/me, /mitra/products, /mitra/orders, /mitra/stats
    services/
      mitraService.ts                      [CREATE] registerMitra, getMitraProfile, updateMitraProfile
      mitraProductService.ts               [CREATE] getMitraProducts, updateMitraProduct, deleteMitraProduct
      mitraOrderService.ts                 [CREATE] getStoreOrders, updateOrderStatus
      mitraStatsService.ts                 [CREATE] getMitraStats
    validators/
      mitra.ts                             [CREATE] Zod schemas for mitra endpoints
    types/
      index.ts                             [MODIFY] Add MitraProfileResponse, MitraStatsResponse types
    app.ts                                 [MODIFY] Register /mitra route
  tests/
    mitra/
      register.test.ts                     [CREATE] Mitra registration tests
      profile.test.ts                      [CREATE] Mitra profile tests
      products.test.ts                     [CREATE] Mitra product CRUD tests
      orders.test.ts                       [CREATE] Mitra order management tests
      stats.test.ts                        [CREATE] Mitra stats tests
    setup.ts                               [MODIFY] Add MitraProfile to cleanup

src/
  app/
    seller/
      page.tsx                             [MODIFY] Rebuild with real API data
      add/
        page.tsx                           [MODIFY] Already uses API, minor QA improvements
      edit/
        [id]/
          page.tsx                         [CREATE] Edit product page
      orders/
        page.tsx                           [CREATE] Incoming orders management page
  lib/
    api/
      mitra.ts                             [CREATE] Frontend API client for /mitra/* endpoints
  components/
    MitraRegistrationForm.tsx              [CREATE] Store registration form component
    DashboardStatCards.tsx                 [CREATE] Stats card component
    ProductManagementList.tsx              [CREATE] Product list with edit/delete
    OrderStatusBadge.tsx                   [CREATE] Order status display component
```

---

## Schema Changes

### New `VerificationStatus` Enum

```prisma
enum VerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

### New `MitraProfile` Model

```prisma
model MitraProfile {
  id                 String             @id @default(uuid())
  userId             String             @unique
  storeName          String
  storeDescription   String?
  storeAddress       String?
  storeLat           Float?
  storeLng           Float?
  verificationStatus VerificationStatus @default(PENDING)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("mitra_profiles")
}
```

### Add `mitraProfile` relation to `User`

```prisma
// Inside model User, after the existing relations:
  mitraProfile MitraProfile?
```

This is the only schema change needed. All existing models (User, Product, Order) remain unchanged.

---

## Task Grouping

### Sequential Chain 1: Mitra Foundation

```
Task 1: MitraProfile schema + register/profile API + frontend registration
    ↓ depends on
Task 2: Mitra product CRUD (PATCH/DELETE) + frontend edit/delete
```

### Parallel Batch 1: Dashboard & Orders (after Chain 1)

```
Task 3: Stats aggregation + dashboard rebuild (independent of Task 4)
Task 4: Mitra orders API + orders page (independent of Task 3)
```

---

### Task 1: MitraProfile Schema, Registration, and Profile API

**Type:** `AFK`
**Blocked by:** None

**Files:**
- Modify: `backend/prisma/schema.prisma` -- Add VerificationStatus enum + MitraProfile model + User relation
- Create: `backend/prisma/migrations/*` -- Auto-generated by `npx prisma migrate dev`
- Modify: `backend/src/types/index.ts` -- Add MitraProfileResponse type
- Create: `backend/src/validators/mitra.ts` -- Zod schemas for register, updateProfile
- Create: `backend/src/services/mitraService.ts` -- registerMitra, getMitraProfile, updateMitraProfile
- Create: `backend/src/routes/mitra.ts` -- POST /register, GET /me, PATCH /me
- Modify: `backend/src/app.ts` -- Register `/mitra` route
- Create: `src/lib/api/mitra.ts` -- Frontend API client for /mitra/*
- Create: `src/components/MitraRegistrationForm.tsx` -- Registration form component
- Create: `src/app/seller/register/page.tsx` -- Registration page
- Create: `backend/tests/mitra/register.test.ts` -- Registration tests
- Create: `backend/tests/mitra/profile.test.ts` -- Profile tests
- Modify: `backend/tests/setup.ts` -- Add MitraProfile to cleanup order

- [ ] **Step 1: Add VerificationStatus enum to schema**

Edit `backend/prisma/schema.prisma`, add after `OrderStatus` enum (line 100):

```prisma
enum VerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

- [ ] **Step 2: Add MitraProfile model to schema**

Edit `backend/prisma/schema.prisma`, add after the `OrderItem` model (after line 139):

```prisma
model MitraProfile {
  id                 String             @id @default(uuid())
  userId             String             @unique
  storeName          String
  storeDescription   String?
  storeAddress       String?
  storeLat           Float?
  storeLng           Float?
  verificationStatus VerificationStatus @default(PENDING)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("mitra_profiles")
}
```

Add `mitraProfile` relation inside `model User` (after line 35, before the closing `@@map`):

```prisma
  mitraProfile MitraProfile?
```

- [ ] **Step 3: Generate and run migration**

Run: `npx prisma migrate dev --name add_mitra_profiles`
Expected: Migration created, "Your database is now in sync with your schema."

- [ ] **Step 4: Add MitraProfileResponse type**

Edit `backend/src/types/index.ts`, append after the `ProductSearchResponse` interface:

```typescript
export interface MitraProfileResponse {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string | null;
  storeAddress: string | null;
  storeLat: number | null;
  storeLng: number | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface MitraStatsResponse {
  totalStock: number;
  totalSold: number;
  remaining: number;
  productCount: number;
  activeOrders: number;
}
```

- [ ] **Step 5: Create validators**

Create `backend/src/validators/mitra.ts`:

```typescript
import { z } from 'zod';

export const registerMitraSchema = z.object({
  storeName: z.string().min(1, 'Nama toko wajib diisi').max(200, 'Nama toko maksimal 200 karakter'),
  storeDescription: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
  storeAddress: z.string().max(500, 'Alamat maksimal 500 karakter').optional(),
  storeLat: z.number().min(-90).max(90).optional().nullable(),
  storeLng: z.number().min(-180).max(180).optional().nullable(),
});

export const updateMitraProfileSchema = z.object({
  storeName: z.string().min(1).max(200).optional(),
  storeDescription: z.string().max(1000).optional().nullable(),
  storeAddress: z.string().max(500).optional().nullable(),
  storeLat: z.number().min(-90).max(90).optional().nullable(),
  storeLng: z.number().min(-180).max(180).optional().nullable(),
});
```

- [ ] **Step 6: Create mitraService**

Create `backend/src/services/mitraService.ts`:

```typescript
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
  const existing = await prisma.mitraProfile.findUnique({ where: { userId } });
  if (existing) {
    throw new MitraError('Anda sudah terdaftar sebagai Mitra', 'ALREADY_MITRA');
  }

  const [profile] = await prisma.$transaction([
    prisma.mitraProfile.create({
      data: {
        userId,
        storeName: input.storeName,
        storeDescription: input.storeDescription ?? null,
        storeAddress: input.storeAddress ?? null,
        storeLat: input.storeLat ?? null,
        storeLng: input.storeLng ?? null,
        verificationStatus: 'VERIFIED', // Auto-verify for M4; admin verification comes in M9
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { role: 'MITRA' },
    }),
  ]);

  return toMitraProfileResponse(profile);
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
  const existing = await prisma.mitraProfile.findUnique({ where: { userId } });
  if (!existing) {
    throw new MitraError('Profil mitra tidak ditemukan', 'MITRA_NOT_FOUND');
  }

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
}
```

- [ ] **Step 7: Create mitra routes**

Create `backend/src/routes/mitra.ts`:

```typescript
import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { registerMitra, getMitraProfile, updateMitraProfile, MitraError } from '../services/mitraService.js';
import { registerMitraSchema, updateMitraProfileSchema } from '../validators/mitra.js';

export const mitraRouter = Router();

// All mitra routes require authentication
mitraRouter.use(requireAuth);

// POST /mitra/register - Register as Mitra
mitraRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = registerMitraSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const profile = await registerMitra(req.user!.userId, parsed.data);
    res.status(201).json({ profile });
  } catch (err) {
    if (err instanceof MitraError) {
      res.status(400).json({ error: err.message, code: err.code });
      return;
    }
    next(err);
  }
});

// GET /mitra/me - Get own mitra profile
mitraRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await getMitraProfile(req.user!.userId);
    res.json({ profile });
  } catch (err) {
    if (err instanceof MitraError) {
      res.status(404).json({ error: err.message, code: err.code });
      return;
    }
    next(err);
  }
});

// PATCH /mitra/me - Update own mitra profile
mitraRouter.patch('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateMitraProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const profile = await updateMitraProfile(req.user!.userId, parsed.data);
    res.json({ profile });
  } catch (err) {
    if (err instanceof MitraError) {
      res.status(404).json({ error: err.message, code: err.code });
      return;
    }
    next(err);
  }
});
```

- [ ] **Step 8: Register route in app.ts**

Edit `backend/src/app.ts`, add import after line 8 (`import { ordersRouter } ...`):

```typescript
import { mitraRouter } from './routes/mitra.js';
```

Add route registration after line 42 (`app.use('/orders', ordersRouter);`):

```typescript
app.use('/mitra', mitraRouter);
```

- [ ] **Step 9: Create frontend Mitra API client**

Create `src/lib/api/mitra.ts`:

```typescript
import { apiFetch } from './client';

export interface MitraProfile {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string | null;
  storeAddress: string | null;
  storeLat: number | null;
  storeLng: number | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface RegisterMitraInput {
  storeName: string;
  storeDescription?: string;
  storeAddress?: string;
  storeLat?: number | null;
  storeLng?: number | null;
}

export async function registerMitra(data: RegisterMitraInput): Promise<{ profile: MitraProfile }> {
  return apiFetch<{ profile: MitraProfile }>('/mitra/register', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function getMitraProfile(): Promise<{ profile: MitraProfile }> {
  return apiFetch<{ profile: MitraProfile }>('/mitra/me', { auth: true });
}

export async function updateMitraProfile(data: Partial<RegisterMitraInput>): Promise<{ profile: MitraProfile }> {
  return apiFetch<{ profile: MitraProfile }>('/mitra/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}
```

- [ ] **Step 10: Create MitraRegistrationForm component**

Create `src/components/MitraRegistrationForm.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { registerMitra } from '@/lib/api/mitra';

export default function MitraRegistrationForm() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!storeName.trim()) {
      setError('Nama toko wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      await registerMitra({
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim() || undefined,
        storeAddress: storeAddress.trim() || undefined,
      });
      router.push('/seller');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan Mitra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Daftar Menjadi Mitra</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Gratis selamanya. Tidak ada biaya platform. Jual Makanan Surplus dan bantu kurangi food waste.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Nama Toko <span className="text-[var(--destructive)]">*</span>
        </label>
        <Input
          type="text"
          placeholder="Contoh: Roti Ibu Tutik"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Alamat Toko</label>
        <Input
          type="text"
          placeholder="Contoh: Jl. Melati No. 8, Jakarta Selatan"
          value={storeAddress}
          onChange={(e) => setStoreAddress(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Deskripsi Toko</label>
        <Textarea
          placeholder="Ceritakan tentang toko kamu..."
          value={storeDescription}
          onChange={(e) => setStoreDescription(e.target.value)}
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[var(--primary)] text-white font-semibold py-4 rounded-2xl hover:bg-[var(--primary)]/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Mendaftarkan...
          </>
        ) : (
          'Daftar Sebagai Mitra'
        )}
      </button>
    </form>
  );
}
```

- [ ] **Step 11: Create registration page**

Create `src/app/seller/register/page.tsx`:

```tsx
'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MitraRegistrationForm from '@/components/MitraRegistrationForm';

export default function MitraRegisterPage() {
  const router = useRouter();

  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Daftar Mitra</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
        <MitraRegistrationForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 12: Update test setup to clean MitraProfile**

Edit `backend/tests/setup.ts`, update the `beforeEach` hook. Replace the existing delete order with:

```typescript
beforeEach(async () => {
  await prisma.mitraProfile.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
});
```

- [ ] **Step 13: Write registration tests**

Create `backend/tests/mitra/register.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('POST /mitra/register', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'mitra-test@example.com',
        name: 'Mitra Tester',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });
    userId = user.id;
    accessToken = signAccessToken({ userId: user.id, email: user.email });
  });

  it('should register user as mitra', async () => {
    const res = await request(app)
      .post('/mitra/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        storeName: 'Roti Ibu Tutik',
        storeAddress: 'Jl. Melati No. 8',
        storeDescription: 'Roti homemade fresh setiap hari',
      });

    expect(res.status).toBe(201);
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.storeName).toBe('Roti Ibu Tutik');
    expect(res.body.profile.storeAddress).toBe('Jl. Melati No. 8');
    expect(res.body.profile.storeDescription).toBe('Roti homemade fresh setiap hari');
    expect(res.body.profile.verificationStatus).toBe('VERIFIED');
  });

  it('should update user role to MITRA', async () => {
    await request(app)
      .post('/mitra/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ storeName: 'Test Store' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user!.role).toBe('MITRA');
  });

  it('should reject duplicate registration', async () => {
    await request(app)
      .post('/mitra/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ storeName: 'Store A' });

    const res = await request(app)
      .post('/mitra/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ storeName: 'Store B' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('ALREADY_MITRA');
  });

  it('should reject empty store name', async () => {
    const res = await request(app)
      .post('/mitra/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ storeName: ' ' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should reject without auth', async () => {
    const res = await request(app)
      .post('/mitra/register')
      .send({ storeName: 'Test' });

    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 14: Write profile tests**

Create `backend/tests/mitra/profile.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('Mitra Profile API', () => {
  let mitraAccessToken: string;
  let mitraUserId: string;
  let foodSaverAccessToken: string;

  beforeEach(async () => {
    // Create mitra user with profile
    const mitraUser = await prisma.user.create({
      data: {
        email: 'mitra-pro@example.com',
        name: 'Mitra Pro',
        passwordHash: 'hash',
        role: 'MITRA',
        isVerified: true,
        mitraProfile: {
          create: {
            storeName: 'Roti Enak',
            storeAddress: 'Jl. Kenanga No. 1',
            verificationStatus: 'VERIFIED',
          },
        },
      },
    });
    mitraUserId = mitraUser.id;
    mitraAccessToken = signAccessToken({ userId: mitraUser.id, email: mitraUser.email });

    // Create food saver user (no mitra profile)
    const fsUser = await prisma.user.create({
      data: {
        email: 'food-saver@example.com',
        name: 'Food Saver',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });
    foodSaverAccessToken = signAccessToken({ userId: fsUser.id, email: fsUser.email });
  });

  describe('GET /mitra/me', () => {
    it('should return mitra profile', async () => {
      const res = await request(app)
        .get('/mitra/me')
        .set('Authorization', `Bearer ${mitraAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.profile.storeName).toBe('Roti Enak');
      expect(res.body.profile.storeAddress).toBe('Jl. Kenanga No. 1');
      expect(res.body.profile.verificationStatus).toBe('VERIFIED');
    });

    it('should return 404 for non-mitra user', async () => {
      const res = await request(app)
        .get('/mitra/me')
        .set('Authorization', `Bearer ${foodSaverAccessToken}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('MITRA_NOT_FOUND');
    });
  });

  describe('PATCH /mitra/me', () => {
    it('should update mitra profile', async () => {
      const res = await request(app)
        .patch('/mitra/me')
        .set('Authorization', `Bearer ${mitraAccessToken}`)
        .send({ storeName: 'Roti Enak Banget', storeAddress: 'Jl. Mawar No. 5' });

      expect(res.status).toBe(200);
      expect(res.body.profile.storeName).toBe('Roti Enak Banget');
      expect(res.body.profile.storeAddress).toBe('Jl. Mawar No. 5');
    });

    it('should partial update', async () => {
      const res = await request(app)
        .patch('/mitra/me')
        .set('Authorization', `Bearer ${mitraAccessToken}`)
        .send({ storeName: 'Roti Super' });

      expect(res.status).toBe(200);
      expect(res.body.profile.storeName).toBe('Roti Super');
      expect(res.body.profile.storeAddress).toBe('Jl. Kenanga No. 1'); // unchanged
    });

    it('should return 404 for non-mitra user', async () => {
      const res = await request(app)
        .patch('/mitra/me')
        .set('Authorization', `Bearer ${foodSaverAccessToken}`)
        .send({ storeName: 'Hacked!' });

      expect(res.status).toBe(404);
    });
  });
});
```

- [ ] **Step 15: Run all tests to verify**

Run: `npx vitest run --config backend/vitest.config.ts`
Expected: ALL tests pass (registration + profile tests green, existing tests unaffected)

- [ ] **Step 16: Commit**

```bash
git add backend/prisma/ backend/src/types/index.ts backend/src/validators/mitra.ts backend/src/services/mitraService.ts backend/src/routes/mitra.ts backend/src/app.ts backend/tests/setup.ts backend/tests/mitra/ src/lib/api/mitra.ts src/components/MitraRegistrationForm.tsx src/app/seller/register/
git commit -m "feat(m4): add MitraProfile schema, register/profile API, and frontend registration form"
```

---

### Task 2: Mitra Product CRUD (PATCH/DELETE Own Products)

**Type:** `AFK`
**Blocked by:** Task 1

**Files:**
- Modify: `backend/src/routes/mitra.ts` -- Add GET /products, PATCH /products/:id, DELETE /products/:id
- Create: `backend/src/services/mitraProductService.ts` -- getMitraProducts, updateMitraProduct, deleteMitraProduct
- Modify: `backend/src/validators/mitra.ts` -- Add updateProductSchema
- Modify: `src/lib/api/mitra.ts` -- Add fetchMitraProducts, updateMitraProduct, deleteMitraProduct
- Create: `src/app/seller/edit/[id]/page.tsx` -- Edit product page
- Modify: `src/app/seller/page.tsx` -- Add edit/delete buttons to product list (placeholder, full rebuild in Task 3)
- Create: `backend/tests/mitra/products.test.ts` -- Mitra product CRUD tests

- [ ] **Step 1: Create mitraProductService**

Create `backend/src/services/mitraProductService.ts`:

```typescript
import { prisma } from '../lib/prisma.js';
import type { ProductResponse } from '../types/index.js';

export class MitraProductError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'MitraProductError';
  }
}

function toISO(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function toProductResponse(product: any): ProductResponse {
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

export async function getMitraProducts(mitraId: string): Promise<ProductResponse[]> {
  const products = await prisma.product.findMany({
    where: { mitraId },
    orderBy: { createdAt: 'desc' },
  });
  return products.map(toProductResponse);
}

export async function updateMitraProduct(
  mitraId: string,
  productId: string,
  input: {
    name?: string;
    description?: string | null;
    category?: string;
    originalPrice?: number;
    discountedPrice?: number;
    stock?: number;
    imageUrl?: string | null;
    storeName?: string;
    storeAddress?: string | null;
    expiresAt?: string;
    isActive?: boolean;
  }
): Promise<ProductResponse> {
  const product = await prisma.product.findFirst({
    where: { id: productId, mitraId },
  });

  if (!product) {
    throw new MitraProductError('Produk tidak ditemukan atau bukan milik Anda', 'PRODUCT_NOT_FOUND');
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.category !== undefined && { category: input.category as any }),
      ...(input.originalPrice !== undefined && { originalPrice: input.originalPrice }),
      ...(input.discountedPrice !== undefined && { discountedPrice: input.discountedPrice }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.storeName !== undefined && { storeName: input.storeName }),
      ...(input.storeAddress !== undefined && { storeAddress: input.storeAddress }),
      ...(input.expiresAt !== undefined && { expiresAt: new Date(input.expiresAt) }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });

  return toProductResponse(updated);
}

export async function deleteMitraProduct(mitraId: string, productId: string): Promise<void> {
  const product = await prisma.product.findFirst({
    where: { id: productId, mitraId },
  });

  if (!product) {
    throw new MitraProductError('Produk tidak ditemukan atau bukan milik Anda', 'PRODUCT_NOT_FOUND');
  }

  await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  });
}
```

- [ ] **Step 2: Add validators**

Edit `backend/src/validators/mitra.ts`, append:

```typescript
export const updateMitraProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  category: z.enum(['meals', 'bakery', 'drinks']).optional(),
  originalPrice: z.number().int().positive().optional(),
  discountedPrice: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional().nullable(),
  storeName: z.string().min(1).max(200).optional(),
  storeAddress: z.string().max(500).optional().nullable(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});
```

- [ ] **Step 3: Add product routes to mitra router**

Edit `backend/src/routes/mitra.ts`. Add imports at top:

```typescript
import { getMitraProducts, updateMitraProduct, deleteMitraProduct, MitraProductError } from '../services/mitraProductService.js';
import { requireMitra } from '../middleware/auth.js';
import { updateMitraProductSchema } from '../validators/mitra.js';
```

Add routes after `PATCH /mitra/me` handler (before the closing `});` of the router):

```typescript
// GET /mitra/products - List own products
mitraRouter.get('/products', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await getMitraProducts(req.user!.userId);
    res.json({ products });
  } catch (err) {
    next(err);
  }
});

// PATCH /mitra/products/:id - Update own product
mitraRouter.patch('/products/:id', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateMitraProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const product = await updateMitraProduct(req.user!.userId, req.params.id, parsed.data);
    res.json({ product });
  } catch (err) {
    if (err instanceof MitraProductError) {
      res.status(404).json({ error: err.message, code: err.code });
      return;
    }
    next(err);
  }
});

// DELETE /mitra/products/:id - Soft-delete own product
mitraRouter.delete('/products/:id', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteMitraProduct(req.user!.userId, req.params.id);
    res.status(204).end();
  } catch (err) {
    if (err instanceof MitraProductError) {
      res.status(404).json({ error: err.message, code: err.code });
      return;
    }
    next(err);
  }
});
```

- [ ] **Step 4: Add frontend API client functions**

Edit `src/lib/api/mitra.ts`, append:

```typescript
import type { ProductData } from './products';

export async function fetchMitraProducts(): Promise<{ products: ProductData[] }> {
  return apiFetch<{ products: ProductData[] }>('/mitra/products', { auth: true });
}

export async function updateMitraProduct(id: string, data: Partial<{
  name: string;
  description: string | null;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
  imageUrl: string | null;
  storeName: string;
  storeAddress: string | null;
  expiresAt: string;
  isActive: boolean;
}>): Promise<{ product: ProductData }> {
  return apiFetch<{ product: ProductData }>(`/mitra/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function deleteMitraProduct(id: string): Promise<void> {
  await apiFetch(`/mitra/products/${id}`, { method: 'DELETE', auth: true });
}
```

- [ ] **Step 5: Create edit product page**

Create `src/app/seller/edit/[id]/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, Upload, X, Loader2, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateMitraProduct, fetchMitraProducts } from '@/lib/api/mitra';
import { uploadImage } from '@/lib/api/products';
import type { ProductData } from '@/lib/api/products';

const CATEGORIES = [
  { value: 'meals', label: 'Makanan' },
  { value: 'bakery', label: 'Roti & Kue' },
  { value: 'drinks', label: 'Minuman' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('meals');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [stock, setStock] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMitraProducts()
      .then((res) => {
        const found = res.products.find((p) => p.id === productId);
        if (found) {
          setProduct(found);
          setName(found.name);
          setDescription(found.description || '');
          setCategory(found.category);
          setOriginalPrice(String(found.originalPrice));
          setDiscountedPrice(String(found.discountedPrice));
          setStock(String(found.stock));
          setStoreName(found.storeName);
          setStoreAddress(found.storeAddress || '');
          setExpiresAt(found.expiresAt.slice(0, 16));
          if (found.imageUrl) setImagePreview(found.imageUrl);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let imageUrl = product?.imageUrl || null;
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      await updateMitraProduct(productId, {
        name,
        description: description || null,
        category,
        originalPrice: parseInt(originalPrice),
        discountedPrice: parseInt(discountedPrice),
        stock: parseInt(stock),
        imageUrl,
        storeName,
        storeAddress: storeAddress || null,
        expiresAt: new Date(expiresAt).toISOString(),
      });

      router.push('/seller');
    } catch (err: any) {
      setError(err.message || 'Gagal mengupdate produk');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="size-full flex flex-col items-center justify-center bg-[var(--background)] gap-3">
        <p className="text-gray-500">Produk tidak ditemukan</p>
        <button onClick={() => router.push('/seller')} className="text-sm text-[var(--primary)] font-medium">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/seller')} className="p-1 -ml-1 hover:bg-white/20 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Edit Produk</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Produk</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full min-w-0 rounded-md border border-input bg-input-background px-3 py-1 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Harga Normal (Rp)</label>
              <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Harga Diskon (Rp)</label>
              <Input type="number" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Jumlah Stok</label>
            <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama Toko</label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Alamat Toko</label>
            <Input value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Batas Waktu Pengambilan</label>
            <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi Produk</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Foto Produk</label>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(product?.imageUrl || null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-2xl px-4 py-8 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 transition-colors">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm">Ketuk untuk mengganti foto</span>
              </button>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-[var(--primary)] text-white font-semibold py-4 rounded-2xl hover:bg-[var(--primary)]/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="w-5 h-5" /> Simpan Perubahan</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Write mitra product tests**

Create `backend/tests/mitra/products.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('Mitra Products API', () => {
  let mitraAccessToken: string;
  let mitraUserId: string;
  let productId: string;

  beforeEach(async () => {
    const mitraUser = await prisma.user.create({
      data: {
        email: 'mitra-products@example.com',
        name: 'Mitra Products',
        passwordHash: 'hash',
        role: 'MITRA',
        isVerified: true,
        mitraProfile: {
          create: {
            storeName: 'Toko Mitra',
            verificationStatus: 'VERIFIED',
          },
        },
      },
    });
    mitraUserId = mitraUser.id;
    mitraAccessToken = signAccessToken({ userId: mitraUser.id, email: mitraUser.email });

    const product = await prisma.product.create({
      data: {
        name: 'Roti Coklat',
        category: 'bakery',
        originalPrice: 10000,
        discountedPrice: 5000,
        stock: 8,
        storeName: 'Toko Mitra',
        expiresAt: new Date(Date.now() + 86400000),
        mitraId: mitraUserId,
      },
    });
    productId = product.id;
  });

  describe('GET /mitra/products', () => {
    it('should list own products', async () => {
      const res = await request(app)
        .get('/mitra/products')
        .set('Authorization', `Bearer ${mitraAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toBe('Roti Coklat');
    });

    it('should not show other mitra products', async () => {
      // Create another mitra with their own product
      const otherUser = await prisma.user.create({
        data: {
          email: 'other-mitra@example.com',
          name: 'Other Mitra',
          passwordHash: 'hash',
          role: 'MITRA',
          isVerified: true,
          mitraProfile: {
            create: { storeName: 'Other Store', verificationStatus: 'VERIFIED' },
          },
        },
      });
      await prisma.product.create({
        data: {
          name: 'Other Product',
          category: 'meals',
          originalPrice: 20000,
          discountedPrice: 10000,
          stock: 3,
          storeName: 'Other Store',
          expiresAt: new Date(Date.now() + 86400000),
          mitraId: otherUser.id,
        },
      });

      const res = await request(app)
        .get('/mitra/products')
        .set('Authorization', `Bearer ${mitraAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toBe('Roti Coklat');
    });
  });

  describe('PATCH /mitra/products/:id', () => {
    it('should update own product', async () => {
      const res = await request(app)
        .patch(`/mitra/products/${productId}`)
        .set('Authorization', `Bearer ${mitraAccessToken}`)
        .send({ name: 'Roti Coklat Spesial', stock: 15 });

      expect(res.status).toBe(200);
      expect(res.body.product.name).toBe('Roti Coklat Spesial');
      expect(res.body.product.stock).toBe(15);
    });

    it('should reject updating other mitra product', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other2@example.com',
          name: 'Other2',
          passwordHash: 'hash',
          role: 'MITRA',
          isVerified: true,
          mitraProfile: {
            create: { storeName: 'S2', verificationStatus: 'VERIFIED' },
          },
        },
      });
      const otherProduct = await prisma.product.create({
        data: {
          name: 'Other P',
          category: 'meals',
          originalPrice: 20000,
          discountedPrice: 10000,
          stock: 3,
          storeName: 'S2',
          expiresAt: new Date(Date.now() + 86400000),
          mitraId: otherUser.id,
        },
      });

      const res = await request(app)
        .patch(`/mitra/products/${otherProduct.id}`)
        .set('Authorization', `Bearer ${mitraAccessToken}`)
        .send({ name: 'Hacked!' });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('DELETE /mitra/products/:id', () => {
    it('should soft-delete own product', async () => {
      const res = await request(app)
        .delete(`/mitra/products/${productId}`)
        .set('Authorization', `Bearer ${mitraAccessToken}`);

      expect(res.status).toBe(204);

      const product = await prisma.product.findUnique({ where: { id: productId } });
      expect(product!.isActive).toBe(false);
    });

    it('should reject deleting other mitra product', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other3@example.com',
          name: 'Other3',
          passwordHash: 'hash',
          role: 'MITRA',
          isVerified: true,
          mitraProfile: {
            create: { storeName: 'S3', verificationStatus: 'VERIFIED' },
          },
        },
      });
      const otherProduct = await prisma.product.create({
        data: {
          name: 'Other P2',
          category: 'meals',
          originalPrice: 20000,
          discountedPrice: 10000,
          stock: 3,
          storeName: 'S3',
          expiresAt: new Date(Date.now() + 86400000),
          mitraId: otherUser.id,
        },
      });

      const res = await request(app)
        .delete(`/mitra/products/${otherProduct.id}`)
        .set('Authorization', `Bearer ${mitraAccessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
```

- [ ] **Step 7: Run all tests to verify**

Run: `npx vitest run --config backend/vitest.config.ts`
Expected: ALL tests pass (including new mitra product tests)

- [ ] **Step 8: Commit**

```bash
git add backend/src/services/mitraProductService.ts backend/src/routes/mitra.ts backend/src/validators/mitra.ts src/lib/api/mitra.ts src/app/seller/edit/ backend/tests/mitra/products.test.ts
git commit -m "feat(m4): add mitra product CRUD (PATCH/DELETE) and edit product page"
```

---

### Task 3: Stats Aggregation + Dashboard Rebuild

**Type:** `AFK`
**Blocked by:** Task 1 (Task 2 also completed for product list)

**Files:**
- Create: `backend/src/services/mitraStatsService.ts` -- getMitraStats
- Modify: `backend/src/routes/mitra.ts` -- Add GET /stats
- Modify: `backend/src/types/index.ts` -- MitraStatsResponse already added in Task 1
- Modify: `src/lib/api/mitra.ts` -- Add fetchMitraStats
- Modify: `src/app/seller/page.tsx` -- Complete rebuild with real API data
- Create: `src/components/DashboardStatCards.tsx` -- Stats display component
- Create: `src/components/ProductManagementList.tsx` -- Product list with actions
- Create: `backend/tests/mitra/stats.test.ts` -- Stats tests

- [ ] **Step 1: Create mitraStatsService**

Create `backend/src/services/mitraStatsService.ts`:

```typescript
import { prisma } from '../lib/prisma.js';
import type { MitraStatsResponse } from '../types/index.js';

export async function getMitraStats(mitraId: string): Promise<MitraStatsResponse> {
  const products = await prisma.product.findMany({
    where: { mitraId },
    select: { stock: true, id: true },
  });

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const productCount = products.length;

  const productIds = products.map((p) => p.id);

  // Count sold items from completed orders containing this mitra's products
  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: productIds },
      order: { status: { in: ['PICKED_UP', 'READY'] } },
    },
    select: { quantity: true },
  });

  const totalSold = orderItems.reduce((sum, i) => sum + i.quantity, 0);
  const remaining = totalStock - totalSold;

  // Count active orders (not picked up or cancelled) for this mitra
  const activeOrders = await prisma.order.count({
    where: {
      status: { in: ['PENDING', 'PROCESSED', 'READY'] },
      storeName: { in: [...new Set(products.map(p => p.storeName || '').filter(Boolean))] },
    },
  });

  return {
    totalStock: Math.max(0, totalStock),
    totalSold,
    remaining: Math.max(0, remaining),
    productCount,
    activeOrders,
  };
}
```

Wait -- the activeOrders query uses `storeName` to match, which could be ambiguous. Let's fix this by using the product ids instead:

Actually, mitraId is on the Product, but Order doesn't have mitraId. Order has storeName and items with productId. To find orders for a mitra, we need to find orders containing products owned by that mitra.

Let me use a better approach:

```typescript
import { prisma } from '../lib/prisma.js';
import type { MitraStatsResponse } from '../types/index.js';

export async function getMitraStats(mitraId: string): Promise<MitraStatsResponse> {
  const products = await prisma.product.findMany({
    where: { mitraId },
    select: { stock: true, id: true },
  });

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const productCount = products.length;
  const productIds = products.map((p) => p.id);

  // Count sold items from orders containing this mitra's products
  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: productIds },
      order: { status: { in: ['PICKED_UP', 'READY'] } },
    },
    select: { quantity: true },
  });

  const totalSold = orderItems.reduce((sum, i) => sum + i.quantity, 0);
  const remaining = totalStock - totalSold;

  // Count active orders containing this mitra's products
  const activeOrders = await prisma.order.count({
    where: {
      status: { in: ['PENDING', 'PROCESSED', 'READY'] },
      items: { some: { productId: { in: productIds } } },
    },
  });

  return {
    totalStock: Math.max(0, totalStock),
    totalSold,
    remaining: Math.max(0, remaining),
    productCount,
    activeOrders,
  };
}
```

- [ ] **Step 2: Add stats route**

Edit `backend/src/routes/mitra.ts`, add import:

```typescript
import { getMitraStats } from '../services/mitraStatsService.js';
```

Add route after the product routes (before closing `});`):

```typescript
// GET /mitra/stats - Get mitra stats (stock, sold, remaining, active orders)
mitraRouter.get('/stats', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getMitraStats(req.user!.userId);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 3: Add frontend API client**

Edit `src/lib/api/mitra.ts`, append:

```typescript
export interface MitraStats {
  totalStock: number;
  totalSold: number;
  remaining: number;
  productCount: number;
  activeOrders: number;
}

export async function fetchMitraStats(): Promise<{ stats: MitraStats }> {
  return apiFetch<{ stats: MitraStats }>('/mitra/stats', { auth: true });
}
```

- [ ] **Step 4: Create DashboardStatCards component**

Create `src/components/DashboardStatCards.tsx`:

```tsx
import type { MitraStats } from '@/lib/api/mitra';

interface Props {
  stats: MitraStats;
}

export default function DashboardStatCards({ stats }: Props) {
  const cards = [
    { label: 'Stok Produk', value: stats.totalStock, color: 'text-[var(--primary)]' },
    { label: 'Terjual', value: stats.totalSold, color: 'text-[var(--secondary)]' },
    { label: 'Sisa', value: stats.remaining, color: 'text-[var(--destructive)]' },
  ];

  return (
    <div className="flex gap-3">
      {cards.map((card) => (
        <div key={card.label} className="flex-1 bg-white rounded-2xl shadow-sm px-4 py-5 text-center">
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          <p className="text-xs text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create ProductManagementList component**

Create `src/components/ProductManagementList.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Package, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { ProductData } from '@/lib/api/products';
import { deleteMitraProduct } from '@/lib/api/mitra';
import { getImageUrl } from '@/lib/api/products';

interface Props {
  products: ProductData[];
  onProductDeleted: () => void;
}

export default function ProductManagementList({ products, onProductDeleted }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus "${name}" dari daftar produk? Produk tidak akan muncul di pencarian Food Saver.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteMitraProduct(id);
      onProductDeleted();
    } catch {
      alert('Gagal menghapus produk');
    } finally {
      setDeletingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Belum ada produk</p>
        <p className="text-gray-400 text-xs mt-1">Tambahkan produk baru untuk mulai berjualan</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-2xl shadow-sm px-4 py-4">
          <div className="flex items-start gap-3">
            {product.imageUrl ? (
              <img src={getImageUrl(product.imageUrl)!} alt={product.name}
                className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-[var(--primary)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Stok: {product.stock} | Rp{product.discountedPrice.toLocaleString('id-ID')}
              </p>
              {!product.isActive && (
                <span className="text-xs text-[var(--destructive)] mt-1 inline-block">
                  Nonaktif
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => router.push(`/seller/edit/${product.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(product.id, product.name)}
              disabled={deletingId === product.id}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deletingId === product.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Rebuild Seller Dashboard page with real API**

Edit `src/app/seller/page.tsx` -- complete replacement:

```tsx
'use client';

import { ArrowLeft, Store, Package, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { fetchMitraProfile, fetchMitraStats, fetchMitraProducts, type MitraProfile, type MitraStats } from '@/lib/api/mitra';
import type { ProductData } from '@/lib/api/products';
import DashboardStatCards from '@/components/DashboardStatCards';
import ProductManagementList from '@/components/ProductManagementList';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<MitraProfile | null>(null);
  const [stats, setStats] = useState<MitraStats | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  const isMitra = user?.role === 'MITRA';

  const loadData = async () => {
    try {
      const [profileRes, statsRes, productsRes] = await Promise.all([
        fetchMitraProfile().catch(() => null),
        fetchMitraStats().catch(() => null),
        fetchMitraProducts().catch(() => ({ products: [] as ProductData[] })),
      ]);
      setProfile(profileRes?.profile ?? null);
      setStats(statsRes?.stats ?? null);
      setProducts(productsRes.products);
    } catch {
      // User not mitra
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isMitra]);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Food Saver view -- not yet registered as Mitra
  if (!isMitra || !profile) {
    return (
      <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
        <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/profile')} className="p-1.5 -ml-1.5 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center text-white" aria-label="Kembali ke Mode Pembeli">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-base font-bold text-center">Dashboard Mitra</h1>
            <Store className="w-5 h-5 text-white/80" />
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
          <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
            <Store className="w-10 h-10 text-[var(--primary)]" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Jadi Mitra LastBite</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs">
            Daftarkan toko kamu dan mulai jual Makanan Surplus tanpa biaya platform. Bantu kurangi food waste sambil tambah penghasilan.
          </p>
          <button
            onClick={() => router.push('/seller/register')}
            className="bg-[var(--primary)] text-white font-semibold px-8 py-3 rounded-2xl hover:bg-[var(--primary)]/90 transition-colors shadow-sm"
          >
            Daftar Sebagai Mitra
          </button>
        </div>
      </div>
    );
  }

  // Mitra view -- full dashboard
  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      {/* Header */}
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/profile')} className="p-1.5 -ml-1.5 hover:bg-white/20 rounded-xl transition-all flex items-center justify-center text-white" aria-label="Kembali ke Mode Pembeli">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-base font-bold text-center">{profile.storeName}</h1>
          <Store className="w-5 h-5 text-white/80" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28 space-y-6">
        {/* Stats */}
        {stats && (
          <section>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Ringkasan Hari Ini
            </h2>
            <DashboardStatCards stats={stats} />
            {stats.activeOrders > 0 && (
              <button
                onClick={() => router.push('/seller/orders')}
                className="mt-3 w-full bg-[var(--secondary)]/10 text-[var(--secondary)] font-medium text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--secondary)]/20 transition-colors"
              >
                <Package className="w-4 h-4" />
                {stats.activeOrders} Pesanan Masuk
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </section>
        )}

        {/* Platform Info */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Mitra LastBite</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Kamu tidak dikenakan biaya platform.
                <br />Biaya layanan ditanggung sepenuhnya oleh LastBite
                sebagai bentuk dukungan untuk mitra mengurangi food waste.
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Produk ({stats?.productCount ?? products.length})
            </h2>
            <button
              onClick={() => router.push('/seller/add')}
              className="text-xs font-medium text-[var(--primary)] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah
            </button>
          </div>
          <ProductManagementList products={products} onProductDeleted={loadData} />
        </section>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/seller/add')}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--primary)]/90 transition-colors z-50"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}
```

Note: This replaces the entire static-data + localStorage `/seller/page.tsx`. The `useAuth` import accesses the AuthContext providing `user.role`.

- [ ] **Step 7: Write stats tests**

Create `backend/tests/mitra/stats.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('GET /mitra/stats', () => {
  let mitraAccessToken: string;
  let mitraUserId: string;
  let productId: string;

  beforeEach(async () => {
    const mitraUser = await prisma.user.create({
      data: {
        email: 'mitra-stats@example.com',
        name: 'Mitra Stats',
        passwordHash: 'hash',
        role: 'MITRA',
        isVerified: true,
        mitraProfile: {
          create: {
            storeName: 'Toko Statistik',
            verificationStatus: 'VERIFIED',
          },
        },
      },
    });
    mitraUserId = mitraUser.id;
    mitraAccessToken = signAccessToken({ userId: mitraUser.id, email: mitraUser.email });

    const product = await prisma.product.create({
      data: {
        name: 'Stat Product',
        category: 'meals',
        originalPrice: 20000,
        discountedPrice: 10000,
        stock: 10,
        storeName: 'Toko Statistik',
        expiresAt: new Date(Date.now() + 86400000),
        mitraId: mitraUserId,
      },
    });
    productId = product.id;
  });

  it('should return stats for mitra', async () => {
    const res = await request(app)
      .get('/mitra/stats')
      .set('Authorization', `Bearer ${mitraAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalStock).toBe(10);
    expect(res.body.stats.productCount).toBe(1);
    expect(res.body.stats.totalSold).toBe(0);
    expect(res.body.stats.remaining).toBe(10);
    expect(res.body.stats.activeOrders).toBe(0);
  });

  it('should count sold items correctly', async () => {
    // Create an order that includes this product
    const fsUser = await prisma.user.create({
      data: {
        email: 'fs-stats@example.com',
        name: 'FS Stats',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });

    await prisma.order.create({
      data: {
        userId: fsUser.id,
        storeName: 'Toko Statistik',
        status: 'PICKED_UP',
        pickupCode: 'STAT-0001',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 20000,
        savingAmount: 20000,
        buyerName: 'Stats Buyer',
        buyerPhone: '08000000',
        items: {
          create: {
            productId,
            name: 'Stat Product',
            storeName: 'Toko Statistik',
            price: 10000,
            originalPrice: 20000,
            quantity: 3,
          },
        },
      },
    });

    const res = await request(app)
      .get('/mitra/stats')
      .set('Authorization', `Bearer ${mitraAccessToken}`);

    expect(res.body.stats.totalSold).toBe(3);
    expect(res.body.stats.remaining).toBe(7);
  });

  it('should count active orders', async () => {
    const fsUser = await prisma.user.create({
      data: {
        email: 'fs-active@example.com',
        name: 'FS Active',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });

    await prisma.order.create({
      data: {
        userId: fsUser.id,
        storeName: 'Toko Statistik',
        status: 'PENDING',
        pickupCode: 'ACTV-0001',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 20000,
        savingAmount: 20000,
        buyerName: 'Active Buyer',
        buyerPhone: '08000001',
        items: {
          create: {
            productId,
            name: 'Stat Product',
            storeName: 'Toko Statistik',
            price: 10000,
            originalPrice: 20000,
            quantity: 1,
          },
        },
      },
    });

    const res = await request(app)
      .get('/mitra/stats')
      .set('Authorization', `Bearer ${mitraAccessToken}`);

    expect(res.body.stats.activeOrders).toBe(1);
  });
});
```

- [ ] **Step 8: Run all tests to verify**

Run: `npx vitest run --config backend/vitest.config.ts`
Expected: ALL tests pass (existing + new stats tests)

- [ ] **Step 9: Commit**

```bash
git add backend/src/services/mitraStatsService.ts backend/src/routes/mitra.ts src/lib/api/mitra.ts src/components/DashboardStatCards.tsx src/components/ProductManagementList.tsx src/app/seller/page.tsx backend/tests/mitra/stats.test.ts
git commit -m "feat(m4): add mitra stats API and rebuild seller dashboard with real data"
```

---

### Task 4: Mitra Orders Management

**Type:** `AFK`
**Blocked by:** Task 1

**Files:**
- Create: `backend/src/services/mitraOrderService.ts` -- getStoreOrders, updateOrderStatus
- Modify: `backend/src/routes/mitra.ts` -- Add GET /orders, PATCH /orders/:id/status
- Create: `backend/src/validators/mitra.ts` -- Add updateOrderStatusSchema
- Modify: `src/lib/api/mitra.ts` -- Add fetchMitraOrders, updateMitraOrderStatus
- Create: `src/app/seller/orders/page.tsx` -- Incoming orders management page
- Create: `src/components/OrderStatusBadge.tsx` -- Order status display component
- Create: `backend/tests/mitra/orders.test.ts` -- Mitra order tests

- [ ] **Step 1: Create mitraOrderService**

Create `backend/src/services/mitraOrderService.ts`:

```typescript
import { prisma } from '../lib/prisma.js';
import type { OrderStatus } from '@prisma/client';

export class MitraOrderError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'MitraOrderError';
  }
}

interface MitraOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface MitraOrder {
  id: string;
  status: string;
  pickupCode: string;
  pickupExpiresAt: string;
  totalAmount: number;
  savingAmount: number;
  buyerName: string;
  buyerPhone: string;
  notes: string | null;
  items: MitraOrderItem[];
  createdAt: string;
}

function toISO(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function toOrderResponse(order: any): MitraOrder {
  return {
    id: order.id,
    status: order.status,
    pickupCode: order.pickupCode,
    pickupExpiresAt: toISO(order.pickupExpiresAt),
    totalAmount: order.totalAmount,
    savingAmount: order.savingAmount,
    buyerName: order.buyerName,
    buyerPhone: order.buyerPhone,
    notes: order.notes,
    items: order.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
    })),
    createdAt: toISO(order.createdAt),
  };
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PROCESSED', 'CANCELLED'],
  PROCESSED: ['READY', 'CANCELLED'],
  READY: ['PICKED_UP', 'CANCELLED'],
};

export async function getStoreOrders(mitraId: string): Promise<MitraOrder[]> {
  // Find products owned by this mitra
  const mitraProducts = await prisma.product.findMany({
    where: { mitraId },
    select: { id: true },
  });
  const productIds = mitraProducts.map((p) => p.id);

  if (productIds.length === 0) {
    return [];
  }

  const orders = await prisma.order.findMany({
    where: {
      items: { some: { productId: { in: productIds } } },
    },
    include: {
      items: {
        select: {
          id: true,
          productId: true,
          name: true,
          price: true,
          quantity: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(toOrderResponse);
}

export async function updateOrderStatus(
  mitraId: string,
  orderId: string,
  newStatus: string
): Promise<MitraOrder> {
  // Verify order contains this mitra's products
  const mitraProducts = await prisma.product.findMany({
    where: { mitraId },
    select: { id: true },
  });
  const productIds = mitraProducts.map((p) => p.id);

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      items: { some: { productId: { in: productIds } } },
    },
    include: { items: { select: { id: true, productId: true, name: true, price: true, quantity: true, imageUrl: true } } },
  });

  if (!order) {
    throw new MitraOrderError('Pesanan tidak ditemukan', 'ORDER_NOT_FOUND');
  }

  // Validate state transition
  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new MitraOrderError(
      `Tidak dapat mengubah status dari ${order.status} ke ${newStatus}`,
      'INVALID_TRANSITION'
    );
  }

  // Handle cancellation -- restore stock
  if (newStatus === 'CANCELLED') {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      for (const item of order.items) {
        await tx.product.updateMany({
          where: { id: item.productId, mitraId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });

    const updated = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { select: { id: true, name: true, price: true, quantity: true, imageUrl: true } } },
    });
    return toOrderResponse(updated!);
  }

  // Simple status update
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus as OrderStatus },
    include: { items: { select: { id: true, name: true, price: true, quantity: true, imageUrl: true } } },
  });

  return toOrderResponse(updated);
}
```

- [ ] **Step 2: Add validator**

Edit `backend/src/validators/mitra.ts`, append:

```typescript
export const updateOrderStatusSchema = z.object({
  status: z.enum(['PROCESSED', 'READY', 'PICKED_UP', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status tidak valid' }),
  }),
});
```

- [ ] **Step 3: Add order routes**

Edit `backend/src/routes/mitra.ts`, add imports:

```typescript
import { getStoreOrders, updateOrderStatus, MitraOrderError } from '../services/mitraOrderService.js';
import { updateOrderStatusSchema } from '../validators/mitra.js';
```

Add routes before closing `});`:

```typescript
// GET /mitra/orders - List incoming orders for mitra's products
mitraRouter.get('/orders', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await getStoreOrders(req.user!.userId);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// PATCH /mitra/orders/:id/status - Update order status
mitraRouter.patch('/orders/:id/status', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateOrderStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const order = await updateOrderStatus(req.user!.userId, req.params.id, parsed.data.status);
    res.json({ order });
  } catch (err) {
    if (err instanceof MitraOrderError) {
      const status = err.code === 'INVALID_TRANSITION' ? 400 : 404;
      res.status(status).json({ error: err.message, code: err.code });
      return;
    }
    next(err);
  }
});
```

- [ ] **Step 4: Add frontend API client**

Edit `src/lib/api/mitra.ts`, append:

```typescript
export interface MitraOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface MitraOrder {
  id: string;
  status: string;
  pickupCode: string;
  pickupExpiresAt: string;
  totalAmount: number;
  savingAmount: number;
  buyerName: string;
  buyerPhone: string;
  notes: string | null;
  items: MitraOrderItem[];
  createdAt: string;
}

export async function fetchMitraOrders(): Promise<{ orders: MitraOrder[] }> {
  return apiFetch<{ orders: MitraOrder[] }>('/mitra/orders', { auth: true });
}

export async function updateMitraOrderStatus(orderId: string, status: string): Promise<{ order: MitraOrder }> {
  return apiFetch<{ order: MitraOrder }>(`/mitra/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    auth: true,
  });
}
```

- [ ] **Step 5: Create OrderStatusBadge component**

Create `src/components/OrderStatusBadge.tsx`:

```tsx
interface Props {
  status: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'Menunggu', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  PROCESSED: { label: 'Diproses', bg: 'bg-blue-100', text: 'text-blue-800' },
  READY: { label: 'Siap Diambil', bg: 'bg-green-100', text: 'text-green-800' },
  PICKED_UP: { label: 'Sudah Diambil', bg: 'bg-gray-100', text: 'text-gray-800' },
  CANCELLED: { label: 'Dibatalkan', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function OrderStatusBadge({ status }: Props) {
  const info = STATUS_MAP[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${info.bg} ${info.text}`}>
      {info.label}
    </span>
  );
}
```

- [ ] **Step 6: Create orders page**

Create `src/app/seller/orders/page.tsx`:

```tsx
'use client';

import { ArrowLeft, Package, Clock, Loader2, MapPin, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchMitraOrders, updateMitraOrderStatus, type MitraOrder } from '@/lib/api/mitra';
import OrderStatusBadge from '@/components/OrderStatusBadge';

const NEXT_STATUS_MAP: Record<string, { label: string; next: string }> = {
  PENDING: { label: 'Proses Pesanan', next: 'PROCESSED' },
  PROCESSED: { label: 'Tandai Siap Diambil', next: 'READY' },
  READY: { label: 'Konfirmasi Sudah Diambil', next: 'PICKED_UP' },
};

export default function MitraOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<MitraOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetchMitraOrders();
      setOrders(res.orders);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setActioningId(orderId);
    try {
      await updateMitraOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal update status');
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Batalkan pesanan ini? Stok produk akan dikembalikan.')) return;
    setActioningId(orderId);
    try {
      await updateMitraOrderStatus(orderId, 'CANCELLED');
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan pesanan');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status !== 'PICKED_UP' && o.status !== 'CANCELLED');
  const completedOrders = orders.filter((o) => o.status === 'PICKED_UP' || o.status === 'CANCELLED');

  return (
    <div className="size-full flex flex-col bg-[var(--background)] overflow-hidden relative max-w-md mx-auto min-h-[100dvh] shadow-xl">
      <header className="bg-[var(--primary)] text-white px-4 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/seller')} className="p-1 -ml-1 hover:bg-white/20 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Pesanan Masuk</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 space-y-6">
        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Belum ada pesanan</p>
          </div>
        )}

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Perlu Tindakan ({pendingOrders.length})
            </h2>
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actioningId={actioningId}
                  onStatusUpdate={handleStatusUpdate}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Riwayat ({completedOrders.length})
            </h2>
            <div className="space-y-3">
              {completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actioningId={null}
                  onStatusUpdate={() => {}}
                  onCancel={() => {}}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  actioningId,
  onStatusUpdate,
  onCancel,
}: {
  order: MitraOrder;
  actioningId: string | null;
  onStatusUpdate: (id: string, status: string) => void;
  onCancel: (id: string) => void;
}) {
  const nextAction = NEXT_STATUS_MAP[order.status];
  const isActioning = actioningId === order.id;
  const isCompleted = order.status === 'PICKED_UP' || order.status === 'CANCELLED';

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400">Kode Pickup</p>
          <p className="font-mono font-bold text-sm text-[var(--primary)]">{order.pickupCode}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-700">{item.quantity}x {item.name}</span>
            <span className="text-gray-500">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
        <span className="text-gray-500">Total</span>
        <span className="font-semibold text-gray-800">Rp{order.totalAmount.toLocaleString('id-ID')}</span>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3 h-3" />
          {order.buyerName} &middot; {order.buyerPhone}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Batas ambil: {new Date(order.pickupExpiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
        {order.notes && (
          <div className="flex items-start gap-1.5">
            <span className="text-gray-300">Note:</span>
            <span>{order.notes}</span>
          </div>
        )}
      </div>

      {!isCompleted && (
        <div className="flex gap-2 pt-1">
          {nextAction && (
            <button
              onClick={() => onStatusUpdate(order.id, nextAction.next)}
              disabled={isActioning}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
            >
              {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {nextAction.label}
            </button>
          )}
          <button
            onClick={() => onCancel(order.id)}
            disabled={isActioning}
            className="flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isActioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Batalkan
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Write mitra order tests**

Create `backend/tests/mitra/orders.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('Mitra Orders API', () => {
  let mitraAccessToken: string;
  let mitraUserId: string;
  let productId: string;
  let orderId: string;

  beforeEach(async () => {
    // Create mitra
    const mitraUser = await prisma.user.create({
      data: {
        email: 'mitra-ord@example.com',
        name: 'Mitra Order',
        passwordHash: 'hash',
        role: 'MITRA',
        isVerified: true,
        mitraProfile: {
          create: {
            storeName: 'Toko Order',
            verificationStatus: 'VERIFIED',
          },
        },
      },
    });
    mitraUserId = mitraUser.id;
    mitraAccessToken = signAccessToken({ userId: mitraUser.id, email: mitraUser.email });

    // Create product
    const product = await prisma.product.create({
      data: {
        name: 'Order Test Product',
        category: 'meals',
        originalPrice: 20000,
        discountedPrice: 10000,
        stock: 10,
        storeName: 'Toko Order',
        expiresAt: new Date(Date.now() + 86400000),
        mitraId: mitraUserId,
      },
    });
    productId = product.id;

    // Create food saver + order
    const fsUser = await prisma.user.create({
      data: {
        email: 'fs-ord@example.com',
        name: 'FS Order',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: fsUser.id,
        storeName: 'Toko Order',
        status: 'PENDING',
        pickupCode: 'MIT-0001',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 20000,
        savingAmount: 20000,
        buyerName: 'Budi',
        buyerPhone: '08123456789',
        items: {
          create: {
            productId,
            name: 'Order Test Product',
            storeName: 'Toko Order',
            price: 10000,
            originalPrice: 20000,
            quantity: 2,
          },
        },
      },
      include: { items: true },
    });
    orderId = order.id;
  });

  describe('GET /mitra/orders', () => {
    it('should list orders containing mitra products', async () => {
      const res = await request(app)
        .get('/mitra/orders')
        .set('Authorization', `Bearer ${mitraAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
      expect(res.body.orders[0].buyerName).toBe('Budi');
      expect(res.body.orders[0].status).toBe('PENDING');
      expect(res.body.orders[0].items).toHaveLength(1);
    });

    it('should not show orders from other stores', async () => {
      const otherMitra = await prisma.user.create({
        data: {
          email: 'other-ord@example.com',
          name: 'Other',
          passwordHash: 'hash',
          role: 'MITRA',
          isVerified: true,
          mitraProfile: { create: { storeName: 'Other', verificationStatus: 'VERIFIED' } },
        },
      });
      const otherProduct = await prisma.product.create({
        data: {
          name: 'Other P',
          category: 'meals',
          originalPrice: 10000,
          discountedPrice: 5000,
          stock: 3,
          storeName: 'Other',
          expiresAt: new Date(Date.now() + 86400000),
          mitraId: otherMitra.id,
        },
      });
      const fsUser = await prisma.user.create({
        data: { email: 'fs2@example.com', name: 'FS2', passwordHash: 'hash', role: 'FOOD_SAVER', isVerified: true },
      });
      await prisma.order.create({
        data: {
          userId: fsUser.id,
          storeName: 'Other',
          status: 'PENDING',
          pickupCode: 'OTH-0001',
          pickupExpiresAt: new Date(Date.now() + 7200000),
          totalAmount: 5000,
          savingAmount: 5000,
          buyerName: 'Other Buyer',
          buyerPhone: '08000000',
          items: { create: { productId: otherProduct.id, name: 'Other P', storeName: 'Other', price: 5000, originalPrice: 10000, quantity: 1 } },
        },
      });

      const res = await request(app)
        .get('/mitra/orders')
        .set('Authorization', `Bearer ${mitraAccessToken}`);

      expect(res.body.orders).toHaveLength(1);
      expect(res.body.orders[0].buyerName).toBe('Budi');
    });
  });

  describe('PATCH /mitra/orders/:id/status', () => {
    it('should update from PENDING to PROCESSED', async () => {
      const res = await request(app)
        .patch(`/mitra/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${mitraAccessToken}`)
        .send({ status: 'PROCESSED' });

      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe('PROCESSED');
    });

    it('should reject invalid transition', async () => {
      const res = await request(app)
        .patch(`/mitra/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${mitraAccessToken}`)
        .send({ status: 'PICKED_UP' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_TRANSITION');
    });

    it('should cancel order and restore stock', async () => {
      const res = await request(app)
        .patch(`/mitra/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${mitraAccessToken}`)
        .send({ status: 'CANCELLED' });

      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe('CANCELLED');

      const product = await prisma.product.findUnique({ where: { id: productId } });
      expect(product!.stock).toBe(12); // 10 + 2 restored
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .patch(`/mitra/orders/${orderId}/status`)
        .send({ status: 'PROCESSED' });

      expect(res.status).toBe(401);
    });
  });
});
```

- [ ] **Step 8: Run all tests to verify**

Run: `npx vitest run --config backend/vitest.config.ts`
Expected: ALL tests pass (existing + new mitra order tests)

- [ ] **Step 9: Commit**

```bash
git add backend/src/services/mitraOrderService.ts backend/src/routes/mitra.ts backend/src/validators/mitra.ts src/lib/api/mitra.ts src/components/OrderStatusBadge.tsx src/app/seller/orders/ backend/tests/mitra/orders.test.ts
git commit -m "feat(m4): add mitra orders management API and incoming orders page"
```

---

## Verification Checklist

Before declaring M4 complete, run these commands:

```bash
# 1. TypeScript compilation -- zero errors
npx tsc --noEmit --project backend/tsconfig.json

# 2. All backend tests pass
npx vitest run --config backend/vitest.config.ts

# 3. API can be started
# (manual: npm run dev in backend/, then curl http://localhost:4000/health)

# 4. Prisma schema is in sync
npx prisma migrate status
```

---

## M4 Deliverable Checklist

| Requirement | Task | Status |
|---|---|---|
| Mitra can register via onboarding flow | Task 1 | Implemented |
| Mitra profile (store details, verification status) | Task 1 | Implemented |
| Mitra can list own products | Task 2 | Implemented |
| Mitra can edit own products | Task 2 | Implemented |
| Mitra can delete (soft-delete) own products | Task 2 | Implemented |
| Mitra dashboard with stats (stock/sold/remaining) | Task 3 | Implemented |
| Mitra sees incoming orders for their products | Task 4 | Implemented |
| Mitra can update order status (PENDING->PROCESSED->READY) | Task 4 | Implemented |
| Mitra can cancel orders (stock restored) | Task 4 | Implemented |
| JWT auth protects all mitra endpoints | All tasks | Implemented |
| State machine enforces valid order transitions | Task 4 | Implemented |
| Frontend uses real API, not static data | Tasks 1-4 | Implemented |
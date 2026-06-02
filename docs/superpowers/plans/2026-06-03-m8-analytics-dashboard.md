# M8: Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development, superpowers:dispatching-parallel-agents, or superpowers:executing-plans. See the Task Grouping section for parallel vs sequential execution strategy.

**Goal:** Mitra dapat menganalisis performa penjualan melalui dashboard dengan grafik tren penjualan, ringkasan pendapatan, performa produk, jam sibuk, dan ekspor CSV.

**Architecture:** Single analytics service (`mitraAnalyticsService.ts`) dengan multiple query methods, exposed via dedicated REST endpoints di bawah prefix `/mitra/analytics`. Frontend menggunakan Recharts (sudah terinstall) untuk visualisasi grafik, diintegrasikan ke dashboard mitra yang sudah ada sebagai tab "Analitik".

**Execution Strategy:** Hybrid -- Sequential Chain (Task 1 -> Task 2-5 parallel) -> Sequential Chain (Task 6)

**Tech Stack:** Express.js + Prisma (backend), Next.js 15 + Recharts 2.15 + date-fns (frontend), Vitest + Supertest (testing)

---

## M1-M7 Readiness Audit

Sebelum implementasi M8, berikut hasil audit implementasi milestone sebelumnya:

| Milestone | Status | Catatan |
|-----------|--------|---------|
| M1: Auth & User | COMPLETE | Register, login, OTP verify, JWT session, profile CRUD -- semua route ada di `backend/src/routes/auth.ts`, `users.ts` |
| M2: Product Catalog | COMPLETE | Full-text search (`tsvector`), category filter, pagination, image upload ke S3/local |
| M3: Cart & Order Engine | COMPLETE | Cart dengan single-store constraint, order state machine (PENDING->PROCESSED->READY->PICKED_UP/CANCELLED), pickup code generation, 2h timer |
| M4: Mitra Management | COMPLETE | Registration flow, product CRUD, order management, basic stats (stock/sold/remaining) |
| M5: Notification Service | COMPLETE | FCM via firebase-admin, device token management, in-app notification table, push triggers |
| M6: Location & Maps | PARTIAL | Schema + API untuk lat/lng, geocoding, distance calculation sudah ada. Google Maps component terpasang tapi tidak ada dedicated maps page -- tidak memblokir M8 |
| M7: Reviews & Trust | COMPLETE | Review model linked to Order, rating aggregation, moderation queue skeleton |

**Kesimpulan:** M1-M7 cukup lengkap untuk M8. Semua data yang dibutuhkan analytics (Order, OrderItem, Product) sudah ada di database dengan timestamp dan harga. Tidak ada infrastruktur yang kurang.

---

## Prasyarat Setup Sebelum Implementasi

1. **Database berisi data Order yang cukup** -- Analytics membutuhkan data transaksi nyata untuk memverifikasi grafik. Seed database dengan minimal 50-100 order dengan timestamp tersebar selama 30 hari terakhir, berbagai status, dan berbagai produk.

   ```bash
   # Update seed script dan jalankan:
   cd backend && npx tsx prisma/seed.ts
   ```

2. **Setup environment** -- Tidak ada env variable baru yang diperlukan. Semua sudah ada di `backend/src/config.ts`.

---

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   └── mitraAnalyticsService.ts    # NEW: semua query analytics
│   ├── routes/
│   │   └── analytics.ts                # NEW: route handler untuk /mitra/analytics/*
│   ├── validators/
│   │   └── analytics.ts                # NEW: Zod validator untuk query params
│   ├── types/
│   │   └── index.ts                    # MODIFY: tambahkan AnalyticsResponse types
│   └── app.ts                          # MODIFY: register analyticsRouter
├── tests/
│   └── analytics/
│       ├── sales-trend.test.ts         # NEW
│       ├── revenue.test.ts             # NEW
│       ├── products.test.ts            # NEW
│       ├── peak-hours.test.ts          # NEW
│       └── export.test.ts              # NEW
src/
├── lib/api/
│   └── analytics.ts                    # NEW: API client + TypeScript types
├── components/
│   └── analytics/
│       ├── SalesTrendChart.tsx          # NEW
│       ├── RevenueSummary.tsx           # NEW
│       ├── ProductRanking.tsx           # NEW
│       ├── PeakHoursChart.tsx           # NEW
│       ├── DateRangeFilter.tsx          # NEW
│       └── CsvExportButton.tsx          # NEW
└── app/seller/
    └── page.tsx                        # MODIFY: tambahkan tab Analitik
```

---

## Task Grouping

### Sequential Chain 1: Analytics Foundation

```
  Task 1: Analytics Foundation + Sales Trend (AFK, blocked by: None)
    ↓ depends on
  [Parallel Batch 1: all independent analytics features]
```

### Parallel Batch 1: Independent Analytics Features

```
  Task 2: Revenue Summary (AFK, blocked by: Task 1)
  Task 3: Product Performance (AFK, blocked by: Task 1)
  Task 4: Peak Hours Analysis (AFK, blocked by: Task 1)
  Task 5: CSV Export (AFK, blocked by: Task 1)
```

### Sequential Chain 2: Dashboard Integration

```
  [Parallel Batch 1 completed]
    ↓ depends on
  Task 6: Dashboard Integration & Polish (HITL, blocked by: Tasks 1-5 all complete)
```

---

## Tasks

### Task 1: Analytics Foundation + Sales Trend

**Type:** `AFK`
**Blocked by:** None

**Files:**
- Create: `backend/src/services/mitraAnalyticsService.ts`
- Create: `backend/src/routes/analytics.ts`
- Create: `backend/src/validators/analytics.ts`
- Modify: `backend/src/types/index.ts`
- Modify: `backend/src/app.ts`
- Create: `src/lib/api/analytics.ts`
- Create: `src/components/analytics/SalesTrendChart.tsx`
- Create: `src/components/analytics/DateRangeFilter.tsx`
- Create: `backend/tests/analytics/sales-trend.test.ts`

This task establishes the entire analytics pipeline end-to-end: service -> route -> API client -> frontend chart. The date range filter is shared infrastructure used by all subsequent tasks.

- [ ] **Step 1: Write the failing test**

```typescript
// backend/tests/analytics/sales-trend.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('GET /mitra/analytics/sales', () => {
  let mitraAccessToken: string;
  let mitraUserId: string;

  beforeEach(async () => {
    const mitraUser = await prisma.user.create({
      data: {
        email: 'analytics-mitra@example.com',
        name: 'Analytics Mitra',
        passwordHash: 'hash',
        role: 'MITRA',
        isVerified: true,
        mitraProfile: {
          create: {
            storeName: 'Toko Analitik',
            verificationStatus: 'VERIFIED',
          },
        },
      },
    });
    mitraUserId = mitraUser.id;
    mitraAccessToken = signAccessToken({ userId: mitraUser.id, email: mitraUser.email });
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).get('/mitra/analytics/sales');
    expect(res.status).toBe(401);
  });

  it('should return daily sales trend for mitra products', async () => {
    // Create a product for the mitra
    const product = await prisma.product.create({
      data: {
        name: 'Trend Product',
        category: 'meals',
        originalPrice: 20000,
        discountedPrice: 10000,
        stock: 20,
        storeName: 'Toko Analitik',
        expiresAt: new Date(Date.now() + 86400000),
        mitraId: mitraUserId,
      },
    });

    // Create a buyer and two orders on different days
    const buyer = await prisma.user.create({
      data: {
        email: 'trend-buyer@example.com',
        name: 'Trend Buyer',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });

    // Order 1: yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);

    await prisma.order.create({
      data: {
        userId: buyer.id,
        storeName: 'Toko Analitik',
        status: 'PICKED_UP',
        pickupCode: 'TRND-0001',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 20000,
        savingAmount: 20000,
        buyerName: 'Trend Buyer',
        buyerPhone: '08000000',
        createdAt: yesterday,
        items: {
          create: {
            productId: product.id,
            name: 'Trend Product',
            storeName: 'Toko Analitik',
            price: 10000,
            originalPrice: 20000,
            quantity: 2,
          },
        },
      },
    });

    // Order 2: 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(14, 0, 0, 0);

    await prisma.order.create({
      data: {
        userId: buyer.id,
        storeName: 'Toko Analitik',
        status: 'PICKED_UP',
        pickupCode: 'TRND-0002',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 10000,
        savingAmount: 10000,
        buyerName: 'Trend Buyer',
        buyerPhone: '08000001',
        createdAt: threeDaysAgo,
        items: {
          create: {
            productId: product.id,
            name: 'Trend Product',
            storeName: 'Toko Analitik',
            price: 10000,
            originalPrice: 20000,
            quantity: 1,
          },
        },
      },
    });

    // Query with date range covering both orders
    const from = new Date();
    from.setDate(from.getDate() - 7);
    const to = new Date();

    const res = await request(app)
      .get(`/mitra/analytics/sales?from=${from.toISOString()}&to=${to.toISOString()}&granularity=daily`)
      .set('Authorization', `Bearer ${mitraAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.trend).toBeDefined();
    expect(Array.isArray(res.body.trend)).toBe(true);
    expect(res.body.trend.length).toBeGreaterThanOrEqual(2);

    // Each trend entry should have date, totalOrders, totalItems, totalRevenue
    const entry = res.body.trend[0];
    expect(entry).toHaveProperty('date');
    expect(entry).toHaveProperty('totalOrders');
    expect(entry).toHaveProperty('totalItems');
    expect(entry).toHaveProperty('totalRevenue');
    expect(entry).toHaveProperty('totalSavings');
  });

  it('should return 400 for invalid granularity', async () => {
    const res = await request(app)
      .get('/mitra/analytics/sales?from=2024-01-01&to=2024-01-31&granularity=yearly')
      .set('Authorization', `Bearer ${mitraAccessToken}`);
    expect(res.status).toBe(400);
  });

  it('should return 400 for missing date range', async () => {
    const res = await request(app)
      .get('/mitra/analytics/sales')
      .set('Authorization', `Bearer ${mitraAccessToken}`);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- tests/analytics/sales-trend.test.ts`
Expected: FAIL -- "Cannot GET /mitra/analytics/sales" (404)

- [ ] **Step 3: Create validator for analytics params**

```typescript
// backend/src/validators/analytics.ts
import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  from: z.string().datetime({ message: 'Parameter from harus berupa ISO datetime' }),
  to: z.string().datetime({ message: 'Parameter to harus berupa ISO datetime' }),
  granularity: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Granularity harus daily, weekly, atau monthly' }),
  }).optional().default('daily'),
});
```

- [ ] **Step 4: Create analytics service**

```typescript
// backend/src/services/mitraAnalyticsService.ts
import { prisma } from '../lib/prisma.js';
import type { SalesTrendEntry } from '../types/index.js';

export class AnalyticsError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

function toISOStringTrunc(date: Date): string {
  // Returns date portion only: '2024-06-03'
  return date.toISOString().slice(0, 10);
}

function getWeekKey(date: Date): string {
  // ISO week: YYYY-Www
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getPeriodKey(date: Date, granularity: 'daily' | 'weekly' | 'monthly'): string {
  switch (granularity) {
    case 'daily': return toISOStringTrunc(date);
    case 'weekly': return getWeekKey(date);
    case 'monthly': return getMonthKey(date);
  }
}

export async function getSalesTrend(
  mitraId: string,
  from: Date,
  to: Date,
  granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<SalesTrendEntry[]> {
  // Find all products for this mitra
  const products = await prisma.product.findMany({
    where: { mitraId },
    select: { id: true },
  });
  const productIds = products.map((p) => p.id);

  if (productIds.length === 0) {
    return [];
  }

  // Find all orders containing these products within date range
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['PICKED_UP', 'READY'] },
      createdAt: { gte: from, lte: to },
      items: { some: { productId: { in: productIds } } },
    },
    select: {
      id: true,
      createdAt: true,
      totalAmount: true,
      savingAmount: true,
      items: {
        where: { productId: { in: productIds } },
        select: { quantity: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Aggregate by period
  const periodMap = new Map<string, SalesTrendEntry>();

  for (const order of orders) {
    const key = getPeriodKey(order.createdAt, granularity);
    const existing = periodMap.get(key);

    if (existing) {
      existing.totalOrders += 1;
      existing.totalItems += order.items.reduce((sum, i) => sum + i.quantity, 0);
      existing.totalRevenue += order.totalAmount;
      existing.totalSavings += order.savingAmount;
    } else {
      periodMap.set(key, {
        date: key,
        totalOrders: 1,
        totalItems: order.items.reduce((sum, i) => sum + i.quantity, 0),
        totalRevenue: order.totalAmount,
        totalSavings: order.savingAmount,
      });
    }
  }

  return Array.from(periodMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}
```

- [ ] **Step 5: Add types to backend types**

```typescript
// Append to backend/src/types/index.ts
export interface SalesTrendEntry {
  date: string;
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
  totalSavings: number;
}
```

- [ ] **Step 6: Create analytics route**

```typescript
// backend/src/routes/analytics.ts
import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth, requireMitra } from '../middleware/auth.js';
import { getSalesTrend, AnalyticsError } from '../services/mitraAnalyticsService.js';
import { analyticsQuerySchema } from '../validators/analytics.js';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

// GET /mitra/analytics/sales - Sales trend over time
analyticsRouter.get('/sales', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { from, to, granularity } = parsed.data;
    const trend = await getSalesTrend(req.user!.userId, new Date(from), new Date(to), granularity);
    res.json({ trend });
  } catch (err) {
    if (err instanceof AnalyticsError) {
      res.status(400).json({ error: err.message, code: err.code });
      return;
    }
    next(err);
  }
});
```

- [ ] **Step 7: Register analytics router in app.ts**

```typescript
// Modify backend/src/app.ts -- add import and route registration

// Add this import near the other route imports:
import { analyticsRouter } from './routes/analytics.js';

// Add this near the other app.use() calls:
app.use('/mitra/analytics', analyticsRouter);
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd backend && npm test -- tests/analytics/sales-trend.test.ts`
Expected: PASS (all 4 tests)

- [ ] **Step 9: Create frontend API client**

```typescript
// src/lib/api/analytics.ts
import { apiFetch } from './client';

export interface SalesTrendEntry {
  date: string;
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
  totalSavings: number;
}

export interface AnalyticsQueryParams {
  from: string;
  to: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export async function fetchSalesTrend(params: AnalyticsQueryParams): Promise<{ trend: SalesTrendEntry[] }> {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    granularity: params.granularity || 'daily',
  });
  return apiFetch<{ trend: SalesTrendEntry[] }>(`/mitra/analytics/sales?${query}`, { auth: true });
}
```

- [ ] **Step 10: Create DateRangeFilter component**

```tsx
// src/components/analytics/DateRangeFilter.tsx
'use client';

import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets: { label: string; getRange: () => DateRange }[] = [
  { label: '7H Terakhir', getRange: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: '30H Terakhir', getRange: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Minggu Ini', getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: new Date() }) },
  { label: 'Bulan Ini', getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
];

export default function DateRangeFilter({ value, onChange }: Props) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setShowPresets(!showPresets)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <CalendarDays className="w-4 h-4 text-[var(--primary)]" />
        <span>
          {format(value.from, 'dd/MM')} - {format(value.to, 'dd/MM/yy')}
        </span>
      </button>

      {showPresets && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-2 min-w-[200px]">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onChange(preset.getRange());
                setShowPresets(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 11: Create SalesTrendChart component**

```tsx
// src/components/analytics/SalesTrendChart.tsx
'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import type { SalesTrendEntry } from '@/lib/api/analytics';
import { TrendingUp } from 'lucide-react';

interface Props {
  data: SalesTrendEntry[];
  granularity: 'daily' | 'weekly' | 'monthly';
  loading?: boolean;
}

function formatDateLabel(dateStr: string, granularity: 'daily' | 'weekly' | 'monthly'): string {
  if (granularity === 'monthly') {
    // "2024-06" -> "Jun 2024"
    const [year, month] = dateStr.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(d, 'MMM yyyy', { locale: id });
  }
  if (granularity === 'weekly') {
    // "2024-W23" -> "W23 Jun"
    return dateStr.replace('-W', ' W');
  }
  // daily: "2024-06-03" -> "03 Jun"
  return format(parseISO(dateStr), 'dd MMM', { locale: id });
}

export default function SalesTrendChart({ data, granularity, loading }: Props) {
  const chartData = useMemo(() =>
    data.map((entry) => ({
      ...entry,
      label: formatDateLabel(entry.date, granularity),
      formattedRevenue: `Rp ${entry.totalRevenue.toLocaleString('id-ID')}`,
    })),
    [data, granularity]
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-600">Belum Ada Data</h3>
        <p className="text-xs text-gray-400 mt-1">Data penjualan akan muncul setelah ada pesanan yang selesai.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">
        Tren Penjualan
      </h3>
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={granularity === 'daily' ? Math.ceil(chartData.length / 7) : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}rb` : value.toString()
              }
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                />
              }
            />
            <Bar dataKey="totalRevenue" fill="var(--primary, #11676a)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
```

- [ ] **Step 12: Commit**

```bash
git add backend/src/services/mitraAnalyticsService.ts backend/src/routes/analytics.ts \
        backend/src/validators/analytics.ts backend/src/types/index.ts backend/src/app.ts \
        backend/tests/analytics/sales-trend.test.ts \
        src/lib/api/analytics.ts src/components/analytics/SalesTrendChart.tsx \
        src/components/analytics/DateRangeFilter.tsx
git commit -m "feat(m8): add analytics foundation with sales trend chart

- Create mitraAnalyticsService with getSalesTrend aggregation query
- Add GET /mitra/analytics/sales endpoint with date range + granularity
- Create DateRangeFilter component with preset ranges
- Create SalesTrendChart using Recharts BarChart
- Add frontend API client + types for analytics"
```

---

### Task 2: Revenue Summary

**Type:** `AFK`
**Blocked by:** Task 1

**Files:**
- Modify: `backend/src/services/mitraAnalyticsService.ts`
- Modify: `backend/src/routes/analytics.ts`
- Modify: `backend/src/types/index.ts`
- Modify: `src/lib/api/analytics.ts`
- Create: `src/components/analytics/RevenueSummary.tsx`
- Create: `backend/tests/analytics/revenue.test.ts`

Adds revenue aggregation (total revenue, total savings, average order value, order count) to the analytics pipeline.

- [ ] **Step 1: Write the failing test**

```typescript
// backend/tests/analytics/revenue.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('GET /mitra/analytics/revenue', () => {
  let mitraAccessToken: string;
  let mitraUserId: string;

  beforeEach(async () => {
    const mitraUser = await prisma.user.create({
      data: {
        email: 'revenue-mitra@example.com',
        name: 'Revenue Mitra',
        passwordHash: 'hash',
        role: 'MITRA',
        isVerified: true,
        mitraProfile: {
          create: { storeName: 'Toko Revenue', verificationStatus: 'VERIFIED' },
        },
      },
    });
    mitraUserId = mitraUser.id;
    mitraAccessToken = signAccessToken({ userId: mitraUser.id, email: mitraUser.email });
  });

  it('should return revenue summary', async () => {
    const product = await prisma.product.create({
      data: {
        name: 'Revenue Product',
        category: 'meals',
        originalPrice: 50000,
        discountedPrice: 30000,
        stock: 10,
        storeName: 'Toko Revenue',
        expiresAt: new Date(Date.now() + 86400000),
        mitraId: mitraUserId,
      },
    });

    const buyer = await prisma.user.create({
      data: {
        email: 'rev-buyer@example.com',
        name: 'Rev Buyer',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });

    // Order 1: 30000 revenue, 20000 savings
    await prisma.order.create({
      data: {
        userId: buyer.id,
        storeName: 'Toko Revenue',
        status: 'PICKED_UP',
        pickupCode: 'REV-00001',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 30000,
        savingAmount: 20000,
        buyerName: 'Buyer 1',
        buyerPhone: '08000001',
        createdAt: new Date(),
        items: {
          create: {
            productId: product.id,
            name: 'Revenue Product',
            storeName: 'Toko Revenue',
            price: 30000,
            originalPrice: 50000,
            quantity: 1,
          },
        },
      },
    });

    // Order 2: 60000 revenue, 40000 savings
    await prisma.order.create({
      data: {
        userId: buyer.id,
        storeName: 'Toko Revenue',
        status: 'PICKED_UP',
        pickupCode: 'REV-00002',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 60000,
        savingAmount: 40000,
        buyerName: 'Buyer 2',
        buyerPhone: '08000002',
        createdAt: new Date(),
        items: {
          create: {
            productId: product.id,
            name: 'Revenue Product',
            storeName: 'Toko Revenue',
            price: 30000,
            originalPrice: 50000,
            quantity: 2,
          },
        },
      },
    });

    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date().toISOString();

    const res = await request(app)
      .get(`/mitra/analytics/revenue?from=${from}&to=${to}`)
      .set('Authorization', `Bearer ${mitraAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalRevenue).toBe(90000);
    expect(res.body.summary.totalSavings).toBe(60000);
    expect(res.body.summary.totalOrders).toBe(2);
    expect(res.body.summary.totalItems).toBe(3); // 1 + 2
    expect(res.body.summary.averageOrderValue).toBe(45000); // 90000 / 2
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- tests/analytics/revenue.test.ts`
Expected: FAIL -- "Cannot GET /mitra/analytics/revenue"

- [ ] **Step 3: Add getRevenueSummary to service**

```typescript
// Add to backend/src/services/mitraAnalyticsService.ts

export interface RevenueSummary {
  totalRevenue: number;
  totalSavings: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
}

export async function getRevenueSummary(
  mitraId: string,
  from: Date,
  to: Date
): Promise<RevenueSummary> {
  const products = await prisma.product.findMany({
    where: { mitraId },
    select: { id: true },
  });
  const productIds = products.map((p) => p.id);

  if (productIds.length === 0) {
    return { totalRevenue: 0, totalSavings: 0, totalOrders: 0, totalItems: 0, averageOrderValue: 0 };
  }

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['PICKED_UP', 'READY'] },
      createdAt: { gte: from, lte: to },
      items: { some: { productId: { in: productIds } } },
    },
    select: {
      totalAmount: true,
      savingAmount: true,
      items: {
        where: { productId: { in: productIds } },
        select: { quantity: true },
      },
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalSavings = orders.reduce((sum, o) => sum + o.savingAmount, 0);
  const totalOrders = orders.length;
  const totalItems = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  return {
    totalRevenue,
    totalSavings,
    totalOrders,
    totalItems,
    averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
  };
}
```

- [ ] **Step 4: Add /mitra/analytics/revenue route**

```typescript
// Append to backend/src/routes/analytics.ts (before export)

// GET /mitra/analytics/revenue - Revenue summary for date range
analyticsRouter.get('/revenue', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { from, to } = parsed.data;
    const summary = await getRevenueSummary(req.user!.userId, new Date(from), new Date(to));
    res.json({ summary });
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 5: Add RevenueSummary type to backend types**

```typescript
// Append to backend/src/types/index.ts
export interface RevenueSummary {
  totalRevenue: number;
  totalSavings: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
}
```

- [ ] **Step 6: Add fetchRevenueSummary to API client**

```typescript
// Append to src/lib/api/analytics.ts
export interface RevenueSummary {
  totalRevenue: number;
  totalSavings: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
}

export async function fetchRevenueSummary(params: AnalyticsQueryParams): Promise<{ summary: RevenueSummary }> {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  return apiFetch<{ summary: RevenueSummary }>(`/mitra/analytics/revenue?${query}`, { auth: true });
}
```

- [ ] **Step 7: Create RevenueSummary component**

```tsx
// src/components/analytics/RevenueSummary.tsx
'use client';

import type { RevenueSummary } from '@/lib/api/analytics';
import { DollarSign, TrendingDown, ShoppingBag, Package } from 'lucide-react';

interface Props {
  data: RevenueSummary;
  loading?: boolean;
}

function formatRupiah(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

const skeletonCards = [
  { label: 'Total Pendapatan', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Total Hemat Pembeli', icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Jumlah Pesanan', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Item Terjual', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function RevenueSummary({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {skeletonCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Pendapatan', value: formatRupiah(data.totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Hemat Pembeli', value: formatRupiah(data.totalSavings), icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Jumlah Pesanan', value: data.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Item Terjual', value: data.totalItems.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl shadow-sm p-4">
          <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center mb-2`}>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd backend && npm test -- tests/analytics/revenue.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add backend/src/services/mitraAnalyticsService.ts backend/src/routes/analytics.ts \
        backend/src/types/index.ts backend/tests/analytics/revenue.test.ts \
        src/lib/api/analytics.ts src/components/analytics/RevenueSummary.tsx
git commit -m "feat(m8): add revenue summary analytics

- Add getRevenueSummary to analytics service
- Add GET /mitra/analytics/revenue endpoint
- Create RevenueSummary component with 4 metric cards"
```

---

### Task 3: Product Performance

**Type:** `AFK`
**Blocked by:** Task 1

**Files:**
- Modify: `backend/src/services/mitraAnalyticsService.ts`
- Modify: `backend/src/routes/analytics.ts`
- Modify: `backend/src/types/index.ts`
- Modify: `src/lib/api/analytics.ts`
- Create: `src/components/analytics/ProductRanking.tsx`
- Create: `backend/tests/analytics/products.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/tests/analytics/products.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('GET /mitra/analytics/products', () => {
  let mitraAccessToken: string;
  let mitraUserId: string;

  beforeEach(async () => {
    const mitraUser = await prisma.user.create({
      data: {
        email: 'prod-perf-mitra@example.com',
        name: 'Prod Perf Mitra',
        passwordHash: 'hash',
        role: 'MITRA',
        isVerified: true,
        mitraProfile: {
          create: { storeName: 'Toko Produk', verificationStatus: 'VERIFIED' },
        },
      },
    });
    mitraUserId = mitraUser.id;
    mitraAccessToken = signAccessToken({ userId: mitraUser.id, email: mitraUser.email });
  });

  it('should return product performance ranking', async () => {
    const prodA = await prisma.product.create({
      data: {
        name: 'Product A',
        category: 'meals',
        originalPrice: 30000,
        discountedPrice: 20000,
        stock: 10,
        storeName: 'Toko Produk',
        expiresAt: new Date(Date.now() + 86400000),
        mitraId: mitraUserId,
      },
    });

    const prodB = await prisma.product.create({
      data: {
        name: 'Product B',
        category: 'bakery',
        originalPrice: 25000,
        discountedPrice: 15000,
        stock: 5,
        storeName: 'Toko Produk',
        expiresAt: new Date(Date.now() + 86400000),
        mitraId: mitraUserId,
      },
    });

    const buyer = await prisma.user.create({
      data: {
        email: 'pp-buyer@example.com',
        name: 'PP Buyer',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });

    // Order with Product A (3 items, rank 1)
    await prisma.order.create({
      data: {
        userId: buyer.id,
        storeName: 'Toko Produk',
        status: 'PICKED_UP',
        pickupCode: 'PROD-0001',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 60000,
        savingAmount: 30000,
        buyerName: 'Buyer',
        buyerPhone: '08000000',
        createdAt: new Date(),
        items: {
          create: {
            productId: prodA.id,
            name: 'Product A',
            storeName: 'Toko Produk',
            price: 20000,
            originalPrice: 30000,
            quantity: 3,
          },
        },
      },
    });

    // Order with Product B (1 item, rank 2)
    await prisma.order.create({
      data: {
        userId: buyer.id,
        storeName: 'Toko Produk',
        status: 'PICKED_UP',
        pickupCode: 'PROD-0002',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 15000,
        savingAmount: 10000,
        buyerName: 'Buyer',
        buyerPhone: '08000001',
        createdAt: new Date(),
        items: {
          create: {
            productId: prodB.id,
            name: 'Product B',
            storeName: 'Toko Produk',
            price: 15000,
            originalPrice: 25000,
            quantity: 1,
          },
        },
      },
    });

    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date().toISOString();

    const res = await request(app)
      .get(`/mitra/analytics/products?from=${from}&to=${to}`)
      .set('Authorization', `Bearer ${mitraAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.products).toBeDefined();
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBe(2);
    expect(res.body.products[0].productId).toBe(prodA.id);
    expect(res.body.products[0].totalSold).toBe(3);
    expect(res.body.products[1].productId).toBe(prodB.id);
    expect(res.body.products[1].totalSold).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- tests/analytics/products.test.ts`
Expected: FAIL

- [ ] **Step 3: Add getProductPerformance to service**

```typescript
// Add to backend/src/services/mitraAnalyticsService.ts

export interface ProductPerformanceEntry {
  productId: string;
  productName: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
}

export async function getProductPerformance(
  mitraId: string,
  from: Date,
  to: Date
): Promise<ProductPerformanceEntry[]> {
  const products = await prisma.product.findMany({
    where: { mitraId },
    select: {
      id: true,
      name: true,
      category: true,
    },
  });
  const productIds = products.map((p) => p.id);
  const productMap = new Map(products.map((p) => [p.id, { name: p.name, category: p.category }]));

  if (productIds.length === 0) return [];

  // Aggregate sold quantities from order items
  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: productIds },
      order: {
        status: { in: ['PICKED_UP', 'READY'] },
        createdAt: { gte: from, lte: to },
      },
    },
    select: {
      productId: true,
      quantity: true,
      price: true,
    },
  });

  // Aggregate by product
  const aggregated = new Map<string, { totalSold: number; totalRevenue: number }>();
  for (const item of orderItems) {
    const entry = aggregated.get(item.productId) || { totalSold: 0, totalRevenue: 0 };
    entry.totalSold += item.quantity;
    entry.totalRevenue += item.price * item.quantity;
    aggregated.set(item.productId, entry);
  }

  // Get average ratings for each product
  const ratings = await prisma.review.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
  });
  const ratingMap = new Map(ratings.map((r) => [r.productId, r._avg.rating || 0]));

  const result: ProductPerformanceEntry[] = [];
  for (const [productId, data] of aggregated) {
    const info = productMap.get(productId);
    if (!info) continue;
    result.push({
      productId,
      productName: info.name,
      category: info.category,
      totalSold: data.totalSold,
      totalRevenue: data.totalRevenue,
      averageRating: Math.round((ratingMap.get(productId) || 0) * 10) / 10,
    });
  }

  // Sort by totalSold descending
  result.sort((a, b) => b.totalSold - a.totalSold);
  return result;
}
```

- [ ] **Step 4: Add /mitra/analytics/products route**

```typescript
// Append to backend/src/routes/analytics.ts (before export)

// GET /mitra/analytics/products - Product performance ranking
analyticsRouter.get('/products', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { from, to } = parsed.data;
    const products = await getProductPerformance(req.user!.userId, new Date(from), new Date(to));
    res.json({ products });
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 5: Update types and API client**

```typescript
// Append to backend/src/types/index.ts
export interface ProductPerformanceEntry {
  productId: string;
  productName: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
}
```

```typescript
// Append to src/lib/api/analytics.ts
export interface ProductPerformanceEntry {
  productId: string;
  productName: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
}

export async function fetchProductPerformance(params: AnalyticsQueryParams): Promise<{ products: ProductPerformanceEntry[] }> {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  return apiFetch<{ products: ProductPerformanceEntry[] }>(`/mitra/analytics/products?${query}`, { auth: true });
}
```

- [ ] **Step 6: Create ProductRanking component**

```tsx
// src/components/analytics/ProductRanking.tsx
'use client';

import type { ProductPerformanceEntry } from '@/lib/api/analytics';
import { Star, TrendingUp, Package } from 'lucide-react';

interface Props {
  data: ProductPerformanceEntry[];
  loading?: boolean;
}

function formatRupiah(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

const categoryLabels: Record<string, string> = {
  meals: 'Makanan',
  bakery: 'Roti & Kue',
  drinks: 'Minuman',
};

export default function ProductRanking({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1" />
              <div className="h-2 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-600">Belum Ada Penjualan</h3>
        <p className="text-xs text-gray-400 mt-1">Data performa produk akan muncul setelah ada pesanan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">Produk Terlaris</h3>
      <div className="space-y-0">
        {data.map((product, idx) => (
          <div
            key={product.productId}
            className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--primary)]">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{product.productName}</p>
              <p className="text-xs text-gray-400">{categoryLabels[product.category] || product.category}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-gray-800">{product.totalSold} terjual</p>
              <p className="text-xs text-gray-400">{formatRupiah(product.totalRevenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd backend && npm test -- tests/analytics/products.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add backend/src/services/mitraAnalyticsService.ts backend/src/routes/analytics.ts \
        backend/src/types/index.ts backend/tests/analytics/products.test.ts \
        src/lib/api/analytics.ts src/components/analytics/ProductRanking.tsx
git commit -m "feat(m8): add product performance analytics

- Add getProductPerformance with sales ranking and avg rating
- Add GET /mitra/analytics/products endpoint
- Create ProductRanking component with top-seller list"
```

---

### Task 4: Peak Hours Analysis

**Type:** `AFK`
**Blocked by:** Task 1

**Files:**
- Modify: `backend/src/services/mitraAnalyticsService.ts`
- Modify: `backend/src/routes/analytics.ts`
- Modify: `backend/src/types/index.ts`
- Modify: `src/lib/api/analytics.ts`
- Create: `src/components/analytics/PeakHoursChart.tsx`
- Create: `backend/tests/analytics/peak-hours.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/tests/analytics/peak-hours.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('GET /mitra/analytics/peak-hours', () => {
  let mitraAccessToken: string;
  let mitraUserId: string;

  beforeEach(async () => {
    const mitraUser = await prisma.user.create({
      data: {
        email: 'peak-mitra@example.com',
        name: 'Peak Mitra',
        passwordHash: 'hash',
        role: 'MITRA',
        isVerified: true,
        mitraProfile: {
          create: { storeName: 'Toko Jam Sibuk', verificationStatus: 'VERIFIED' },
        },
      },
    });
    mitraUserId = mitraUser.id;
    mitraAccessToken = signAccessToken({ userId: mitraUser.id, email: mitraUser.email });
  });

  it('should return hourly distribution', async () => {
    const product = await prisma.product.create({
      data: {
        name: 'Peak Product',
        category: 'meals',
        originalPrice: 20000,
        discountedPrice: 10000,
        stock: 20,
        storeName: 'Toko Jam Sibuk',
        expiresAt: new Date(Date.now() + 86400000),
        mitraId: mitraUserId,
      },
    });

    const buyer = await prisma.user.create({
      data: {
        email: 'peak-buyer@example.com',
        name: 'Peak Buyer',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });

    // Order at 10:00
    const date10am = new Date();
    date10am.setHours(10, 0, 0, 0);
    await prisma.order.create({
      data: {
        userId: buyer.id,
        storeName: 'Toko Jam Sibuk',
        status: 'PICKED_UP',
        pickupCode: 'PEAK-0001',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 20000,
        savingAmount: 10000,
        buyerName: 'Buyer 10am',
        buyerPhone: '08000000',
        createdAt: date10am,
        items: {
          create: {
            productId: product.id,
            name: 'Peak Product',
            storeName: 'Toko Jam Sibuk',
            price: 10000,
            originalPrice: 20000,
            quantity: 2,
          },
        },
      },
    });

    // Order at 14:00
    const date2pm = new Date();
    date2pm.setHours(14, 0, 0, 0);
    await prisma.order.create({
      data: {
        userId: buyer.id,
        storeName: 'Toko Jam Sibuk',
        status: 'PICKED_UP',
        pickupCode: 'PEAK-0002',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 10000,
        savingAmount: 10000,
        buyerName: 'Buyer 2pm',
        buyerPhone: '08000001',
        createdAt: date2pm,
        items: {
          create: {
            productId: product.id,
            name: 'Peak Product',
            storeName: 'Toko Jam Sibuk',
            price: 10000,
            originalPrice: 20000,
            quantity: 1,
          },
        },
      },
    });

    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date().toISOString();

    const res = await request(app)
      .get(`/mitra/analytics/peak-hours?from=${from}&to=${to}`)
      .set('Authorization', `Bearer ${mitraAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.hours).toBeDefined();
    expect(Array.isArray(res.body.hours)).toBe(true);
    // Should have entries for hours 0-23
    expect(res.body.hours.length).toBe(24);
    expect(res.body.hours[10].orders).toBe(1);
    expect(res.body.hours[10].items).toBe(2);
    expect(res.body.hours[14].orders).toBe(1);
    expect(res.body.hours[14].items).toBe(1);
    // Hours with no orders should be 0
    expect(res.body.hours[3].orders).toBe(0);
    expect(res.body.hours[3].items).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- tests/analytics/peak-hours.test.ts`
Expected: FAIL

- [ ] **Step 3: Add getPeakHours to service**

```typescript
// Add to backend/src/services/mitraAnalyticsService.ts

export interface PeakHourEntry {
  hour: number;        // 0-23
  label: string;       // "00:00", "01:00", etc.
  orders: number;
  items: number;
  revenue: number;
}

export async function getPeakHours(
  mitraId: string,
  from: Date,
  to: Date
): Promise<PeakHourEntry[]> {
  const products = await prisma.product.findMany({
    where: { mitraId },
    select: { id: true },
  });
  const productIds = products.map((p) => p.id);

  if (productIds.length === 0) {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${String(i).padStart(2, '0')}:00`,
      orders: 0,
      items: 0,
      revenue: 0,
    }));
  }

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['PICKED_UP', 'READY'] },
      createdAt: { gte: from, lte: to },
      items: { some: { productId: { in: productIds } } },
    },
    select: {
      createdAt: true,
      totalAmount: true,
      items: {
        where: { productId: { in: productIds } },
        select: { quantity: true },
      },
    },
  });

  // Initialize all 24 hours
  const hourMap = new Map<number, PeakHourEntry>();
  for (let h = 0; h < 24; h++) {
    hourMap.set(h, {
      hour: h,
      label: `${String(h).padStart(2, '0')}:00`,
      orders: 0,
      items: 0,
      revenue: 0,
    });
  }

  for (const order of orders) {
    const hour = order.createdAt.getHours();
    const entry = hourMap.get(hour)!;
    entry.orders += 1;
    entry.items += order.items.reduce((sum, i) => sum + i.quantity, 0);
    entry.revenue += order.totalAmount;
  }

  return Array.from(hourMap.values());
}
```

- [ ] **Step 4: Add /mitra/analytics/peak-hours route**

```typescript
// Append to backend/src/routes/analytics.ts (before export)

// GET /mitra/analytics/peak-hours - Hourly order distribution
analyticsRouter.get('/peak-hours', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { from, to } = parsed.data;
    const hours = await getPeakHours(req.user!.userId, new Date(from), new Date(to));
    res.json({ hours });
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 5: Update types and API client**

```typescript
// Append to backend/src/types/index.ts
export interface PeakHourEntry {
  hour: number;
  label: string;
  orders: number;
  items: number;
  revenue: number;
}
```

```typescript
// Append to src/lib/api/analytics.ts
export interface PeakHourEntry {
  hour: number;
  label: string;
  orders: number;
  items: number;
  revenue: number;
}

export async function fetchPeakHours(params: AnalyticsQueryParams): Promise<{ hours: PeakHourEntry[] }> {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  return apiFetch<{ hours: PeakHourEntry[] }>(`/mitra/analytics/peak-hours?${query}`, { auth: true });
}
```

- [ ] **Step 6: Create PeakHoursChart component**

```tsx
// src/components/analytics/PeakHoursChart.tsx
'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { PeakHourEntry } from '@/lib/api/analytics';
import { Clock } from 'lucide-react';

interface Props {
  data: PeakHourEntry[];
  loading?: boolean;
}

export default function PeakHoursChart({ data, loading }: Props) {
  const maxOrders = useMemo(
    () => Math.max(...data.map((d) => d.orders), 1),
    [data]
  );

  const peakHour = useMemo(() => {
    if (data.length === 0) return null;
    return data.reduce((max, curr) => (curr.orders > max.orders ? curr : max), data[0]);
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    );
  }

  if (data.every((d) => d.orders === 0)) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-600">Belum Ada Data</h3>
        <p className="text-xs text-gray-400 mt-1">Data jam sibuk akan muncul setelah ada beberapa pesanan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600">Jam Sibuk</h3>
        {peakHour && (
          <span className="text-xs text-[var(--secondary)] font-medium">
            Puncak: {peakHour.label}
          </span>
        )}
      </div>
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value: number, name: string) => {
                    if (name === 'orders') return [`${value} pesanan`, 'Pesanan'];
                    return [value.toString(), name];
                  }}
                />
              }
            />
            <Bar dataKey="orders" radius={[3, 3, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.orders === maxOrders ? 'var(--primary, #11676a)' : '#d1d5db'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <p className="text-xs text-gray-400 text-center mt-2">
        Distribusi pesanan berdasarkan jam dalam sehari
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd backend && npm test -- tests/analytics/peak-hours.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add backend/src/services/mitraAnalyticsService.ts backend/src/routes/analytics.ts \
        backend/src/types/index.ts backend/tests/analytics/peak-hours.test.ts \
        src/lib/api/analytics.ts src/components/analytics/PeakHoursChart.tsx
git commit -m "feat(m8): add peak hours analysis

- Add getPeakHours aggregation by hour of day
- Add GET /mitra/analytics/peak-hours endpoint
- Create PeakHoursChart with highlighted peak hour bar"
```

---

### Task 5: CSV Export

**Type:** `AFK`
**Blocked by:** Task 1

**Files:**
- Modify: `backend/src/services/mitraAnalyticsService.ts`
- Modify: `backend/src/routes/analytics.ts`
- Modify: `src/lib/api/analytics.ts`
- Create: `src/components/analytics/CsvExportButton.tsx`
- Create: `backend/tests/analytics/export.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// backend/tests/analytics/export.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../setup.js';
import { signAccessToken } from '../../src/lib/jwt.js';

const app = createApp();

describe('GET /mitra/analytics/export', () => {
  let mitraAccessToken: string;
  let mitraUserId: string;

  beforeEach(async () => {
    const mitraUser = await prisma.user.create({
      data: {
        email: 'export-mitra@example.com',
        name: 'Export Mitra',
        passwordHash: 'hash',
        role: 'MITRA',
        isVerified: true,
        mitraProfile: {
          create: { storeName: 'Toko Ekspor', verificationStatus: 'VERIFIED' },
        },
      },
    });
    mitraUserId = mitraUser.id;
    mitraAccessToken = signAccessToken({ userId: mitraUser.id, email: mitraUser.email });
  });

  it('should return CSV file with correct headers', async () => {
    const product = await prisma.product.create({
      data: {
        name: 'Export Product',
        category: 'meals',
        originalPrice: 30000,
        discountedPrice: 20000,
        stock: 10,
        storeName: 'Toko Ekspor',
        expiresAt: new Date(Date.now() + 86400000),
        mitraId: mitraUserId,
      },
    });

    const buyer = await prisma.user.create({
      data: {
        email: 'exp-buyer@example.com',
        name: 'Exp Buyer',
        passwordHash: 'hash',
        role: 'FOOD_SAVER',
        isVerified: true,
      },
    });

    const orderDate = new Date();
    orderDate.setHours(10, 30, 0, 0);

    await prisma.order.create({
      data: {
        userId: buyer.id,
        storeName: 'Toko Ekspor',
        status: 'PICKED_UP',
        pickupCode: 'EXPT-0001',
        pickupExpiresAt: new Date(Date.now() + 7200000),
        totalAmount: 40000,
        savingAmount: 20000,
        buyerName: 'Buyer Export',
        buyerPhone: '08000000',
        createdAt: orderDate,
        items: {
          create: {
            productId: product.id,
            name: 'Export Product',
            storeName: 'Toko Ekspor',
            price: 20000,
            originalPrice: 30000,
            quantity: 2,
          },
        },
      },
    });

    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date().toISOString();

    const res = await request(app)
      .get(`/mitra/analytics/export?from=${from}&to=${to}`)
      .set('Authorization', `Bearer ${mitraAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['content-disposition']).toContain('.csv');

    // Check CSV structure
    const lines = res.text.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1); // header + at least 1 data row
    expect(lines[0]).toContain('Tanggal');
    expect(lines[0]).toContain('Produk');
    expect(lines[0]).toContain('Jumlah');
    expect(lines[0]).toContain('Pendapatan');

    // Check data row
    expect(lines[1]).toContain('Export Product');
    expect(lines[1]).toContain('2');
    expect(lines[1]).toContain('40000');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- tests/analytics/export.test.ts`
Expected: FAIL

- [ ] **Step 3: Add generateCsvExport to service**

```typescript
// Add to backend/src/services/mitraAnalyticsService.ts

export async function generateAnalyticsCsv(
  mitraId: string,
  from: Date,
  to: Date
): Promise<string> {
  const products = await prisma.product.findMany({
    where: { mitraId },
    select: { id: true, name: true },
  });
  const productIds = products.map((p) => p.id);
  const productNameMap = new Map(products.map((p) => [p.id, p.name]));

  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { in: productIds },
      order: {
        status: { in: ['PICKED_UP', 'READY'] },
        createdAt: { gte: from, lte: to },
      },
    },
    select: {
      productId: true,
      name: true,
      price: true,
      quantity: true,
      order: {
        select: {
          createdAt: true,
          totalAmount: true,
          savingAmount: true,
          buyerName: true,
          status: true,
        },
      },
    },
    orderBy: { order: { createdAt: 'desc' } },
  });

  // CSV header
  const headers = [
    'Tanggal',
    'Produk',
    'Kategori',
    'Jumlah',
    'Harga Satuan',
    'Pendapatan',
    'Hemat Pembeli',
    'Pembeli',
    'Status',
  ];

  const escapeCsv = (value: string | number): string => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = orderItems.map((item) => [
    item.order.createdAt.toISOString(),
    item.name,
    escapeCsv(productNameMap.get(item.productId) || ''),
    item.quantity,
    item.price,
    item.price * item.quantity,
    item.order.savingAmount,
    escapeCsv(item.order.buyerName),
    item.order.status,
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');
}
```

- [ ] **Step 4: Add /mitra/analytics/export route**

```typescript
// Append to backend/src/routes/analytics.ts (before export)

// GET /mitra/analytics/export - Export analytics as CSV
analyticsRouter.get('/export', requireMitra, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { from, to } = parsed.data;
    const csv = await generateAnalyticsCsv(req.user!.userId, new Date(from), new Date(to));

    const filename = `lastbite-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 5: Update API client**

```typescript
// Append to src/lib/api/analytics.ts

import { API_URL } from './client';

export function getExportCsvUrl(params: AnalyticsQueryParams, token: string): string {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  return `${API_URL}/mitra/analytics/export?${query}&token=${encodeURIComponent(token)}`;
}
```

Note: For the CSV download to work from the browser, we need to adjust the route to accept query param auth (since `<a>` download can't set `Authorization` header). We'll handle this in the route.

- [ ] **Step 6: Adjust export route to support token in query param**

Modify the `/export` route in `backend/src/routes/analytics.ts` to conditionally check auth:

```typescript
// Replace the requireMitra middleware on the export route with custom auth
// The route should check both header and query token

import jwt from 'jsonwebtoken';
import { config } from '../config.js';

analyticsRouter.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try header auth first, then query param
    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      userId = decoded.userId;
    } else if (typeof req.query.token === 'string') {
      const decoded = jwt.verify(req.query.token, config.jwtSecret) as { userId: string };
      userId = decoded.userId;
    }

    if (!userId) {
      res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
      return;
    }

    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const { from, to } = parsed.data;
    const csv = await generateAnalyticsCsv(userId, new Date(from), new Date(to));

    const filename = `lastbite-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 7: Create CsvExportButton component**

```tsx
// src/components/analytics/CsvExportButton.tsx
'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getExportCsvUrl } from '@/lib/api/analytics';

interface Props {
  from: string;
  to: string;
  disabled?: boolean;
}

export default function CsvExportButton({ from, to, disabled }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const url = getExportCsvUrl({ from, to }, token);

      // Use fetch to trigger browser download
      const response = await fetch(url);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `lastbite-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('CSV export failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Ekspor CSV
    </button>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd backend && npm test -- tests/analytics/export.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add backend/src/services/mitraAnalyticsService.ts backend/src/routes/analytics.ts \
        backend/tests/analytics/export.test.ts \
        src/lib/api/analytics.ts src/components/analytics/CsvExportButton.tsx
git commit -m "feat(m8): add CSV export functionality

- Add generateAnalyticsCsv with full transaction data
- Add GET /mitra/analytics/export endpoint with query-token auth
- Create CsvExportButton component with blob download"
```

---

### Task 6: Dashboard Integration & Polish

**Type:** `HITL`
**Blocked by:** Tasks 1, 2, 3, 4, 5 (all complete)

**Files:**
- Modify: `src/app/seller/page.tsx`

Integrates all analytics components into the existing mitra dashboard with a tabbed navigation layout (Ringkasan | Analitik) and shared date range filter.

- [ ] **Step 1: Modify seller dashboard page**

```tsx
// src/app/seller/page.tsx -- Full replacement
//
// Key changes from existing:
// 1. Add tab state: 'overview' | 'analytics'
// 2. Add date range state (default: last 30 days)
// 3. Add analytics data fetching (sales trend, revenue, products, peak hours)
// 4. Render analytics tab with all chart components
// 5. Keep existing overview tab unchanged

'use client';

import { ArrowLeft, Store, Package, Plus, ExternalLink, Loader2, BarChart3, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getMitraProfile, fetchMitraStats, fetchMitraProducts, type MitraProfile, type MitraStats } from '@/lib/api/mitra';
import type { ProductData } from '@/lib/api/products';
import { fetchSalesTrend, fetchRevenueSummary, fetchProductPerformance, fetchPeakHours } from '@/lib/api/analytics';
import type { SalesTrendEntry, RevenueSummary, ProductPerformanceEntry, PeakHourEntry } from '@/lib/api/analytics';
import DashboardStatCards from '@/components/DashboardStatCards';
import ProductManagementList from '@/components/ProductManagementList';
import DateRangeFilter from '@/components/analytics/DateRangeFilter';
import SalesTrendChart from '@/components/analytics/SalesTrendChart';
import RevenueSummary from '@/components/analytics/RevenueSummary';
import ProductRanking from '@/components/analytics/ProductRanking';
import PeakHoursChart from '@/components/analytics/PeakHoursChart';
import CsvExportButton from '@/components/analytics/CsvExportButton';

type Tab = 'overview' | 'analytics';

export default function SellerDashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<MitraProfile | null>(null);
  const [stats, setStats] = useState<MitraStats | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Analytics state
  const [dateRange, setDateRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [salesTrend, setSalesTrend] = useState<SalesTrendEntry[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [productPerf, setProductPerf] = useState<ProductPerformanceEntry[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourEntry[]>([]);

  const loadData = async () => {
    try {
      const [profileRes, statsRes, productsRes] = await Promise.all([
        getMitraProfile().catch(() => null),
        fetchMitraStats().catch(() => null),
        fetchMitraProducts().catch(() => ({ products: [] as ProductData[] })),
      ]);
      setProfile(profileRes?.profile ?? null);
      setStats(statsRes?.stats ?? null);
      setProducts(productsRes.products);
    } catch {
      // Not a mitra
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!profile) return;
    setAnalyticsLoading(true);
    try {
      const params = {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        granularity: 'daily' as const,
      };

      const [trendRes, revenueRes, productsRes, hoursRes] = await Promise.allSettled([
        fetchSalesTrend(params),
        fetchRevenueSummary(params),
        fetchProductPerformance(params),
        fetchPeakHours(params),
      ]);

      if (trendRes.status === 'fulfilled') setSalesTrend(trendRes.value.trend);
      if (revenueRes.status === 'fulfilled') setRevenueSummary(revenueRes.value.summary);
      if (productsRes.status === 'fulfilled') setProductPerf(productsRes.value.products);
      if (hoursRes.status === 'fulfilled') setPeakHours(hoursRes.value.hours);
    } catch {
      // analytics fetch failed silently
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && profile) {
      loadAnalytics();
    }
  }, [activeTab, dateRange]);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Food Saver view -- not yet registered as Mitra
  if (!profile) {
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

  // Mitra view
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

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-[var(--primary)] shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-[var(--primary)] shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analitik
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28">
        {activeTab === 'overview' ? (
          /* === OVERVIEW TAB (existing content) === */
          <div className="space-y-6">
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
        ) : (
          /* === ANALYTICS TAB === */
          <div className="space-y-5">
            {/* Date Range + Export */}
            <div className="flex items-center justify-between">
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
              <CsvExportButton
                from={dateRange.from.toISOString()}
                to={dateRange.to.toISOString()}
                disabled={analyticsLoading}
              />
            </div>

            {/* Revenue Summary */}
            <RevenueSummary
              data={revenueSummary || { totalRevenue: 0, totalSavings: 0, totalOrders: 0, totalItems: 0, averageOrderValue: 0 }}
              loading={analyticsLoading}
            />

            {/* Sales Trend */}
            <SalesTrendChart data={salesTrend} granularity="daily" loading={analyticsLoading} />

            {/* Peak Hours */}
            <PeakHoursChart data={peakHours} loading={analyticsLoading} />

            {/* Product Ranking */}
            <ProductRanking data={productPerf} loading={analyticsLoading} />
          </div>
        )}
      </div>

      {/* FAB - only show on overview tab */}
      {activeTab === 'overview' && (
        <button
          onClick={() => router.push('/seller/add')}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--primary)]/90 transition-colors z-50"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run full test suite**

Run: `cd backend && npm test`
Expected: All existing + new analytics tests PASS

- [ ] **Step 3: Verify visually**

Run: `cd .. && npm run dev` and `cd backend && npm run dev`
- Navigate to `/seller` as a mitra
- Switch to tab "Analitik"
- Verify charts render, date filter works, CSV export downloads file
- Verify "Ringkasan" tab shows existing content unchanged

- [ ] **Step 4: Commit**

```bash
git add src/app/seller/page.tsx
git commit -m "feat(m8): integrate analytics into mitra dashboard

- Add tab navigation: Ringkasan | Analitik
- Integrate SalesTrendChart, RevenueSummary, ProductRanking, PeakHoursChart
- Add shared DateRangeFilter and CsvExportButton
- Analytics data loads on-demand when tab is active
- Keep existing overview tab content unchanged"
```

---

## Self-Review

### 1. Spec Coverage

| Spec Requirement | Task |
|-----------------|------|
| Aggregation queries (daily/weekly/monthly) | Task 1 (granularity param) |
| Sales trend | Task 1 |
| Peak hours | Task 4 |
| Product performance | Task 3 |
| CSV export | Task 5 |
| Enhanced dashboard with charts (sales) | Task 1 |
| Enhanced dashboard with charts (revenue) | Task 2 |
| Enhanced dashboard with charts (items saved) | Task 2 (totalSavings card) |
| Insights cards | Task 2 (RevenueSummary cards) |
| Date range filter | Task 1 (DateRangeFilter) |
| API: `GET /mitra/analytics?...` | Tasks 1-5 (multiple endpoints under /mitra/analytics/*) |

### 2. Placeholder Scan

No TBD, TODO, "implement later", or "add appropriate error handling" patterns found.

### 3. Type Consistency

- `SalesTrendEntry` -- consistent across service, types, route, API client
- `RevenueSummary` -- consistent across service, types, route, API client
- `ProductPerformanceEntry` -- consistent across service, types, route, API client
- `PeakHourEntry` -- consistent across service, types, route, API client
- `AnalyticsQueryParams` -- used consistently across all frontend API functions
- `DateRange` interface -- local to DateRangeFilter, consistent with state in dashboard

### 4. Vertical Slice Check

- Task 1: Backend service + route + validator + types + API client + DateRangeFilter + SalesTrendChart + test = vertical (4 layers)
- Task 2: Backend service extension + route + types + API client + RevenueSummary + test = vertical (4 layers)
- Task 3: Backend service extension + route + types + API client + ProductRanking + test = vertical (4 layers)
- Task 4: Backend service extension + route + types + API client + PeakHoursChart + test = vertical (4 layers)
- Task 5: Backend service extension + route + API client + CsvExportButton + test = vertical (4 layers)
- Task 6: Frontend integration = depends on all prior tasks, integrates 5 components

### 5. HITL/AFK Check

- Tasks 1-5: AFK -- purely code, testable
- Task 6: HITL -- requires visual verification, UX decisions on tab layout are human judgment

### 6. Task Grouping Check

- Sequential Chain 1: Task 1 (establishes analytics pipeline architecture)
- Parallel Batch 1: Tasks 2, 3, 4, 5 -- truly independent, no shared state between them, each adds to a different file section
- Sequential Chain 2: Task 6 -- depends on ALL of 1-5 complete

### 7. Demoability Check

After Task 1: Can demo sales trend chart with date filter in the seller dashboard
After Parallel Batch 1: All analytics sections functional, full data-driven dashboard
After Task 6: Polished UX with tab navigation

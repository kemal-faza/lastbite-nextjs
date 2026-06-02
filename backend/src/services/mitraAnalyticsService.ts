import { prisma } from '../lib/prisma.js';
import type { SalesTrendEntry } from '../types/index.js';

export class AnalyticsError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

function getPeriodKey(date: Date, granularity: 'daily' | 'weekly' | 'monthly'): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  switch (granularity) {
    case 'daily':
      return d.toISOString().slice(0, 10);
    case 'weekly': {
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
      return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    }
    case 'monthly':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}

export async function getSalesTrend(
  mitraId: string,
  from: Date,
  to: Date,
  granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<SalesTrendEntry[]> {
  const products = await prisma.product.findMany({
    where: { mitraId },
    select: { id: true },
  });
  const productIds = products.map((p) => p.id);

  if (productIds.length === 0) {
    return [];
  }

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

  const periodMap = new Map<string, SalesTrendEntry>();

  for (const order of orders) {
    const key = getPeriodKey(order.createdAt, granularity);
    const existing = periodMap.get(key);
    const periodItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

    if (existing) {
      existing.totalOrders += 1;
      existing.totalItems += periodItems;
      existing.totalRevenue += order.totalAmount;
      existing.totalSavings += order.savingAmount;
    } else {
      periodMap.set(key, {
        date: key,
        totalOrders: 1,
        totalItems: periodItems,
        totalRevenue: order.totalAmount,
        totalSavings: order.savingAmount,
      });
    }
  }

  return Array.from(periodMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

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

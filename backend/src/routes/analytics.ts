import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth, requireMitra } from '../middleware/auth.js';
import { getSalesTrend, getRevenueSummary, getProductPerformance, AnalyticsError } from '../services/mitraAnalyticsService.js';
import type { RevenueSummary } from '../services/mitraAnalyticsService.js';
import { analyticsQuerySchema } from '../validators/analytics.js';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

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

import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { findAll, findById, search, ProductNotFoundError } from '../services/productService.js';
import { productQuerySchema, searchQuerySchema } from '../validators/products.js';

export const productsRouter = Router();

productsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = productQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }
    const result = await findAll(parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      });
      return;
    }
    const result = await search(parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const product = await findById(id);
    res.json({ product });
  } catch (err) {
    if (err instanceof ProductNotFoundError) {
      res.status(404).json({ error: err.message, code: 'PRODUCT_NOT_FOUND' });
      return;
    }
    next(err);
  }
});

productsRouter.post('/', requireAuth, (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Belum diimplementasikan', code: 'NOT_IMPLEMENTED' });
});

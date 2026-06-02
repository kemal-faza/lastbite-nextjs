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

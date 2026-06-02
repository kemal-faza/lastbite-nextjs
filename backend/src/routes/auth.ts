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

import { Router, type Request, type Response, type NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.js';
import { register, login, refreshAccessToken, EmailAlreadyExistsError, InvalidCredentialsError, AccountNotVerifiedError } from '../services/authService.js';

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

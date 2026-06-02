import express from 'express';
import cors from 'cors';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { productsRouter } from './routes/products.js';
import { cartRouter } from './routes/cart.js';
import { ordersRouter } from './routes/orders.js';
import { uploadsRouter } from './routes/uploads.js';
import { mitraRouter } from './routes/mitra.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config.js';

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit.', code: 'RATE_LIMITED' },
});

export function createApp() {
  const app = express();

  app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
  }));
  app.use(express.json({ limit: '10kb' }));

  // Serve uploaded files statically (GET /uploads/filename)
  app.use('/uploads', express.static(path.resolve('uploads')));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/auth', authLimiter, authRouter);
  app.use('/users', usersRouter);
  app.use('/products', productsRouter);
  app.use('/cart', cartRouter);
  app.use('/orders', ordersRouter);
  app.use('/uploads', uploadsRouter);
  app.use('/mitra', mitraRouter);

  app.use(errorHandler);

  return app;
}

import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();

// All admin routes require admin role
adminRouter.use(requireAdmin);

// Placeholder dashboard endpoint (fully implemented in Task 7)
adminRouter.get('/dashboard', (_req, res) => {
  res.json({ message: 'Admin dashboard placeholder' });
});

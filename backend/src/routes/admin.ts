import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditLogService.js';
import { listMitraVerifications, verifyMitra } from '../services/adminMitraService.js';
import { verifyMitraSchema, paginationSchema } from '../validators/admin.js';

export const adminRouter = Router();

// All admin routes require admin role
adminRouter.use(requireAdmin);

// ---- Dashboard ----

adminRouter.get('/dashboard', (_req, res) => {
  res.json({ message: 'Admin dashboard placeholder' });
});

// ---- Mitra Verification ----

adminRouter.get('/mitra-verifications', async (req, res) => {
  const query = paginationSchema.parse(req.query);
  const status = req.query.status as 'PENDING' | 'VERIFIED' | 'REJECTED' | undefined;
  const result = await listMitraVerifications({ status, page: query.page, limit: query.limit });
  res.json(result);
});

adminRouter.patch('/mitra-verifications/:id', async (req, res) => {
  const { status } = verifyMitraSchema.parse(req.body);
  const result = await verifyMitra(req.params.id, status, req.user!.userId);

  await createAuditLog({
    actorId: req.user!.userId,
    action: status === 'VERIFIED' ? 'mitra.verify.approve' : 'mitra.verify.reject',
    entity: 'mitra_profile',
    entityId: req.params.id,
    details: { storeName: result.storeName, newStatus: status },
  });

  res.json(result);
});

import { Router } from 'express';
import { getDashboardSummary } from './dashboard.controller';
import { authenticateToken, authorizeRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard-summary', authenticateToken, authorizeRoles(['admin_store']), getDashboardSummary);

export default router;

import { Router } from 'express';
import { getLowStockAlerts, getOutOfStockAlerts } from './alerts.controller';
import { authenticateToken, authorizeRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/low-stock', authenticateToken, authorizeRoles(['admin_store']), getLowStockAlerts);
router.get('/out-of-stock', authenticateToken, authorizeRoles(['admin_store']), getOutOfStockAlerts);

export default router;

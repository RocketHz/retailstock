import { Router } from 'express';
import { addStockMovement, adjustStockLevel } from './stock.controller';

const router = Router();

router.post('/movements', addStockMovement);
router.put('/levels/adjust', adjustStockLevel); // Ruta relativa

export default router;
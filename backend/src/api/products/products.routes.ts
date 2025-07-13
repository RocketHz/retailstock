import { Router } from 'express';
import { addProduct, getProducts, getProductById, updateProduct } from './index';

const router = Router();

router.post('/', addProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);

export default router;

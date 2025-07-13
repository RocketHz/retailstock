import { Router } from 'express';
import { getLocations, addLocation } from './locations.controller';

const router = Router();

router.get('/', getLocations);
router.post('/', addLocation);

export default router;

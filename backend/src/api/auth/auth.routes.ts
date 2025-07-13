import { Router } from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword } from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;

import { Router } from 'express';
import { login, register, getProfile, getUsers } from '../controllers/auth.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', authenticateToken, getProfile);
router.get('/users', authenticateToken, getUsers);

export default router;

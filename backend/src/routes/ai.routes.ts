import { Router } from 'express';
import { getLegalSuggestions } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/analyze', authenticateToken, getLegalSuggestions);

export default router;

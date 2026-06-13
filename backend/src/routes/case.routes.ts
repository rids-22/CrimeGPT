import { Router } from 'express';
import { 
  createCase, getCases, getCaseById, updateCaseStatus, 
  addDiaryEntry, addEvidence, getDashboardStats 
} from '../controllers/case.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateToken, getDashboardStats);
router.post('/', authenticateToken, requireRoles(['IO', 'ADMIN']), createCase);
router.get('/', authenticateToken, getCases);
router.get('/:id', authenticateToken, getCaseById);
router.put('/:id/status', authenticateToken, requireRoles(['IO', 'SHO', 'ADMIN']), updateCaseStatus);
router.post('/:id/diary', authenticateToken, requireRoles(['IO', 'SHO', 'ADMIN']), addDiaryEntry);
router.post('/:id/evidence', authenticateToken, requireRoles(['IO', 'SHO', 'ADMIN']), addEvidence);

export default router;

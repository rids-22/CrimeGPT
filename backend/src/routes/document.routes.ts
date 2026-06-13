import { Router } from 'express';
import { previewDocument, exportDocument } from '../controllers/document.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/preview', authenticateToken, previewDocument);
router.post('/export', authenticateToken, exportDocument);

export default router;

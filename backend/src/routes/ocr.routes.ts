import { Router } from 'express';
import multer from 'multer';
import { processScannedFIR } from '../controllers/ocr.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limit files to 5MB
});

router.post('/upload', authenticateToken, upload.single('file'), processScannedFIR);

export default router;

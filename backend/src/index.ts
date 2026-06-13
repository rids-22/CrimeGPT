import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db';

// Import routers
import authRoutes from './routes/auth.routes';
import caseRoutes from './routes/case.routes';
import aiRoutes from './routes/ai.routes';
import ocrRoutes from './routes/ocr.routes';
import documentRoutes from './routes/document.routes';
import auditRoutes from './routes/audit.routes';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Support large body size for uploading photos / OCR base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'CrimeGPT API Server' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);

import path from 'path';

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unhandled server error occurred.' });
});

// Serve static files from the React frontend build
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

// Fallback all non-API requests to React's index.html (SPA Routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Bootstrapping function
async function bootstrap() {
  try {
    // Connect and verify database tables
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 CrimeGPT Server running in development mode on port ${PORT}`);
      console.log(`👉 API Health Check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to bootstrap CrimeGPT server:', error);
    process.exit(1);
  }
}

bootstrap();

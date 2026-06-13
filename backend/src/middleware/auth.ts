import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'crimegpt_secret_key_2026';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'crimegpt_secret_key_2026')) {
  console.error('❌ CRITICAL SECURITY WARNING: JWT_SECRET environment variable is either unset or using the default fallback key in production!');
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    name: string;
    role: 'IO' | 'SHO' | 'LEGAL_ADVISOR' | 'ADMIN';
    police_station: string;
  };
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    (req as AuthRequest).user = decoded;
    next();
  });
}

export function requireRoles(roles: Array<'IO' | 'SHO' | 'LEGAL_ADVISOR' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(user.role)) {
      return res.status(430).json({ error: `Forbidden: Requires one of these roles: ${roles.join(', ')}` });
    }

    next();
  };
}

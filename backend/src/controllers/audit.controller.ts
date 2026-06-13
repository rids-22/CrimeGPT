import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/db';

export async function getAuditLogs(req: AuthRequest, res: Response) {
  try {
    const actor = req.user;
    if (!actor || actor.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: Requires administrator privilege' });
    }

    const logs = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
    return res.status(200).json(logs.rows);
  } catch (err: any) {
    console.error('Get audit logs controller error:', err);
    return res.status(500).json({ error: 'Internal server error while fetching audit logs' });
  }
}

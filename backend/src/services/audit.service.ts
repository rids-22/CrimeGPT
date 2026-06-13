import { query } from '../config/db';

export async function logAction(userId: number | null, username: string, action: string, modifiedData?: any) {
  try {
    const dataString = modifiedData ? JSON.stringify(modifiedData) : null;
    await query(
      'INSERT INTO audit_logs (user_id, username, action, modified_data) VALUES ($1, $2, $3, $4)',
      [userId, username, action, dataString]
    );
  } catch (err: any) {
    console.error('❌ Failed to write audit log:', err.message);
  }
}

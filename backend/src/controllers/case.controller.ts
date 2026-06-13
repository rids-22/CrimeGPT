import { Response } from 'express';
import { query, queryOne } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { logAction } from '../services/audit.service';

export async function createCase(req: AuthRequest, res: Response) {
  try {
    const actor = req.user;
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const {
      case_number,
      fir_number,
      police_station,
      date_of_incident,
      crime_type,
      location,
      narrative_description,
      victim_name,
      victim_address,
      victim_contact,
      accused_name,
      accused_address,
      accused_photo_url,
      witness_name,
      witness_contact,
    } = req.body;

    // Validate essential fields
    if (!case_number || !fir_number || !police_station || !date_of_incident || !crime_type || !location || !narrative_description || !victim_name || !accused_name) {
      return res.status(400).json({ error: 'Missing mandatory case details' });
    }

    // Check if case_number or fir_number already exists
    const duplicate = await queryOne(
      'SELECT id FROM cases WHERE case_number = $1 OR fir_number = $2',
      [case_number, fir_number]
    );
    if (duplicate) {
      return res.status(400).json({ error: 'Case Number or FIR Number already exists' });
    }

    // Insert case
    const insertSQL = `
      INSERT INTO cases (
        case_number, fir_number, police_station, date_of_incident, crime_type, location,
        narrative_description, victim_name, victim_address, victim_contact,
        accused_name, accused_address, accused_photo_url, witness_name, witness_contact,
        status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id
    `;

    const result = await query(insertSQL, [
      case_number,
      fir_number,
      police_station,
      date_of_incident,
      crime_type,
      location,
      narrative_description,
      victim_name,
      victim_address || '',
      victim_contact || '',
      accused_name,
      accused_address || '',
      accused_photo_url || '',
      witness_name || '',
      witness_contact || '',
      'ACTIVE',
      actor.id
    ]);

    const caseId = result.rows[0]?.id || 1;

    // Create Initial Case Diary Entry
    await query(
      'INSERT INTO case_diary (case_id, entry_type, description, officer_name) VALUES ($1, $2, $3, $4)',
      [
        caseId,
        'FIR_REGISTERED',
        `First Information Report (FIR) registered at ${police_station}. Crime Type: ${crime_type}. Narrative: ${narrative_description.substring(0, 100)}...`,
        actor.name
      ]
    );

    // Write Audit Log
    await logAction(actor.id, actor.username, 'Created Case', { case_number, fir_number, caseId });

    return res.status(201).json({
      message: 'Case registered successfully',
      caseId
    });
  } catch (err: any) {
    console.error('Create case error:', err);
    return res.status(500).json({ error: 'Internal server error while registering case' });
  }
}

export async function getCases(req: AuthRequest, res: Response) {
  try {
    const { search, status, crime_type } = req.query;
    let sql = 'SELECT * FROM cases WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    // Secure access isolation filters
    if (req.user?.role === 'IO') {
      sql += ` AND created_by = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    } else if (req.user?.role === 'SHO') {
      sql += ` AND police_station = $${paramCount}`;
      params.push(req.user.police_station);
      paramCount++;
    }

    if (status) {
      sql += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (crime_type) {
      sql += ` AND crime_type = $${paramCount}`;
      params.push(crime_type);
      paramCount++;
    }

    if (search) {
      sql += ` AND (
        fir_number LIKE $${paramCount} OR 
        case_number LIKE $${paramCount} OR 
        victim_name LIKE $${paramCount} OR 
        accused_name LIKE $${paramCount} OR 
        police_station LIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return res.status(200).json(result.rows);
  } catch (err: any) {
    console.error('Get cases error:', err);
    return res.status(500).json({ error: 'Internal server error while searching cases' });
  }
}

export async function getCaseById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const caseItem = await queryOne('SELECT * FROM cases WHERE id = $1', [id]);

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Access control isolation check
    if (req.user?.role === 'IO' && caseItem.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access Denied: You do not have clearance for this case file.' });
    }
    if (req.user?.role === 'SHO' && caseItem.police_station !== req.user.police_station) {
      return res.status(403).json({ error: 'Access Denied: Case belongs to another police department.' });
    }

    // Fetch evidence
    const evidence = await query('SELECT * FROM evidence WHERE case_id = $1 ORDER BY created_at DESC', [id]);

    // Fetch case diary
    const diary = await query('SELECT * FROM case_diary WHERE case_id = $1 ORDER BY timestamp ASC', [id]);

    return res.status(200).json({
      ...caseItem,
      evidence: evidence.rows,
      diary: diary.rows
    });
  } catch (err: any) {
    console.error('Get case by ID error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateCaseStatus(req: AuthRequest, res: Response) {
  try {
    const actor = req.user;
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { status, description } = req.body; // status: ACTIVE, ARRESTED, CLOSED

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const caseItem = await queryOne('SELECT case_number, status, created_by, police_station FROM cases WHERE id = $1', [id]);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Access control check
    if (actor.role !== 'IO' && actor.role !== 'SHO' && actor.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access Denied: Your role is not authorized to modify case status.' });
    }
    if (actor.role === 'IO' && caseItem.created_by !== actor.id) {
      return res.status(403).json({ error: 'Access Denied: You do not have permission to modify this case status.' });
    }
    if (actor.role === 'SHO' && caseItem.police_station !== actor.police_station) {
      return res.status(403).json({ error: 'Access Denied: Case belongs to another police station.' });
    }

    const oldStatus = caseItem.status;
    await query('UPDATE cases SET status = $1 WHERE id = $2', [status, id]);

    // Create a Diary Entry based on status change
    let entryType = 'CUSTOM';
    let diaryDescription = description || `Status updated from ${oldStatus} to ${status}`;

    if (status === 'ARRESTED') {
      entryType = 'ARREST_MADE';
      diaryDescription = description || 'Accused arrested and taken into police custody.';
    } else if (status === 'CLOSED') {
      entryType = 'COURT_PRODUCTION';
      diaryDescription = description || 'Case closed and filed in court.';
    }

    await query(
      'INSERT INTO case_diary (case_id, entry_type, description, officer_name) VALUES ($1, $2, $3, $4)',
      [id, entryType, diaryDescription, actor.name]
    );

    // Write Audit Log
    await logAction(actor.id, actor.username, `Updated status to ${status}`, { caseId: id, oldStatus, newStatus: status });

    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (err: any) {
    console.error('Update status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addDiaryEntry(req: AuthRequest, res: Response) {
  try {
    const actor = req.user;
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { entry_type, description } = req.body;

    if (!entry_type || !description) {
      return res.status(400).json({ error: 'Entry type and description are required' });
    }

    const caseItem = await queryOne('SELECT created_by, police_station FROM cases WHERE id = $1', [id]);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Access control check
    if (actor.role !== 'IO' && actor.role !== 'SHO' && actor.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access Denied: Your role is not authorized to append to this case diary.' });
    }
    if (actor.role === 'IO' && caseItem.created_by !== actor.id) {
      return res.status(403).json({ error: 'Access Denied: You do not have permission to append to this case diary.' });
    }
    if (actor.role === 'SHO' && caseItem.police_station !== actor.police_station) {
      return res.status(403).json({ error: 'Access Denied: Case belongs to another police station.' });
    }

    await query(
      'INSERT INTO case_diary (case_id, entry_type, description, officer_name) VALUES ($1, $2, $3, $4)',
      [id, entry_type, description, actor.name]
    );

    await logAction(actor.id, actor.username, 'Added Diary Entry', { caseId: id, entry_type });

    return res.status(201).json({ message: 'Case diary entry added successfully' });
  } catch (err: any) {
    console.error('Add diary entry error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addEvidence(req: AuthRequest, res: Response) {
  try {
    const actor = req.user;
    if (!actor) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { type, file_name, file_url } = req.body;

    if (!type || !file_name || !file_url) {
      return res.status(400).json({ error: 'Evidence type, file name, and file URL are required' });
    }

    const caseItem = await queryOne('SELECT created_by, police_station FROM cases WHERE id = $1', [id]);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Access control check
    if (actor.role !== 'IO' && actor.role !== 'SHO' && actor.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access Denied: Your role is not authorized to add evidence.' });
    }
    if (actor.role === 'IO' && caseItem.created_by !== actor.id) {
      return res.status(403).json({ error: 'Access Denied: You do not have permission to add evidence to this case.' });
    }
    if (actor.role === 'SHO' && caseItem.police_station !== actor.police_station) {
      return res.status(403).json({ error: 'Access Denied: Case belongs to another police station.' });
    }

    await query(
      'INSERT INTO evidence (case_id, type, file_name, file_url) VALUES ($1, $2, $3, $4)',
      [id, type, file_name, file_url]
    );

    // Auto-record in Case Diary
    await query(
      'INSERT INTO case_diary (case_id, entry_type, description, officer_name) VALUES ($1, $2, $3, $4)',
      [id, 'EVIDENCE_SEIZED', `Evidence collected: ${type} - File: ${file_name}`, actor.name]
    );

    await logAction(actor.id, actor.username, 'Uploaded Evidence', { caseId: id, type, file_name });

    return res.status(201).json({ message: 'Evidence recorded successfully' });
  } catch (err: any) {
    console.error('Add evidence error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    const totalResult = await query('SELECT count(*) as count FROM cases');
    const activeResult = await query("SELECT count(*) as count FROM cases WHERE status = 'ACTIVE'");
    const arrestedResult = await query("SELECT count(*) as count FROM cases WHERE status = 'ARRESTED'");
    
    // Count generated documents from audit logs
    const docsResult = await query("SELECT count(*) as count FROM audit_logs WHERE action LIKE '%Exported%Document%'");
    
    // Recent logs (Restrict to ADMIN roles only)
    const recentLogs = req.user?.role === 'ADMIN'
      ? await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 6')
      : { rows: [] };

    // Recent case activities (timeline milestones from case_diary joined with cases)
    const recentActivities = await query(`
      SELECT cd.*, c.case_number, c.crime_type 
      FROM case_diary cd
      JOIN cases c ON cd.case_id = c.id
      ORDER BY cd.timestamp DESC 
      LIMIT 8
    `);

    return res.status(200).json({
      total: parseInt(totalResult.rows[0]?.count || '0'),
      active: parseInt(activeResult.rows[0]?.count || '0'),
      arrested: parseInt(arrestedResult.rows[0]?.count || '0'),
      documents: parseInt(docsResult.rows[0]?.count || '0'),
      recentActivities: recentActivities.rows,
      auditLogs: recentLogs.rows
    });
  } catch (err: any) {
    console.error('Get stats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { queryOne } from '../config/db';
import { getDocumentContent, generatePDFBuffer, generateDocxBuffer, DocumentData } from '../services/document.service';
import { logAction } from '../services/audit.service';

export async function previewDocument(req: AuthRequest, res: Response) {
  try {
    const { caseId, type, lang, seizedItems } = req.query;

    if (!caseId || !type || !lang) {
      return res.status(400).json({ error: 'Missing required parameters caseId, type, and lang' });
    }

    // Fetch case details
    const caseRecord = await queryOne('SELECT * FROM cases WHERE id = $1', [caseId]);
    if (!caseRecord) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Access control isolation check
    if (req.user?.role === 'IO' && caseRecord.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access Denied: You do not have clearance for this case file.' });
    }
    if (req.user?.role === 'SHO' && caseRecord.police_station !== req.user.police_station) {
      return res.status(403).json({ error: 'Access Denied: Case belongs to another police department.' });
    }
    if (req.user?.role === 'LEGAL_ADVISOR') {
      return res.status(403).json({ error: 'Access Denied: Legal Advisors are not authorized to preview police documents.' });
    }

    const docData: DocumentData = {
      caseNumber: caseRecord.case_number,
      firNumber: caseRecord.fir_number,
      policeStation: caseRecord.police_station,
      date: caseRecord.date_of_incident,
      officerName: req.user?.name || 'Investigating Officer',
      victimName: caseRecord.victim_name,
      accusedName: caseRecord.accused_name,
      accusedAddress: caseRecord.accused_address,
      crimeType: caseRecord.crime_type,
      location: caseRecord.location,
      seizedItems: seizedItems as string
    };

    const docContent = getDocumentContent(
      type as 'remand' | 'medical' | 'seizure' | 'custody',
      lang as 'en' | 'hi' | 'gu' | 'mr',
      docData
    );

    return res.status(200).json(docContent);
  } catch (err: any) {
    console.error('Preview document error:', err);
    return res.status(500).json({ error: 'Internal server error while previewing document' });
  }
}

export async function exportDocument(req: AuthRequest, res: Response) {
  try {
    const { title, body, format } = req.body; // format: 'pdf' | 'docx'

    if (!title || !body || !format) {
      return res.status(400).json({ error: 'Missing title, body, or format parameter' });
    }

    if (req.user?.role === 'LEGAL_ADVISOR') {
      return res.status(403).json({ error: 'Access Denied: Legal Advisors are not authorized to export police documents.' });
    }

    if (format === 'pdf') {
      const buffer = await generatePDFBuffer(title, body);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
      
      await logAction(req.user?.id || null, req.user?.username || 'SYSTEM', 'Exported PDF Document', { title });
      return res.send(buffer);
    } else if (format === 'docx') {
      const buffer = await generateDocxBuffer(title, body);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.docx"`);

      await logAction(req.user?.id || null, req.user?.username || 'SYSTEM', 'Exported DOCX Document', { title });
      return res.send(buffer);
    } else {
      return res.status(400).json({ error: 'Invalid format. Supported formats are pdf and docx' });
    }
  } catch (err: any) {
    console.error('Export document error:', err);
    return res.status(500).json({ error: 'Internal server error while exporting document' });
  }
}

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyzeNarrative } from '../services/ai.service';

export async function getLegalSuggestions(req: AuthRequest, res: Response) {
  try {
    const { narrative } = req.body;

    if (!narrative) {
      return res.status(400).json({ error: 'Narrative description is required for legal analysis' });
    }

    const suggestions = await analyzeNarrative(narrative);
    return res.status(200).json(suggestions);
  } catch (err: any) {
    console.error('AI Suggestion controller error:', err);
    return res.status(500).json({ error: 'Internal server error while analyzing narrative' });
  }
}

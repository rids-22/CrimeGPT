import { Request, Response } from 'express';
import { performOCR } from '../services/ocr.service';

export async function processScannedFIR(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Please upload an image file of the FIR' });
    }

    console.log(`Received file: ${file.originalname}, Size: ${file.size} bytes`);
    const parsedData = await performOCR(file.buffer, file.originalname);

    return res.status(200).json(parsedData);
  } catch (err: any) {
    console.error('OCR Controller error:', err);
    return res.status(500).json({ error: 'Internal server error during OCR text extraction' });
  }
}

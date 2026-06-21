import path from 'path';
import multer from 'multer';
import { env } from '../config/env';

// In-memory storage: files are kept as Buffers and streamed to Supabase Storage
// by the exam service. No local disk is touched (serverless-friendly).
const storage = multer.memoryStorage();

const ALLOWED = ['.jpg', '.jpeg', '.png', '.pdf', '.dcm', '.dicom', '.webp'];

export const upload = multer({
  storage,
  limits: { fileSize: env.uploads.maxBytes },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED.includes(ext)) return cb(null, true);
    cb(new Error(`Tipo de arquivo não permitido: ${ext}. Use JPG, PNG, PDF, WEBP ou DICOM.`));
  },
});

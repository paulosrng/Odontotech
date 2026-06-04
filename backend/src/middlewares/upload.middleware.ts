import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env';

// Ensure the uploads directory exists at startup.
if (!fs.existsSync(env.uploads.absoluteDir)) {
  fs.mkdirSync(env.uploads.absoluteDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploads.absoluteDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 40);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}-${unique}${ext.toLowerCase()}`);
  },
});

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

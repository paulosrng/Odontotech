import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: required('DATABASE_URL', 'file:./dev.db'),

  jwt: {
    accessSecret: required('JWT_SECRET', 'dev-access-secret'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresDays: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10),
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  uploads: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxBytes: parseInt(process.env.MAX_UPLOAD_MB || '20', 10) * 1024 * 1024,
    absoluteDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  },

  isProd: process.env.NODE_ENV === 'production',
};

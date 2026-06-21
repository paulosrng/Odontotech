import dotenv from 'dotenv';

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
    // '*' (or empty) allows any origin — handy when the API and frontend are
    // served same-origin on Vercel. Otherwise pass a comma-separated list.
    origin: (process.env.CORS_ORIGIN || '*')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  uploads: {
    maxBytes: parseInt(process.env.MAX_UPLOAD_MB || '20', 10) * 1024 * 1024,
  },

  // Supabase Storage — used to persist exam attachments (works on serverless,
  // where the local filesystem is ephemeral/read-only). The service-role key
  // stays server-side only.
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'exams',
    get configured() {
      return Boolean(this.url && this.serviceRoleKey);
    },
  },

  isProd: process.env.NODE_ENV === 'production',
};

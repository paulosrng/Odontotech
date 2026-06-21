/* Idempotently creates the private Storage bucket used for exam files.
   Run with: npm run setup:storage  (reads SUPABASE_* from .env) */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'exams';
const maxMb = parseInt(process.env.MAX_UPLOAD_MB || '20', 10);

async function main() {
  if (!url || !key) {
    throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw new Error(`listBuckets falhou: ${listErr.message}`);

  if (buckets?.some((b) => b.name === bucket)) {
    console.log(`✔ Bucket "${bucket}" já existe (ok).`);
    return;
  }

  const { error } = await supabase.storage.createBucket(bucket, {
    public: false, // exam files are health data — keep private, serve via signed URLs
    fileSizeLimit: `${maxMb}MB`,
  });
  if (error) throw new Error(`createBucket falhou: ${error.message}`);
  console.log(`✔ Bucket "${bucket}" criado (privado, limite ${maxMb}MB).`);
}

main().catch((e) => {
  console.error('✖', e.message);
  process.exit(1);
});

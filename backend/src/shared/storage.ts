/* Supabase Storage helper — persists exam attachments off the local disk so it
   works on serverless/ephemeral filesystems (Vercel, etc.).

   The bucket is PRIVATE (exam files are health data): we store the object path
   in the DB and hand the frontend short-lived signed URLs on read. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!env.supabase.configured) {
    throw new Error(
      'Supabase Storage não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  if (!client) {
    client = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

const SIGNED_URL_TTL = 60 * 60; // 1 hour

/** Upload a file buffer to the exams bucket. Returns the stored object path. */
export async function uploadObject(opts: {
  buffer: Buffer;
  objectName: string; // unique path within the bucket, e.g. "169..-laudo.pdf"
  mimeType?: string;
}): Promise<string> {
  const supabase = getClient();
  const { error } = await supabase.storage
    .from(env.supabase.bucket)
    .upload(opts.objectName, opts.buffer, {
      contentType: opts.mimeType || 'application/octet-stream',
      upsert: false,
    });
  if (error) throw new Error(`Falha ao enviar arquivo para o Storage: ${error.message}`);
  return opts.objectName;
}

/** Create a short-lived signed URL so the frontend can display/download a file. */
export async function signedUrl(objectPath: string): Promise<string | null> {
  if (!env.supabase.configured) return null;
  const supabase = getClient();
  const { data, error } = await supabase.storage
    .from(env.supabase.bucket)
    .createSignedUrl(objectPath, SIGNED_URL_TTL);
  if (error || !data) return null;
  return data.signedUrl;
}

/** Best-effort delete of objects from the bucket. */
export async function deleteObjects(objectPaths: string[]): Promise<void> {
  if (!env.supabase.configured || objectPaths.length === 0) return;
  try {
    await getClient().storage.from(env.supabase.bucket).remove(objectPaths);
  } catch {
    /* best-effort */
  }
}

import { getSupabase } from './supabase';
import { mkdir, readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';

const BUCKET = process.env.SUPABASE_BUCKET ?? 'leak-files';
const LOCAL_DIR = path.join(process.cwd(), '.local-uploads');

function localPath(key: string): string {
  const segments = key.split('/').filter(Boolean);
  const full = path.join(LOCAL_DIR, ...segments);
  const resolvedBase = path.resolve(LOCAL_DIR);
  if (!full.startsWith(resolvedBase + path.sep) && full !== resolvedBase) {
    throw new Error('Invalid storage key');
  }
  return full;
}

export async function uploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production');
    }
    const fp = localPath(key);
    await mkdir(path.dirname(fp), { recursive: true });
    await writeFile(fp, body);
    return;
  }
  const { error } = await supabase.storage.from(BUCKET).upload(key, body, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
}

export async function downloadFile(key: string): Promise<Buffer> {
  const supabase = getSupabase();
  if (!supabase) {
    return readFile(localPath(key));
  }
  const { data, error } = await supabase.storage.from(BUCKET).download(key);
  if (error) throw new Error(`Download failed: ${error.message}`);
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function getSignedUrl(key: string, expiresIn = 300): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Signed URLs require Supabase storage');
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(key, expiresIn);
  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

export async function deleteFile(key: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Delete requires Supabase storage');
  const { error } = await supabase.storage.from(BUCKET).remove([key]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function ensureBucket(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
    if (error) throw new Error(`Bucket creation failed: ${error.message}`);
    console.log(`✓ Created storage bucket: ${BUCKET}`);
  }
}

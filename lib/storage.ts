import { supabase } from './supabase';

const BUCKET = process.env.SUPABASE_BUCKET ?? 'leak-files';

export async function uploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).upload(key, body, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
}

export async function downloadFile(key: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(BUCKET).download(key);
  if (error) throw new Error(`Download failed: ${error.message}`);
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function getSignedUrl(key: string, expiresIn = 300): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(key, expiresIn);
  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

export async function deleteFile(key: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([key]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function ensureBucket(): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
    if (error) throw new Error(`Bucket creation failed: ${error.message}`);
    console.log(`✓ Created storage bucket: ${BUCKET}`);
  }
}

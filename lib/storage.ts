import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'leak_minio',
    secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'leak_minio_secret',
  },
  forcePathStyle: true,
});

const BUCKET = process.env.MINIO_BUCKET ?? 'leak-files';

export async function uploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
}

export async function getFileStream(key: string): Promise<NodeJS.ReadableStream> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return res.Body as NodeJS.ReadableStream;
}

export async function getPresignedUrl(key: string, expiresIn = 300): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

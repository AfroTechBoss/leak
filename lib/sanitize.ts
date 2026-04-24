import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

export async function stripMetadata(buffer: Buffer, mimeType: string): Promise<Buffer> {
  if (mimeType.startsWith('image/')) {
    return stripImageMetadata(buffer);
  }
  if (mimeType === 'application/pdf') {
    return stripPdfMetadata(buffer);
  }
  // Other file types returned as-is (production: LibreOffice for docs, ffmpeg for video)
  return buffer;
}

async function stripImageMetadata(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .withMetadata({ exif: {} })
    .toBuffer();
}

async function stripPdfMetadata(buffer: Buffer): Promise<Buffer> {
  const doc = await PDFDocument.load(buffer);
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  doc.setProducer('');
  doc.setCreator('');
  doc.setCreationDate(new Date(0));
  doc.setModificationDate(new Date(0));
  const stripped = await doc.save();
  return Buffer.from(stripped);
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyCaseCode } from '@/lib/casecode';
import { encryptForServer } from '@/lib/crypto';
import { verifyToken } from '@/lib/auth';
import { stripMetadata } from '@/lib/sanitize';
import { uploadFile } from '@/lib/storage';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

async function uploadAttachments(
  files: File[],
  submissionId: string,
  messageId: string,
): Promise<{ originalName: string; storageKey: string; mimeType: string; sizeBytes: number }[]> {
  const results = [];
  for (const file of files.slice(0, 5)) {
    if (file.size > 50 * 1024 * 1024) continue;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stripped = await stripMetadata(buffer, file.type).catch(() => buffer);
    const key = `${submissionId}/messages/${messageId}/${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await uploadFile(key, stripped, file.type);
    results.push({ originalName: file.name, storageKey: key, mimeType: file.type, sizeBytes: stripped.length });
  }
  return results;
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';
  const isMultipart = contentType.includes('multipart/form-data');

  // Parse either FormData (with files) or JSON (text only)
  let text: string, sender: string, code: string | null, submissionId: string | null;
  let files: File[] = [];

  if (isMultipart) {
    const form = await req.formData();
    text         = (form.get('text') as string) ?? '';
    sender       = (form.get('sender') as string) ?? '';
    code         = form.get('code') as string | null;
    submissionId = form.get('submissionId') as string | null;
    files        = form.getAll('files') as File[];
  } else {
    const body   = await req.json();
    text         = body.text ?? '';
    sender       = body.sender ?? '';
    code         = body.code ?? null;
    submissionId = body.submissionId ?? null;
  }

  if (!text || text.trim().length < 1) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
  }

  const { encrypted, nonce } = encryptForServer(text);

  try {
    if (sender === 'WHISTLEBLOWER') {
      if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

      const submissions = await prisma.submission.findMany();
      const match = await Promise.all(
        submissions.map(async s => ({ s, ok: await verifyCaseCode(code, s.caseCodeHash) }))
      ).then(r => r.find(x => x.ok));

      if (!match) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

      const message = await prisma.message.create({
        data: {
          submissionId: match.s.id,
          sender: 'WHISTLEBLOWER',
          encryptedBody: Buffer.from(encrypted),
          encryptedNonce: Buffer.from(nonce),
        },
      });

      // Upload and link any attached files
      if (files.length > 0) {
        const attachments = await uploadAttachments(files, match.s.id, message.id);
        for (const a of attachments) {
          await prisma.file.create({
            data: {
              submissionId: match.s.id,
              messageId: message.id,
              originalName: a.originalName,
              storageKey: a.storageKey,
              mimeType: a.mimeType,
              sizeBytes: a.sizeBytes,
              strippedAt: new Date(),
            },
          });
        }
      }

    } else if (sender === 'JOURNALIST') {
      if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 });

      const cookieStore = cookies();
      const token = cookieStore.get('leak_token')?.value;
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const journalist = await verifyToken(token);

      const message = await prisma.message.create({
        data: {
          submissionId,
          sender: 'JOURNALIST',
          encryptedBody: Buffer.from(encrypted),
          encryptedNonce: Buffer.from(nonce),
          journalistId: journalist.id,
        },
      });

      // Upload and link any attached files
      if (files.length > 0) {
        const attachments = await uploadAttachments(files, submissionId, message.id);
        for (const a of attachments) {
          await prisma.file.create({
            data: {
              submissionId,
              messageId: message.id,
              originalName: a.originalName,
              storageKey: a.storageKey,
              mimeType: a.mimeType,
              sizeBytes: a.sizeBytes,
              strippedAt: new Date(),
            },
          });
        }
      }

      await prisma.auditLog.create({
        data: {
          submissionId,
          journalistId: journalist.id,
          action: files.length > 0
            ? `Message sent to source with ${files.length} attachment(s)`
            : 'Message sent to source',
        },
      });

    } else {
      return NextResponse.json({ error: 'Invalid sender' }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Message error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

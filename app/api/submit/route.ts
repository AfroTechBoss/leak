import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateCaseCode, hashCaseCode } from '@/lib/casecode';
import { encryptForServer } from '@/lib/crypto';
import { stripMetadata } from '@/lib/sanitize';
import { uploadFile } from '@/lib/storage';
import { NEWSROOMS } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const category = formData.get('category') as string;
    const state = formData.get('state') as string;
    const description = formData.get('description') as string;
    const files = formData.getAll('files') as File[];

    if (!category || !state || !description || description.trim().length < 100) {
      return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });
    }

    // Encrypt description
    const { encrypted, nonce } = encryptForServer(description);

    // Generate case code and hash it — raw code never stored
    const caseCode = generateCaseCode();
    const caseCodeHash = await hashCaseCode(caseCode);

    // Round-robin newsroom assignment (production: smarter routing)
    const newsroom = NEWSROOMS[Math.floor(Math.random() * NEWSROOMS.length)];

    const submission = await prisma.submission.create({
      data: {
        caseCodeHash,
        category,
        state,
        encryptedBody: Buffer.from(encrypted),
        encryptedNonce: Buffer.from(nonce),
        newsroom,
        auditLogs: {
          create: [
            { action: 'Submission received' },
            { action: 'Cryptographic hash generated' },
            { action: `Assigned to ${newsroom}` },
          ],
        },
      },
    });

    // Process and upload files
    for (const file of files.slice(0, 5)) {
      if (file.size > 50 * 1024 * 1024) continue;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const stripped = await stripMetadata(buffer, file.type).catch(() => buffer);
      const key = `${submission.id}/${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      await uploadFile(key, stripped, file.type);
      await prisma.file.create({
        data: {
          submissionId: submission.id,
          originalName: file.name,
          storageKey: key,
          mimeType: file.type,
          sizeBytes: stripped.length,
          strippedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ caseCode }, { status: 201 });
  } catch (err) {
    console.error('Submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

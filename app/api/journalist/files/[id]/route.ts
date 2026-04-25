import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { downloadFile } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const token = cookieStore.get('leak_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let journalist;
  try { journalist = await verifyToken(token); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const file = await prisma.file.findUnique({
    where: { id: params.id },
    include: { submission: true },
  });

  if (!file || file.submission.newsroom !== journalist.newsroom) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const buffer = await downloadFile(file.storageKey);

  await prisma.auditLog.create({
    data: {
      submissionId: file.submissionId,
      journalistId: journalist.id,
      action: `File downloaded: ${file.originalName}`,
    },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': String(buffer.length),
    },
  });
}

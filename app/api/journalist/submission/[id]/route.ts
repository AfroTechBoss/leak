import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { decryptFromWhistleblower } from '@/lib/crypto';
import { cookies } from 'next/headers';
import { Status } from '@prisma/client';

async function getJournalist(token: string | undefined) {
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const journalist = await getJournalist(cookieStore.get('leak_token')?.value);
  if (!journalist) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sub = await prisma.submission.findUnique({
    where: { id: params.id },
    include: {
      files: true,
      messages: { orderBy: { createdAt: 'asc' } },
      auditLogs: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!sub || sub.newsroom !== journalist.newsroom) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let description = '';
  try { description = decryptFromWhistleblower(sub.encryptedBody, sub.encryptedNonce); } catch { description = '[encrypted]'; }

  const messages = sub.messages.map(m => {
    let text = '';
    try { text = decryptFromWhistleblower(m.encryptedBody, m.encryptedNonce); } catch { text = '[encrypted]'; }
    return {
      id: m.id,
      from: m.sender.toLowerCase(),
      time: m.createdAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) + ' · ' +
        m.createdAt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false }),
      text,
    };
  });

  const auditLog = sub.auditLogs.map(e => ({
    action: e.action,
    time: e.createdAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) + ' · ' +
      e.createdAt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false }),
  }));

  await prisma.auditLog.create({
    data: { submissionId: sub.id, journalistId: journalist.id, action: 'Submission detail viewed' },
  });

  return NextResponse.json({
    id: sub.id,
    caseCodePreview: `CASE-${sub.id.slice(0, 8).toUpperCase()}`,
    category: sub.category,
    state: sub.state,
    status: sub.status,
    newsroom: sub.newsroom,
    description,
    files: sub.files.map(f => ({ id: f.id, name: f.originalName, mimeType: f.mimeType, sizeBytes: f.sizeBytes })),
    messages,
    auditLog,
    createdAt: sub.createdAt.toISOString(),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const journalist = await getJournalist(cookieStore.get('leak_token')?.value);
  if (!journalist) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();
  const validStatuses = Object.values(Status);
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const sub = await prisma.submission.findUnique({ where: { id: params.id } });
  if (!sub || sub.newsroom !== journalist.newsroom) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.submission.update({ where: { id: params.id }, data: { status } });
  await prisma.auditLog.create({
    data: { submissionId: params.id, journalistId: journalist.id, action: `Status changed to ${status}` },
  });

  return NextResponse.json({ ok: true });
}

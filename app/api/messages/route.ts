import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyCaseCode } from '@/lib/casecode';
import { encryptForServer } from '@/lib/crypto';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, sender } = body;

  if (!text || text.trim().length < 5) {
    return NextResponse.json({ error: 'Message too short' }, { status: 400 });
  }

  const { encrypted, nonce } = encryptForServer(text);

  try {
    if (sender === 'WHISTLEBLOWER') {
      const { code } = body;
      if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

      const submissions = await prisma.submission.findMany();
      const match = await Promise.all(
        submissions.map(async s => ({ s, ok: await verifyCaseCode(code, s.caseCodeHash) }))
      ).then(r => r.find(x => x.ok));

      if (!match) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

      await prisma.message.create({
        data: {
          submissionId: match.s.id,
          sender: 'WHISTLEBLOWER',
          encryptedBody: Buffer.from(encrypted),
          encryptedNonce: Buffer.from(nonce),
        },
      });
    } else if (sender === 'JOURNALIST') {
      const { submissionId } = body;
      const cookieStore = cookies();
      const token = cookieStore.get('leak_token')?.value;
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const journalist = await verifyToken(token);
      await prisma.message.create({
        data: {
          submissionId,
          sender: 'JOURNALIST',
          encryptedBody: Buffer.from(encrypted),
          encryptedNonce: Buffer.from(nonce),
          journalistId: journalist.id,
        },
      });
      await prisma.auditLog.create({
        data: { submissionId, journalistId: journalist.id, action: 'Message sent to source' },
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

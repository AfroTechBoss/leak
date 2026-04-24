import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyCaseCode } from '@/lib/casecode';
import { decryptFromWhistleblower } from '@/lib/crypto';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  try {
    const submissions = await prisma.submission.findMany({
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    const match = await Promise.all(
      submissions.map(async s => ({
        s,
        ok: await verifyCaseCode(code, s.caseCodeHash),
      }))
    ).then(results => results.find(r => r.ok));

    if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { s } = match;

    const messages = s.messages.map(m => {
      let text = '';
      try { text = decryptFromWhistleblower(m.encryptedBody, m.encryptedNonce); } catch { text = '[encrypted]'; }
      return {
        from: m.sender.toLowerCase(),
        time: m.createdAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) + ' · ' +
          m.createdAt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false }),
        text,
      };
    });

    // Always inject system message
    const systemMsg = {
      from: 'system',
      time: s.createdAt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) + ' · ' +
        s.createdAt.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false }),
      text: `Your submission has been received and assigned to a journalist at ${s.newsroom}.`,
    };

    return NextResponse.json({
      status: s.status,
      newsroom: s.newsroom,
      messages: [systemMsg, ...messages],
    });
  } catch (err) {
    console.error('Status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

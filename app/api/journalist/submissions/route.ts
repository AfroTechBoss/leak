import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { decryptFromWhistleblower } from '@/lib/crypto';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('leak_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let journalist;
  try { journalist = await verifyToken(token); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    where: { newsroom: journalist.newsroom },
    include: { files: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const result = submissions.map(s => {
    let preview = '';
    try {
      const desc = decryptFromWhistleblower(s.encryptedBody, s.encryptedNonce);
      preview = desc.slice(0, 120) + (desc.length > 120 ? '…' : '');
    } catch { preview = '[encrypted]'; }

    return {
      id: s.id,
      caseCodePreview: `CASE-${s.id.slice(0, 8).toUpperCase()}`,
      category: s.category,
      state: s.state,
      status: s.status,
      fileCount: s.files.length,
      newsroom: s.newsroom,
      createdAt: s.createdAt.toISOString(),
      preview,
    };
  });

  const stats = {
    new: result.filter(s => s.status === 'NEW').length,
    underReview: result.filter(s => s.status === 'UNDER_REVIEW').length,
    total: result.length,
    published: result.filter(s => s.status === 'PUBLISHED').length,
  };

  await prisma.auditLog.createMany({
    data: submissions.map(s => ({
      submissionId: s.id,
      journalistId: journalist.id,
      action: 'Viewed by journalist',
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ submissions: result, stats, journalist: { name: journalist.name, newsroom: journalist.newsroom } });
}

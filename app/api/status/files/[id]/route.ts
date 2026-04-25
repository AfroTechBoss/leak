import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyCaseCode } from '@/lib/casecode';
import { downloadFile } from '@/lib/storage';

// GET /api/status/files/[id]?code=<case-code>
// Lets a whistleblower download a file attached to their case, authenticated by case code.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

  const file = await prisma.file.findUnique({
    where: { id: params.id },
    include: { submission: true },
  });

  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Verify the case code matches this file's submission
  const codeMatches = await verifyCaseCode(code, file.submission.caseCodeHash);
  if (!codeMatches) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const buffer = await downloadFile(file.storageKey);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': String(buffer.length),
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

// GET /api/journalist/invite?token=xxx  — validate token (used by the page on load)
export async function GET(req: NextRequest) {
  const rawToken = req.nextUrl.searchParams.get('token');
  if (!rawToken) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const invite = await prisma.journalistInvite.findUnique({ where: { tokenHash } });

  if (!invite) return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
  if (invite.acceptedAt) return NextResponse.json({ error: 'This invite has already been used' }, { status: 410 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });

  return NextResponse.json({
    name: invite.name,
    email: invite.email,
    newsroom: invite.newsroom,
  });
}

// POST /api/journalist/invite  — accept invite and create account
export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { token: rawToken, password } = body;

  if (!rawToken || !password) {
    return NextResponse.json({ error: 'token and password are required' }, { status: 400 });
  }

  if (password.length < 12) {
    return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const invite = await prisma.journalistInvite.findUnique({ where: { tokenHash } });

  if (!invite) return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
  if (invite.acceptedAt) return NextResponse.json({ error: 'This invite has already been used' }, { status: 410 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });

  // Check journalist doesn't already exist (race condition guard)
  const existing = await prisma.journalist.findUnique({ where: { email: invite.email } });
  if (existing) return NextResponse.json({ error: 'Account already exists' }, { status: 409 });

  const passwordHash = await hashPassword(password);

  // Create journalist account + mark invite accepted in a transaction
  await prisma.$transaction([
    prisma.journalist.create({
      data: {
        email: invite.email,
        name: invite.name,
        newsroom: invite.newsroom,
        passwordHash,
      },
    }),
    prisma.journalistInvite.update({
      where: { tokenHash },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

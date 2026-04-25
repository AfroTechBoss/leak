import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendInviteEmail } from '@/lib/email';
import { NEWSROOMS } from '@/lib/constants';
import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isValidNewsroom(n: string): boolean {
  return (NEWSROOMS as readonly string[]).includes(n);
}

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-admin-secret');
  return ADMIN_SECRET && auth === ADMIN_SECRET;
}

// GET — used by the admin page to verify the secret before showing the panel
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

// POST — create invite and send email
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { email?: string; name?: string; newsroom?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, name, newsroom } = body;

  if (!email || !name || !newsroom) {
    return NextResponse.json({ error: 'email, name, and newsroom are required' }, { status: 400 });
  }

  const emailLower = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  if (!isValidNewsroom(newsroom)) {
    return NextResponse.json({ error: 'Invalid newsroom' }, { status: 400 });
  }

  try {
    // Check if journalist already has an active account
    const existing = await prisma.journalist.findUnique({ where: { email: emailLower } });
    if (existing) {
      return NextResponse.json({ error: 'A journalist with this email already exists' }, { status: 409 });
    }

    // Generate a cryptographically secure token (32 bytes = 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Upsert invite — re-inviting same email refreshes the token and expiry
    await prisma.journalistInvite.upsert({
      where: { email: emailLower },
      update: { name: name.trim(), newsroom, tokenHash, expiresAt, acceptedAt: null },
      create: { email: emailLower, name: name.trim(), newsroom, tokenHash, expiresAt },
    });

    // Send the invite email
    await sendInviteEmail({ to: emailLower, name: name.trim(), newsroom, token: rawToken });

    return NextResponse.json({ ok: true, message: `Invite sent to ${emailLower}` }, { status: 201 });
  } catch (err) {
    console.error('Invite error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to send invite: ${message}` }, { status: 500 });
  }
}

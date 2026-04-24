import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const journalist = await prisma.journalist.findUnique({ where: { email } });
  if (!journalist) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await verifyPassword(password, journalist.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signToken({
    id: journalist.id,
    email: journalist.email,
    name: journalist.name,
    newsroom: journalist.newsroom,
  });

  const cookieStore = cookies();
  cookieStore.set('leak_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete('leak_token');
  return NextResponse.json({ ok: true });
}

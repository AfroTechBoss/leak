import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
);

const JOURNALIST_PATHS = ['/journalist/dashboard', '/journalist/submission'];
// /journalist/invite is intentionally public — no auth required

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exclude invite accept pages from journalist auth guard
  if (pathname.startsWith('/journalist/invite')) return NextResponse.next();
  if (pathname === '/api/journalist/invite') return NextResponse.next();

  const isJournalistPage = JOURNALIST_PATHS.some(p => pathname.startsWith(p));
  const isJournalistApi = pathname.startsWith('/api/journalist/submissions') ||
    (pathname.startsWith('/api/journalist/submission') && !pathname.includes('/auth')) ||
    pathname.startsWith('/api/journalist/files');

  if (!isJournalistPage && !isJournalistApi) return NextResponse.next();

  const token = req.cookies.get('leak_token')?.value;
  if (!token) {
    if (isJournalistApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/journalist/login', req.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (isJournalistApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/journalist/login', req.url));
  }
}

export const config = {
  matcher: [
    '/journalist/dashboard/:path*',
    '/journalist/submission/:path*',
    '/journalist/invite/:path*',
    '/api/journalist/:path*',
  ],
};

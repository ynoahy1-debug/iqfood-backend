import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')?.value;

  if (!adminToken || adminToken !== 'iqfood_admin_secure_token_v1') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/posts/:path*',
    '/reports/:path*',
    '/profanity/:path*',
    '/subscriptions/:path*',
    '/recipes/:path*',
    '/restaurants/:path*',
    '/collections/:path*',
    '/users/:path*',
  ],
};

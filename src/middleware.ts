import { NextResponse, type NextRequest } from 'next/server';

const MITRA_PATHS = ['/', '/search', '/cart', '/profile'];
const MITRA_PREFIX = '/product';

const ADMIN_PATHS = ['/', '/search', '/cart', '/profile'];
const ADMIN_PREFIX = '/product';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('user-role')?.value;

  // Skip middleware for login, register, verify-otp, API routes, static files
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify-otp') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // No role cookie = guest (allow all)
  if (!role) {
    return NextResponse.next();
  }

  // ADMIN guard: block non-ADMIN from /admin/*
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // MITRA guard: block non-MITRA from /seller/* (except /seller/register)
  if (pathname.startsWith('/seller') && role !== 'MITRA' && pathname !== '/seller/register') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // MITRA on consumer paths → redirect to /seller
  if (role === 'MITRA') {
    const isMitraBlocked =
      MITRA_PATHS.includes(pathname) || pathname.startsWith(MITRA_PREFIX);
    if (isMitraBlocked) {
      return NextResponse.redirect(new URL('/seller', request.url));
    }
  }

  // ADMIN on consumer paths → redirect to /admin
  if (role === 'ADMIN') {
    const isAdminBlocked =
      ADMIN_PATHS.includes(pathname) || pathname.startsWith(ADMIN_PREFIX);
    if (isAdminBlocked) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon|.*\\.).*)'],
};

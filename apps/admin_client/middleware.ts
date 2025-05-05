// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeToken } from '@/lib/auth'; // Uses jose now

// Specify paths to protect
export const config = {
  matcher: [
      '/quizzes/:path*', // Protect quizzes and any sub-paths
      '/resources/:path*', // Protect resources and any sub-paths
      // Add other admin paths here if needed
  ],
};

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('auth_token');
  const token = tokenCookie?.value;
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Checking path: ${pathname}`);
  console.log(`[Middleware] Token found in cookie: ${!!token}`);

  if (!token) {
    console.log('[Middleware] No token, redirecting to signin.');
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    // Optional: Pass intended destination for redirect after login
    // url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const decodedPayload = await decodeToken(token);

    if (!decodedPayload) {
      console.log('[Middleware] Invalid/expired token (decodeToken returned null), redirecting to signin.');
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      // Clear the invalid cookie by setting expiry in the past during redirect
      const response = NextResponse.redirect(url);
      response.cookies.set('auth_token', '', { path: '/', expires: new Date(0) });
      return response;
    }

    // Optional: Add role check if needed later
    // if (decodedPayload.role !== 'admin') { ... }

    console.log(`[Middleware] Auth successful for ${pathname}. Allowing request.`);
    return NextResponse.next(); // Allow request

  } catch (error) {
     // Should ideally be caught by decodeToken, but safety net
    console.error('[Middleware] Unexpected error during token validation:', error);
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }
}
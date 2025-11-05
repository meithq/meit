import { NextResponse, type NextRequest } from 'next/server';

/**
 * Minimal middleware - authentication is now handled client-side by AuthContext
 *
 * This middleware DOES NOT block navigation for auth checks.
 * The AuthContext (with React Query caching) handles:
 * - Session validation (cached for 5 minutes)
 * - Route protection (client-side redirects)
 * - Auth state management
 *
 * Benefits of client-side auth (like Finaena):
 * - No 500ms-2s blocking on every navigation
 * - Instant page transitions
 * - React Query caching prevents redundant auth checks
 * - Better UX with optimistic UI
 */
export async function middleware(request: NextRequest) {
  // Just pass through - let client handle auth
  return NextResponse.next();
}

// Only run on app routes (not static files)
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

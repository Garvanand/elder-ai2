import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Bypass auth for public routes and static assets
  const publicPaths = ['/', '/auth', '/api', '/favicon.ico']
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
  const isStaticAsset = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$/i.test(pathname)

  if (isPublicPath || isStaticAsset) {
    return NextResponse.next()
  }

  // 2. DEV MODE: Bypass auth checks if configured
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') {
    return NextResponse.next()
  }

  // 3. Auth check for protected routes
  const sessionToken = request.cookies.get('sb-access-token')?.value ||
                       request.cookies.get('supabase-auth-token')?.value

  const protectedRoutes = ['/elder', '/caregiver']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !sessionToken) {
    const url = new URL('/auth', request.url)
    // Add original path as redirect param if needed, but keeping it simple for now
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}


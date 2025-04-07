import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname
  
  console.log('[Middleware] Processing path:', pathname)

  // Redirect explore to home page - 將這部分移至頂部，確保最高優先級處理
  if (pathname === '/explore' || pathname === '/shop') {
    console.log(`[Middleware] Redirecting ${pathname} to homepage`)
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // PUBLIC PATHS: Always allow these paths regardless of auth status
  const publicPaths = [
    '/login', 
    '/signup', 
    '/auth/callback', 
    '/auth-debug', 
    '/reset-password',
    '/api/',
    '/_next/'
  ]
  
  // Check if current path matches any public path
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith(path)
  )
  
  // 更詳細地記錄 cookie
  const allCookies = request.cookies.getAll()
  console.log('[Middleware] All cookies:', allCookies.map(c => ({name: c.name, value: c.name.includes('token') ? '***' : c.value})))
  
  // Don't run auth checks for public paths
  if (isPublicPath) {
    console.log('[Middleware] Public path detected, skipping auth check:', pathname)
    return response
  }
  
  // Allow static assets to be served directly
  if (
    pathname.startsWith('/assets/') || 
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/Footer_Image/') ||
    pathname.endsWith('.html') || 
    pathname.endsWith('.js') || 
    pathname.endsWith('.css') || 
    pathname.endsWith('.png') || 
    pathname.endsWith('.jpg') || 
    pathname.endsWith('.svg') || 
    pathname.endsWith('.ico')
  ) {
    console.log('[Middleware] Serving static file:', pathname)
    return response
  }

  // Check if the user is already authenticated
  try {
    const supabase = createMiddlewareClient({ req: request, res: response })
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[Middleware] Error in getSession:', error)
    }
    
    console.log('[Middleware] Session data:', data.session ? 'Session exists' : 'No session')
    if (data.session) {
      console.log('[Middleware] User authenticated:', data.session.user.email || data.session.user.id)
    }
    
    // Auth check - ONLY using Supabase session
    const isAuthenticated = !!data.session
    console.log('[Middleware] User authentication status:', isAuthenticated)
    
    // Direct access to admin UI
    if (pathname === '/admin') {
      if (!isAuthenticated) {
        console.log('[Middleware] Admin route accessed by unauthenticated user, redirecting to login')
        const redirectUrl = `/login?redirectTo=${encodeURIComponent(pathname)}`
        console.log('[Middleware] Redirect URL:', redirectUrl)
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
      
      console.log('[Middleware] Admin route detected for authenticated user, redirecting to tables-basic.html')
      const adminUrl = new URL('/tables-basic.html', request.url)
      console.log('[Middleware] Admin URL:', adminUrl.toString())
      return NextResponse.redirect(adminUrl)
    }

    // If user is already logged in and trying to access login page, redirect to home or the specified redirectTo
    if (isAuthenticated && pathname === '/login') {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/'
      console.log('[Middleware] User already logged in, redirecting from login to:', redirectTo)
      try {
        const redirectUrl = new URL(decodeURIComponent(redirectTo), request.url)
        console.log('[Middleware] Full redirect URL:', redirectUrl.toString())
        return NextResponse.redirect(redirectUrl)
      } catch (error) {
        console.error('[Middleware] Error redirecting to:', redirectTo, error)
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Protected routes - redirect to login if not authenticated
    if (!isAuthenticated && 
        (pathname.startsWith('/recipe-generator') || 
         pathname.startsWith('/admin') || 
         pathname.startsWith('/profile/edit'))) {
      console.log('[Middleware] Protected route accessed by unauthenticated user, redirecting to login')
      const redirectUrl = `/login?redirectTo=${encodeURIComponent(pathname)}`
      console.log('[Middleware] Redirect URL:', redirectUrl)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Set auth state in response headers for client-side awareness
    response.headers.set('x-middleware-auth', isAuthenticated ? 'authenticated' : 'unauthenticated')
    
    return response
  } catch (error) {
    console.error('[Middleware] Critical error in middleware:', error)
    // Fall back to allowing the request through in case of errors
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico).*)',
  ],
} 
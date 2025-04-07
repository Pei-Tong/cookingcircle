import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  console.log('[Middleware] Processing path:', pathname)

  // Redirect explore to home page
  if (pathname === '/explore' || pathname === '/shop') {
    console.log(`[Middleware] Redirecting ${pathname} to homepage`)
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow static assets to be served directly
  if (
    pathname.startsWith('/assets/') || 
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
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('[Middleware] Error in getSession:', error)
  }
  
  const isAuthenticated = !!data.session
  console.log('[Middleware] User authentication status:', isAuthenticated)

  // Direct access to admin UI - highest priority
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

  // Allow direct access to login and callback routes for unauthenticated users
  if (!isAuthenticated && (pathname === '/login' || pathname.startsWith('/auth/callback'))) {
    console.log('[Middleware] Allowing access to auth route for unauthenticated user')
    return response
  }

  // Protected routes - redirect to login if not authenticated
  if (!isAuthenticated && 
      (pathname.startsWith('/my-recipes') || 
       pathname.startsWith('/recipe-generator') ||
       pathname === '/shopping-list' || 
       pathname === '/create-recipe')) {
    console.log('[Middleware] Protected route accessed by unauthenticated user, redirecting to login')
    const redirectUrl = `/login?redirectTo=${encodeURIComponent(pathname)}`
    console.log('[Middleware] Redirect URL:', redirectUrl)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/login',
    '/admin',
    '/my-recipes/:path*',
    '/recipe-generator/:path*',
    '/auth/callback',
    '/explore',
    '/shopping-list',
    '/shop',
    '/create-recipe',
  ],
} 
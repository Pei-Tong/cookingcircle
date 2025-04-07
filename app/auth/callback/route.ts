import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';
  
  console.log('[Auth Callback] Triggered with:', { 
    codeExists: !!code,
    redirectTo,
    url: request.url
  });

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[Auth Callback] Error exchanging code for session:', error);
      } else {
        console.log('[Auth Callback] Session created successfully, user:', data?.user?.email);
      }
    } catch (error) {
      console.error('[Auth Callback] Exception exchanging code for session:', error);
    }
  } else {
    console.warn('[Auth Callback] No code parameter found in request');
  }

  // 正確組合重定向 URL
  try {
    const decodedRedirectTo = decodeURIComponent(redirectTo);
    const fullRedirectUrl = new URL(
      decodedRedirectTo.startsWith('http') 
        ? decodedRedirectTo 
        : decodedRedirectTo,
      decodedRedirectTo.startsWith('http') ? undefined : request.url
    );
    
    console.log('[Auth Callback] Redirecting to:', fullRedirectUrl.toString());
    return NextResponse.redirect(fullRedirectUrl);
  } catch (error) {
    console.error('[Auth Callback] Error creating redirect URL:', error);
    // 如果解析失敗，重定向到首頁
    return NextResponse.redirect(new URL('/', request.url));
  }
} 
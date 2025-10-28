/**
 * Supabase Authentication Callback Handler
 *
 * Handles the OAuth callback and exchanges the code for a session.
 * Required for email/password and OAuth authentication flows.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/ask-expert';

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successfully authenticated, redirect to the next page
      return NextResponse.redirect(new URL(next, request.url));
    }

    console.error('[Auth Callback] Error exchanging code for session:', error);
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
}

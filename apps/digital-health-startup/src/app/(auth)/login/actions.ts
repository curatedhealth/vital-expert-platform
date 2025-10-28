/**
 * Server Actions for Authentication
 *
 * Following Supabase SSR best practices:
 * - All auth operations happen on the server
 * - Cookies are properly managed server-side
 * - No client-side redirect issues
 */
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string || '/ask-expert';  // ✅ FIXED: Changed from '/dashboard' to '/ask-expert'

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
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting might fail in Server Components
            // Middleware will handle it on the next request
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignore errors
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Return error to client
    return { error: error.message };
  }

  if (data.session) {
    // Authentication successful
    // Redirect will be handled by Next.js with proper cookie management
    redirect(redirectTo);
  }

  return { error: 'Authentication failed - no session created' };
}

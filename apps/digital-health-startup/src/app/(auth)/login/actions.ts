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
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string || '/dashboard';  // Default to dashboard

    // Validate input
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    const cookieStore = await cookies();

    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Login] Missing Supabase environment variables');
      return { error: 'Server configuration error. Please contact support.' };
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
              console.warn('[Login] Cookie set failed:', error);
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Ignore errors
              console.warn('[Login] Cookie remove failed:', error);
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // Return error to client as JSON
      console.error('[Login] Authentication error:', error.message);
      return { error: error.message };
    }

    if (!data.session) {
      return { error: 'Authentication failed - no session created' };
    }

    // Authentication successful - redirect (this throws a special Next.js error)
    // The redirect error is expected and will be caught by Next.js
    redirect(redirectTo);
    
  } catch (error: any) {
    // Handle redirect errors (Next.js redirect throws a special error)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      // This is a Next.js redirect - re-throw it
      throw error;
    }
    
    // Handle other errors
    console.error('[Login] Unexpected error:', error);
    return { 
      error: error?.message || 'An unexpected error occurred during login. Please try again.' 
    };
  }
}

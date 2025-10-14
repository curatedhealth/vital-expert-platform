/**
 * Server-only Supabase utilities
 * CRITICAL: Never import this in client components
 */

export function getServiceRoleKey(): string {
  // Prevent client-side usage
  if (typeof window !== 'undefined') {
    throw new Error('Service role key cannot be accessed on client side');
  }
  
  // Prevent Edge runtime without proper RLS
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('Service role key usage on Edge requires explicit RLS hardening');
  }
  
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  
  return key;
}


import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// SECURITY: Only use environment variables - no fallback credentials
// This ensures we fail safely if .env.local is not configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
  );
}

// Singleton instance to prevent multiple GoTrueClient warnings
let clientInstance: SupabaseClient | null = null;

// Create a browser client that properly handles cookies for SSR
export const createClient = (): SupabaseClient => {
  // Return existing instance if already created
  if (clientInstance) {
    return clientInstance;
  }

  // Create new instance only if none exists
  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  return clientInstance;
};

// Export the singleton instance directly
export const supabase = createClient();


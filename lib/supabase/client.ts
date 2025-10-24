import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Get Supabase configuration from environment variables
 * Throws error if required variables are not set
 */
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please set it in your .env.local file.'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Please set it in your .env.local file.'
    );
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    throw new Error(
      `Invalid SUPABASE_URL format: ${supabaseUrl}. ` +
      'URL must start with http:// or https://'
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Create a function that returns a new Supabase client
export const createClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};

// Export a lazy-loaded default instance for backward compatibility
let _supabase: any = null;
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!_supabase) {
      _supabase = createClient();
    }
    return _supabase[prop];
  }
});

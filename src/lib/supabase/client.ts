import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create a function that returns a new Supabase client
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
};

// Export a singleton instance to prevent multiple client warnings
let _supabase: any = null;
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!_supabase) {
      console.log('🌐 Supabase Client - Using Cloud Instance:', supabaseUrl);
      _supabase = createClient();
    }
    return _supabase[prop];
  }
});

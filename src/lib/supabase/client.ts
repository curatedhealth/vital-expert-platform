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
  console.log('🌐 Supabase Client - Using Cloud Instance:', supabaseUrl);
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
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

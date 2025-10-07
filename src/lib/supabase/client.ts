import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a function that returns a new Supabase client
export const createClient = () => {
  // Validate URL format to prevent Supabase validation errors
  const validUrl = supabaseUrl.startsWith('https://') ? supabaseUrl : 'https://placeholder.supabase.co';
  return createSupabaseClient(validUrl, supabaseAnonKey);
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

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a function that returns a new Supabase client
export const createClient = () => {
  // For production, use the actual Supabase URL
  // For development with local Supabase, use the local URL
  const validUrl = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost') 
    ? supabaseUrl 
    : supabaseUrl.startsWith('https://') 
      ? supabaseUrl 
      : 'https://placeholder.supabase.co';
      
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

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton instance to prevent multiple GoTrueClient warnings
let clientInstance: SupabaseClient | null = null;

// Create a function that returns a singleton Supabase client
export const createClient = (): SupabaseClient => {
  // Return existing instance if already created
  if (clientInstance) {
    return clientInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Create new instance only if none exists
  clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
};

// Export a lazy-loaded default instance for backward compatibility
let _supabaseInstance: SupabaseClient | null = null;
export const _supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    if (!_supabaseInstance) {
      _supabaseInstance = createClient();
    }
    return (_supabaseInstance as any)[prop];
  }
});

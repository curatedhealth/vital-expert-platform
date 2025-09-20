import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔧 Supabase Config:', {
  environment: process.env.NODE_ENV,
  url: supabaseUrl,
  keySource: 'env'
});

// Create a function that returns a new Supabase client
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};

// Export the default instance for backward compatibility
export const supabase = createClient();

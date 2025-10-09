import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration - Cloud Instance Only
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY';

// Create a function that returns a new Supabase client - Cloud Instance Only
export const createClient = () => {
  // Always use cloud instance - local Supabase is deprecated
  const validUrl = supabaseUrl.startsWith('https://') 
    ? supabaseUrl 
    : 'https://xazinxsiglqokwfmogyk.supabase.co';
    
  console.log('🌐 Supabase Client - Using Cloud Instance:', validUrl);
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

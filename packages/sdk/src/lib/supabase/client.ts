import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://bomltkhixeatxuoxmolq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3ODM5MTUsImV4cCI6MjA3ODM1OTkxNX0.wJICHy82PKz4O9CTfeZ34sd5hjlXIkZBt0M-57zN9WU';

// Singleton instance to prevent multiple GoTrueClient warnings (survives HMR)
const globalForSdkSupabase = globalThis as typeof globalThis & {
  __vitalSdkSupabaseClient?: SupabaseClient | null;
};

let clientInstance: SupabaseClient | null =
  globalForSdkSupabase.__vitalSdkSupabaseClient ?? null;

// Create a function that returns a singleton Supabase client
export const createClient = (): SupabaseClient => {
  // Return existing instance if already created
  if (clientInstance) {
    return clientInstance;
  }

  // For production, use the actual Supabase URL
  // For development with local Supabase, use the local URL
  const validUrl = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost') 
    ? supabaseUrl 
    : supabaseUrl.startsWith('https://') 
      ? supabaseUrl 
      : 'https://bomltkhixeatxuoxmolq.supabase.co';
      
  // Create new instance only if none exists
  clientInstance = createSupabaseClient(validUrl, supabaseAnonKey);
  globalForSdkSupabase.__vitalSdkSupabaseClient = clientInstance;
  return clientInstance;
};

// Export a lazy-loaded default instance for backward compatibility
let _supabase: any = null;
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = _supabase ?? createClient();
    _supabase = client;
    return (client as any)[prop];
  }
});

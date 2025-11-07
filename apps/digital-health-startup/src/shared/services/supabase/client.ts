/**
 * ⚠️ CRITICAL: SINGLETON PATTERN REQUIRED ⚠️
 * 
 * This file MUST use a singleton pattern to prevent multiple GoTrueClient instances.
 * 
 * PROBLEM: Creating multiple Supabase clients causes:
 * - "Multiple GoTrueClient instances detected" warnings
 * - Undefined behavior when used concurrently
 * - Authentication state conflicts
 * - User session not persisting correctly
 * - Agents being cleared due to missing user ID
 * 
 * SOLUTION: Always return the same client instance.
 * 
 * ⚠️ DO NOT MODIFY THIS PATTERN ⚠️
 * - Never create a new client on each call
 * - Always check for existing instance first
 * - Always return the singleton instance
 * 
 * If you need a different client configuration, create a separate file
 * with its own singleton pattern, or use a factory function that maintains
 * separate singleton instances per configuration.
 */

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * SINGLETON INSTANCE - SURVIVES HOT MODULE REPLACEMENT
 * 
 * ✅ PRODUCTION-READY FIX: Store singleton in globalThis to survive HMR
 * 
 * PROBLEM: Module-level variables get reset during Fast Refresh/HMR, creating new instances.
 * SOLUTION: Use globalThis to store the singleton, which persists across HMR cycles.
 * 
 * This variable holds the single Supabase client instance for the entire application.
 * Multiple instances cause authentication conflicts and "Multiple GoTrueClient" warnings.
 */

// Extend globalThis to include our singleton
declare global {
  // eslint-disable-next-line no-var
  var __supabaseSharedClient: SupabaseClient | undefined;
}

// Use globalThis to survive HMR (Hot Module Replacement)
const getClientInstance = (): SupabaseClient | null => {
  return globalThis.__supabaseSharedClient || null;
};

const setClientInstance = (client: SupabaseClient): void => {
  globalThis.__supabaseSharedClient = client;
};

/**
 * Create or return the singleton Supabase client instance.
 * 
 * ⚠️ CRITICAL: This function MUST return the same instance every time.
 * 
 * @returns The singleton Supabase client instance
 * 
 * @example
 * // ✅ CORRECT: Always use the same instance
 * const client = createClient();
 * const client2 = createClient(); // Returns same instance as client
 * 
 * // ❌ WRONG: Don't create new instances
 * const client = createSupabaseClient(url, key); // Creates new instance!
 */
export const createClient = (): SupabaseClient => {
  // ✅ Check globalThis for existing instance (survives HMR)
  const existingInstance = getClientInstance();
  if (existingInstance) {
    return existingInstance;
  }

  // Create new instance only if none exists
  // ⚠️ This should only execute once per application lifecycle (even across HMR)
  const newInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // ⚠️ CRITICAL: Use same storage key to prevent conflicts
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  // ✅ Store in globalThis to survive HMR
  setClientInstance(newInstance);
  
  return newInstance;
};

/**
 * Export the default instance for backward compatibility.
 * 
 * ⚠️ NOTE: This uses the singleton pattern via createClient(),
 * so it's safe to use directly or call createClient() - both return the same instance.
 */
export const _supabase = createClient();

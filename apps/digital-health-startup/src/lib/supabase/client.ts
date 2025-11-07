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
 * This is the PRIMARY client used by the auth context (@/lib/auth/supabase-auth-context).
 * If you modify this, authentication will break and agents will be cleared.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY';

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
 * 
 * ⚠️ CRITICAL: This is used by SupabaseAuthProvider which provides user authentication.
 * If multiple instances exist, user?.id will be undefined and agents will be cleared.
 */

// Extend globalThis to include our singleton
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient | undefined;
}

// Use globalThis to survive HMR (Hot Module Replacement)
// This ensures the singleton persists across Fast Refresh cycles
const getClientInstance = (): SupabaseClient | null => {
  return globalThis.__supabaseClient || null;
};

const setClientInstance = (client: SupabaseClient): void => {
  globalThis.__supabaseClient = client;
};

/**
 * Create or return the singleton Supabase browser client instance.
 * 
 * ⚠️ CRITICAL: This function MUST return the same instance every time.
 * This is used by the auth context - if you create multiple instances, authentication breaks.
 * 
 * Uses @supabase/ssr's createBrowserClient for proper SSR/cookie handling.
 * 
 * @returns The singleton Supabase client instance
 * 
 * @example
 * // ✅ CORRECT: Always use the same instance
 * const client = createClient();
 * const client2 = createClient(); // Returns same instance as client
 * 
 * // ❌ WRONG: Don't create new instances
 * const client = createBrowserClient(url, key); // Creates new instance!
 */
export const createClient = (): SupabaseClient => {
  // ✅ Check globalThis for existing instance (survives HMR)
  const existingInstance = getClientInstance();
  if (existingInstance) {
    return existingInstance;
  }

  // Create new instance only if none exists
  // ⚠️ This should only execute once per application lifecycle (even across HMR)
  const newInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // ⚠️ CRITICAL: Use same storage key to prevent conflicts
      // If different clients use different storage, auth state won't sync
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  // ✅ Store in globalThis to survive HMR
  setClientInstance(newInstance);
  
  return newInstance;
};

/**
 * Export the singleton instance directly for convenience.
 * 
 * ⚠️ NOTE: This uses the singleton pattern via createClient(),
 * so it's safe to use directly or call createClient() - both return the same instance.
 * 
 * This is the instance used by SupabaseAuthProvider in @/lib/auth/supabase-auth-context.
 */
export const supabase = createClient();


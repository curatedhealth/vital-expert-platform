/**
 * Supabase Client for Edge Runtime
 *
 * Lightweight Supabase client for Vercel Edge functions.
 * Provides RLS-aware database access with minimal bundle size.
 *
 * Features:
 * - Edge runtime compatible (50KB bundle)
 * - Row-Level Security (RLS) enforcement
 * - Type-safe queries with generated types
 * - Real-time subscriptions
 * - Storage access
 *
 * @module lib/db/supabase/client
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY');
}

// ============================================================================
// SINGLETON INSTANCES - PRODUCTION-READY FIX FOR "Multiple GoTrueClient" ISSUE
// ============================================================================

/**
 * ⚠️ CRITICAL FIX: Prevent "Multiple GoTrueClient instances" warnings
 * 
 * PROBLEM:
 * - The previous factory functions created NEW instances on every call
 * - This caused "Multiple GoTrueClient instances" warnings
 * - This caused Map maximum size exceeded errors
 * - This caused authentication state conflicts
 * 
 * SOLUTION:
 * - Use singleton pattern to return the same instance
 * - Only create instances once per application lifecycle
 * - Store instances in module-level variables
 */

let browserClientInstance: ReturnType<typeof createClient<Database>> | null = null;
let serverClientInstance: ReturnType<typeof createClient<Database>> | null = null;
let adminClientInstance: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Create Supabase client for browser/client-side (SINGLETON)
 *
 * ✅ PRODUCTION-READY: Returns the same instance on every call
 * Uses anon key with RLS enabled.
 * Suitable for client-side code.
 *
 * @returns Supabase client with RLS (singleton instance)
 */
export function createBrowserClient() {
  // Return existing instance if already created
  if (browserClientInstance) {
    return browserClientInstance;
  }

  // Create new instance only once
  browserClientInstance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  );

  return browserClientInstance;
}

/**
 * Create Supabase client for server-side/Edge Runtime (SINGLETON)
 *
 * ✅ PRODUCTION-READY: Returns the same instance on every call
 * Uses anon key with RLS enabled.
 * Suitable for API routes and Edge functions.
 *
 * @returns Supabase client with RLS (singleton instance)
 */
export function createServerClient() {
  // Return existing instance if already created
  if (serverClientInstance) {
    return serverClientInstance;
  }

  // Create new instance only once
  serverClientInstance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  return serverClientInstance;
}

/**
 * Create Supabase admin client (bypasses RLS) (SINGLETON)
 *
 * ✅ PRODUCTION-READY: Returns the same instance on every call
 * 
 * ⚠️ WARNING: This client bypasses Row-Level Security!
 * Only use for:
 * - Administrative operations
 * - Background jobs
 * - System-level tasks
 * - Audit logging
 *
 * NEVER expose service role key to client-side code.
 *
 * @returns Supabase admin client (singleton instance)
 */
export function createAdminClient() {
  // Return existing instance if already created
  if (adminClientInstance) {
    return adminClientInstance;
  }

  // Create new instance only once
  adminClientInstance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return adminClientInstance;
}

// ============================================================================
// SINGLETON EXPORTS
// ============================================================================

/**
 * Default server client (with RLS)
 *
 * Use this for most server-side operations.
 */
export const supabase = createServerClient();

/**
 * Admin client (bypasses RLS)
 *
 * ⚠️ Use with caution! Only for privileged operations.
 */
export const supabaseAdmin = createAdminClient();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current user from request
 *
 * @param authHeader - Authorization header value
 * @returns User object or null
 */
export async function getCurrentUser(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const client = createServerClient();

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Verify JWT token and get user
 *
 * @param token - JWT token
 * @returns User object or null
 */
export async function verifyToken(token: string) {
  const client = createServerClient();

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Test database connection
 *
 * @returns True if connection successful
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('tenants').select('id').limit(1);

    if (error) {
      console.error('[Supabase] Connection test failed:', error);
      return false;
    }

    console.log('[Supabase] Connection test successful');
    return true;
  } catch (error) {
    console.error('[Supabase] Connection test failed:', error);
    return false;
  }
}

// ============================================================================
// TYPES
// ============================================================================

export type SupabaseClient = ReturnType<typeof createBrowserClient>;
export type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

export type { Database };

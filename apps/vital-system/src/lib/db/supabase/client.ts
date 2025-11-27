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

// In development, warn but don't throw - allow graceful degradation
// In production, these should be set, but we'll handle it gracefully
const isDevelopment = process.env.NODE_ENV === 'development';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !isDevelopment) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !isDevelopment) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !isDevelopment) {
  console.warn('⚠️ [Supabase Client] SUPABASE_SERVICE_ROLE_KEY is missing. Admin features will be disabled.');
}

// ============================================================================
// CLIENT FACTORY FUNCTIONS
// ============================================================================

/**
 * Create Supabase client for browser/client-side
 *
 * Uses anon key with RLS enabled.
 * Suitable for client-side code.
 *
 * @returns Supabase client with RLS
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for browser client');
  }
  
  return createClient<Database>(
    url,
    key,
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
}

/**
 * Create Supabase client for server-side (Edge Runtime)
 *
 * Uses anon key with RLS enabled.
 * Suitable for API routes and Edge functions.
 *
 * @returns Supabase client with RLS
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for server client');
  }
  
  return createClient<Database>(
    url,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

/**
 * Create Supabase admin client (bypasses RLS)
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
 * @returns Supabase admin client (bypasses RLS) or null if config is missing
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.warn('⚠️ [Supabase Admin Client] Configuration missing, returning null');
    return null as any; // Return null client that will fail gracefully
  }
  
  return createClient<Database>(
    url,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

/**
 * Default server client (with RLS)
 *
 * Use this for most server-side operations.
 * Lazy-loaded to prevent module-load-time errors.
 */
let _supabaseInstance: ReturnType<typeof createServerClient> | null = null;
export const supabase = new Proxy({} as ReturnType<typeof createServerClient>, {
  get(target, prop) {
    if (!_supabaseInstance) {
      try {
        _supabaseInstance = createServerClient();
      } catch (error) {
        console.warn('⚠️ [Supabase] Failed to create server client:', error);
        return () => {
          throw new Error('Supabase client not available');
        };
      }
    }
    return (_supabaseInstance as any)[prop];
  }
});

/**
 * Admin client (bypasses RLS)
 *
 * ⚠️ Use with caution! Only for privileged operations.
 * Lazy-loaded to prevent module-load-time errors.
 */
let _supabaseAdminInstance: ReturnType<typeof createAdminClient> | null = null;
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createAdminClient>, {
  get(target, prop) {
    if (!_supabaseAdminInstance) {
      _supabaseAdminInstance = createAdminClient();
      if (!_supabaseAdminInstance) {
        return () => {
          throw new Error('Supabase admin client not available - SUPABASE_SERVICE_ROLE_KEY is missing');
        };
      }
    }
    return (_supabaseAdminInstance as any)[prop];
  }
});

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

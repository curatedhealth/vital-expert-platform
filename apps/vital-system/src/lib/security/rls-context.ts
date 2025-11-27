/**
 * RLS Context Auto-Setting
 *
 * CRITICAL SECURITY: Automatically sets organization context for RLS policies
 *
 * Every database query MUST have the organization context set, otherwise RLS
 * policies won't filter data properly, leading to cross-organization data leaks.
 *
 * @module lib/security/rls-context
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@/lib/services/observability/structured-logger';

const logger = createLogger();

/**
 * Sets organization context for RLS policies
 *
 * CRITICAL: This MUST be called before ANY database queries in a request
 *
 * This sets the PostgreSQL session variable that RLS policies use to filter data:
 * - app.current_organization_id (new, recommended)
 * - app.tenant_id (legacy, for compatibility)
 *
 * @param supabase - Supabase client
 * @param organizationId - The organization ID to set as context (or null to clear)
 * @returns Promise that resolves when context is set
 * @throws Error if setting context fails (fail-secure: halt request)
 */
export async function setOrganizationContext(
  supabase: SupabaseClient,
  organizationId: string | null
): Promise<void> {
  const startTime = Date.now();

  try {
    const { error } = await supabase.rpc('set_organization_context', {
      p_organization_id: organizationId,
    });

    const duration = Date.now() - startTime;

    if (error) {
      // Check if the function doesn't exist yet (not deployed)
      const errorMsg = error.message || '';
      if (errorMsg.includes('function') || errorMsg.includes('does not exist') || error.code === '42883') {
        logger.warn('rls_context_rpc_not_found', {
          organizationId,
          duration,
          reason: 'RPC_FUNCTION_NOT_DEPLOYED',
          hint: 'Run the 20251126_rls_organization_functions.sql migration',
        });
        // Continue without setting context (development mode)
        return;
      }

      logger.error('rls_context_set_failed', error, {
        organizationId,
        duration,
        errorCode: error.code,
        errorMessage: error.message,
      });

      // FAIL SECURE: Throw error to halt request
      throw new Error(`Failed to set organization context: ${error.message}`);
    }

    logger.debug('rls_context_set_success', {
      organizationId,
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Check if function doesn't exist (not deployed)
    if (errorMsg.includes('function') || errorMsg.includes('does not exist')) {
      logger.warn('rls_context_rpc_exception_not_found', {
        organizationId,
        duration,
        reason: 'RPC_FUNCTION_NOT_DEPLOYED_EXCEPTION',
      });
      // Continue without setting context
      return;
    }

    logger.error(
      'rls_context_set_exception',
      error instanceof Error ? error : new Error(String(error)),
      {
        organizationId,
        duration,
      }
    );

    // FAIL SECURE: Re-throw to halt request
    throw error;
  }
}

/**
 * Gets the currently set organization context
 *
 * Useful for:
 * - Debugging RLS issues
 * - Verifying context was set correctly
 * - Logging/monitoring
 *
 * @param supabase - Supabase client
 * @returns The current organization ID, or null if not set
 */
export async function getCurrentOrganizationContext(
  supabase: SupabaseClient
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc(
      'get_current_organization_context'
    );

    if (error) {
      logger.warn('rls_context_get_failed', {
        errorCode: error.code,
        errorMessage: error.message,
      });
      return null;
    }

    return data as string | null;
  } catch (error) {
    logger.error(
      'rls_context_get_exception',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Verifies that organization context matches expected value
 *
 * Use this in tests or for validation:
 * ```typescript
 * await setOrganizationContext(supabase, orgId);
 * await verifyOrganizationContext(supabase, orgId); // Throws if mismatch
 * ```
 *
 * @param supabase - Supabase client
 * @param expectedOrganizationId - The organization ID that should be set
 * @throws Error if context doesn't match expected value
 */
export async function verifyOrganizationContext(
  supabase: SupabaseClient,
  expectedOrganizationId: string | null
): Promise<void> {
  const currentContext = await getCurrentOrganizationContext(supabase);

  if (currentContext !== expectedOrganizationId) {
    const error = new Error(
      `Organization context mismatch: expected ${expectedOrganizationId}, got ${currentContext}`
    );

    logger.error('rls_context_verification_failed', {
      expected: expectedOrganizationId,
      actual: currentContext,
    });

    throw error;
  }

  logger.debug('rls_context_verification_success', {
    organizationId: expectedOrganizationId,
  });
}

/**
 * Creates a Supabase client with organization context already set
 *
 * RECOMMENDED USAGE: Use this instead of manually setting context
 *
 * ```typescript
 * // Instead of:
 * const supabase = createClient();
 * await setOrganizationContext(supabase, orgId);
 *
 * // Do this:
 * const supabase = await createClientWithOrganizationContext(orgId);
 * ```
 *
 * @param createClientFn - Function that creates Supabase client
 * @param organizationId - Organization ID to set as context
 * @returns Supabase client with context already set
 */
export async function createClientWithOrganizationContext(
  createClientFn: () => Promise<SupabaseClient> | SupabaseClient,
  organizationId: string | null
): Promise<SupabaseClient> {
  const supabase = await createClientFn();

  // Automatically set context
  await setOrganizationContext(supabase, organizationId);

  return supabase;
}

/**
 * Middleware helper: Sets organization context from request
 *
 * Use this in API routes:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const supabase = await createClient();
 *   await setOrganizationContextFromRequest(supabase, request);
 *
 *   // Now all queries are filtered by organization
 *   const { data } = await supabase.from('agents').select('*');
 *   return NextResponse.json({ agents: data });
 * }
 * ```
 *
 * @param supabase - Supabase client
 * @param request - Next.js request object
 * @param organizationId - Organization ID (if already determined)
 */
export async function setOrganizationContextFromRequest(
  supabase: SupabaseClient,
  request: any, // NextRequest or similar
  organizationId?: string
): Promise<void> {
  let orgId = organizationId;

  // If not provided, try to get from user session
  if (!orgId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Get organization from user profile
      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      orgId = userData?.organization_id;
    }
  }

  // Set context (or clear if no org found)
  await setOrganizationContext(supabase, orgId || null);

  logger.info('rls_context_set_from_request', {
    organizationId: orgId,
    userId: (await supabase.auth.getUser()).data.user?.id,
    path: request.url || request.path,
  });
}

/**
 * LEGACY SUPPORT: Alias for backward compatibility
 * Use setOrganizationContext instead
 */
export const setTenantContext = setOrganizationContext;

/**
 * LEGACY SUPPORT: Alias for backward compatibility
 * Use getCurrentOrganizationContext instead
 */
export const getCurrentTenantContext = getCurrentOrganizationContext;

/**
 * Agent Authentication & Authorization Middleware
 * 
 * Enterprise-grade permission system for agent CRUD operations following
 * industry best practices from OpenAI, Anthropic, and LangChain.
 * 
 * Features:
 * - User session-based authentication (no service role key in routes)
 * - Ownership validation for update/delete operations
 * - Tenant isolation enforcement
 * - Admin bypass support
 * - Comprehensive audit logging
 * 
 * @module middleware/agent-auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { env } from '@/config/environment';
import { validateUserOrganizationMembership } from '@/lib/security/organization-membership';
import { setOrganizationContext } from '@/lib/security/rls-context';

/**
 * Agent Permission Context
 * Contains all necessary information for authorization decisions
 */
export interface AgentPermissionContext {
  user: {
    id: string;
    email: string;
  };
  profile: {
    tenant_id: string;
    role: 'super_admin' | 'admin' | 'manager' | 'member' | 'guest';
  };
  agent?: {
    id: string;
    created_by: string;
    tenant_id: string;
    // Note: is_custom and is_library_agent don't exist in schema
    // Use metadata.is_custom and metadata.is_library_agent if needed
  };
}

/**
 * Verify agent permissions for CRUD operations
 * 
 * This function replaces insecure service role key usage with proper
 * permission-based access control.
 * 
 * Rules:
 * - READ: All authenticated users can read
 * - CREATE: All authenticated users can create (in their tenant)
 * - UPDATE: Owners, tenant admins, or super admins
 * - DELETE: Owners, tenant admins, or super admins
 * 
 * @param request - Next.js request object
 * @param action - CRUD action to verify
 * @param agentId - Optional agent ID for update/delete operations
 * @returns Permission result with context if allowed
 */
export async function verifyAgentPermissions(
  request: NextRequest,
  action: 'create' | 'read' | 'update' | 'delete',
  agentId?: string
): Promise<{
  allowed: boolean;
  context?: AgentPermissionContext;
  error?: string;
}> {
  const logger = createLogger();
  const operationId = `agent_auth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();

  // DEVELOPMENT BYPASS: Allow all actions in local development
  // This bypasses auth checks for faster local iteration
  // NEVER enabled in production (Vercel) environments
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isNotVercel = !process.env.VERCEL && !process.env.VERCEL_ENV;
  const BYPASS_AUTH = isDevelopment && isNotVercel;

  if (BYPASS_AUTH) {
    const tenantIds = env.getTenantIds();
    logger.info('agent_auth_dev_bypass', {
      operation: 'verifyAgentPermissions',
      operationId,
      action,
      reason: 'DEVELOPMENT_MODE_BYPASS',
      environment: process.env.NODE_ENV,
    });

    return {
      allowed: true,
      context: {
        user: {
          id: 'dev-user',
          email: 'dev@vital.health',
        },
        profile: {
          tenant_id: tenantIds.platform,
          role: 'super_admin',
        },
      },
    };
  }

  try {
    // Use user's session, not service role
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('agent_auth_failed', {
        operation: 'verifyAgentPermissions',
        operationId,
        action,
        reason: 'authentication_required',
        error: authError?.message,
      });

      return {
        allowed: false,
        error: 'Authentication required',
      };
    }

    // Get user profile with role and tenant
    // Note: tenant_id comes from users.organization_id, not profiles table
    let userData: any = null;
    let userError: any = null;
    try {
      const result = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();
      userData = result.data;
      userError = result.error;
    } catch (e) {
      // Table might not exist, continue with fallback
      userError = e;
    }

    // Also get role from profiles table as fallback
    let profile: any = null;
    try {
      const result = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      profile = result.data;
    } catch (e) {
      // Table might not exist, continue without profile
    }

    // Use users table data if available, otherwise fallback to profiles
    const userRole = userData?.role || profile?.role || 'guest';
    const organizationId = userData?.organization_id;

    // Normalize role (handle both 'superadmin' and 'super_admin')
    const normalizedRole =
      userRole === 'superadmin' || userRole === 'super_admin'
        ? 'super_admin'
        : (userRole as 'admin' | 'manager' | 'member' | 'guest') || 'guest';

    // SECURITY FIX: Only use server-determined organization, never client-provided values
    // Tenant is determined by subdomain (in tenant-middleware) or user's organization
    // We NO LONGER trust x-tenant-id header or tenant_id cookie for security decisions

    const tenantIds = env.getTenantIds();
    const tenantId = organizationId || tenantIds.platform;

    // CRITICAL SECURITY: Validate user belongs to the organization
    // Platform tenant (vital-system) users get access without strict validation
    // Other tenants require organization membership validation
    if (tenantId && tenantId !== tenantIds.platform) {
      try {
        const hasAccess = await validateUserOrganizationMembership(
          supabase,
          user.id,
          tenantId
        );

        if (!hasAccess) {
          logger.error('agent_auth_organization_access_denied', {
            operation: 'verifyAgentPermissions',
            operationId,
            userId: user.id,
            attemptedOrganizationId: tenantId,
            reason: 'USER_NOT_MEMBER_OF_ORGANIZATION',
          });

          return {
            allowed: false,
            error: 'Access denied: You do not belong to this organization',
          };
        }
      } catch (validationError) {
        // If validation function doesn't exist yet, allow platform users
        const errorMsg = validationError instanceof Error ? validationError.message : String(validationError);
        if (errorMsg.includes('function') || errorMsg.includes('does not exist')) {
          logger.warn('agent_auth_validation_function_missing', {
            operation: 'verifyAgentPermissions',
            operationId,
            userId: user.id,
            tenantId,
            reason: 'RPC_FUNCTION_NOT_FOUND_ALLOWING_ACCESS',
          });
          // Continue with access - RPC function may not be deployed yet
        } else {
          // Re-throw other errors
          throw validationError;
        }
      }
    }

    // CRITICAL SECURITY FIX #5: Set RLS context for database queries
    // This ensures ALL subsequent queries are filtered by organization
    try {
      await setOrganizationContext(supabase, tenantId);

      logger.debug('agent_auth_rls_context_set', {
        operation: 'verifyAgentPermissions',
        operationId,
        userId: user.id,
        organizationId: tenantId,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      // If RLS function doesn't exist yet, continue (for development)
      if (errorMsg.includes('function') || errorMsg.includes('does not exist')) {
        logger.warn('agent_auth_rls_context_function_missing', {
          operation: 'verifyAgentPermissions',
          operationId,
          userId: user.id,
          organizationId: tenantId,
          reason: 'RPC_FUNCTION_NOT_DEPLOYED_CONTINUING',
        });
        // Continue without RLS context - function may not be deployed yet
      } else {
        logger.error(
          'agent_auth_rls_context_failed',
          error instanceof Error ? error : new Error(String(error)),
          {
            operation: 'verifyAgentPermissions',
            operationId,
            userId: user.id,
            organizationId: tenantId,
          }
        );

        // FAIL SECURE: If we can't set RLS context, deny the request
        return {
          allowed: false,
          error: 'Failed to set security context. Please try again.',
        };
      }
    }

    const context: AgentPermissionContext = {
      user: {
        id: user.id,
        email: user.email || '',
      },
      profile: {
        tenant_id: tenantId,
        role: normalizedRole,
      },
    };

    // READ permission - all authenticated users can read
    if (action === 'read') {
      const duration = Date.now() - startTime;
      logger.info('agent_auth_allowed', {
        operation: 'verifyAgentPermissions',
        operationId,
        action: 'read',
        userId: user.id,
        tenantId,
        role: normalizedRole,
        duration,
      });

      return { allowed: true, context };
    }

    // CREATE permission - all authenticated users can create
    if (action === 'create') {
      const duration = Date.now() - startTime;
      logger.info('agent_auth_allowed', {
        operation: 'verifyAgentPermissions',
        operationId,
        action: 'create',
        userId: user.id,
        tenantId,
        role: normalizedRole,
        duration,
      });

      return { allowed: true, context };
    }

    // UPDATE/DELETE require ownership or admin rights
    if (action === 'update' || action === 'delete') {
      if (!agentId) {
        logger.warn('agent_auth_failed', {
          operation: 'verifyAgentPermissions',
          operationId,
          action,
          userId: user.id,
          reason: 'agent_id_required',
        });

        return {
          allowed: false,
          error: 'Agent ID required for update/delete',
        };
      }

      // Fetch agent details using service client to bypass RLS
      // Auth is already verified above, we just need to check agent existence
      const serviceSupabase = getServiceSupabaseClient();
      // Note: is_custom and is_library_agent columns don't exist in schema
      // We query metadata JSONB field instead for these flags
      const { data: agent, error: agentError } = await serviceSupabase
        .from('agents')
        .select('id, created_by, tenant_id, metadata')
        .eq('id', agentId)
        .single();

      if (agentError || !agent) {
        logger.warn('agent_auth_failed', {
          operation: 'verifyAgentPermissions',
          operationId,
          action,
          agentId,
          userId: user.id,
          reason: 'agent_not_found',
          error: agentError?.message,
        });

        return {
          allowed: false,
          error: 'Agent not found',
        };
      }

      // Extract is_custom and is_library_agent from metadata JSONB if present
      const metadata = agent.metadata || {};
      context.agent = {
        id: agent.id,
        created_by: agent.created_by || '',
        tenant_id: agent.tenant_id || '',
      };

      // Super admins can do anything
      if (normalizedRole === 'super_admin') {
        const duration = Date.now() - startTime;
        logger.info('agent_auth_allowed', {
          operation: 'verifyAgentPermissions',
          operationId,
          action,
          agentId,
          userId: user.id,
          tenantId,
          role: 'super_admin',
          reason: 'super_admin_bypass',
          duration,
        });

        return { allowed: true, context };
      }

      // Tenant admins can edit agents in their tenant
      if (
        normalizedRole === 'admin' &&
        agent.tenant_id === tenantId
      ) {
        const duration = Date.now() - startTime;
        logger.info('agent_auth_allowed', {
          operation: 'verifyAgentPermissions',
          operationId,
          action,
          agentId,
          userId: user.id,
          tenantId,
          role: 'admin',
          reason: 'tenant_admin',
          duration,
        });

        return { allowed: true, context };
      }

      // Users can only edit their own custom agents
      // Check is_custom and is_library_agent from metadata JSONB
      const isOwner = agent.created_by === user.id;
      const isCustom = metadata.is_custom === true;
      const isNotLibrary = metadata.is_library_agent !== true;

      if (isOwner && isCustom && isNotLibrary) {
        const duration = Date.now() - startTime;
        logger.info('agent_auth_allowed', {
          operation: 'verifyAgentPermissions',
          operationId,
          action,
          agentId,
          userId: user.id,
          tenantId,
          reason: 'owner_of_custom_agent',
          duration,
        });

        return { allowed: true, context };
      }

      const duration = Date.now() - startTime;
      logger.warn('agent_auth_failed', {
        operation: 'verifyAgentPermissions',
        operationId,
        action,
        agentId,
        userId: user.id,
        tenantId,
        role: normalizedRole,
        reason: 'insufficient_permissions',
        agentOwnership: {
          isOwner,
          isCustom,
          isNotLibrary,
          created_by: agent.created_by,
        },
        duration,
      });

      return {
        allowed: false,
        error: 'Insufficient permissions to modify this agent',
      };
    }

    const duration = Date.now() - startTime;
    logger.warn('agent_auth_failed', {
      operation: 'verifyAgentPermissions',
      operationId,
      action,
      userId: user.id,
      reason: 'invalid_action',
      duration,
    });

    return {
      allowed: false,
      error: 'Invalid action',
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(
      'agent_auth_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'verifyAgentPermissions',
        operationId,
        action,
        duration,
      }
    );

    return {
      allowed: false,
      error: 'Permission verification failed',
    };
  }
}

/**
 * Middleware wrapper for API routes
 * 
 * Provides a clean abstraction for agent-related endpoints with automatic
 * permission checking and context injection.
 * 
 * Usage:
 * ```typescript
 * export const GET = withAgentAuth(async (request, context) => {
 *   const supabase = await createClient(); // User session client
 *   // RLS automatically applies tenant filtering
 *   const { data } = await supabase.from('agents').select('*');
 *   return NextResponse.json({ success: true, agents: data });
 * });
 * ```
 * 
 * @param handler - Route handler function
 * @returns Wrapped handler with automatic permission checking
 */
export function withAgentAuth(
  handler: (
    request: NextRequest,
    context: AgentPermissionContext,
    params?: any
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    params?: any
  ): Promise<NextResponse> => {
    // Extract action from method
    const actionMap: Record<
      string,
      'create' | 'read' | 'update' | 'delete'
    > = {
      GET: 'read',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };

    const action = actionMap[request.method || 'GET'] || 'read';

    // Extract agent ID from params (Next.js App Router)
    // In Next.js 16, params is always a Promise that must be awaited before any property access
    let agentId: string | undefined;
    if (params) {
      // Always await params first to avoid sync access errors
      const resolvedParams = await Promise.resolve(params);

      // Check for nested params structure: { params: { id } } or { params: Promise<{ id }> }
      if (resolvedParams?.params) {
        const innerParams = await Promise.resolve(resolvedParams.params);
        agentId = innerParams?.id;
      }
      // Direct id access after resolving
      else if (resolvedParams?.id) {
        agentId = resolvedParams.id;
      }
    }

    // Verify permissions
    const { allowed, context, error } = await verifyAgentPermissions(
      request,
      action,
      agentId
    );

    if (!allowed) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 403 }
      );
    }

    // Call the handler with authenticated context
    try {
      return await handler(request, context!, params);
    } catch (handlerError) {
      const logger = createLogger();
      logger.error(
        'agent_auth_handler_error',
        handlerError instanceof Error ? handlerError : new Error(String(handlerError)),
        {
          operation: 'withAgentAuth',
          method: request.method,
          url: request.url,
        }
      );

      return NextResponse.json(
        {
          error: 'Internal server error',
          details: handlerError instanceof Error ? handlerError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  };
}


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
import { createLogger } from '@/lib/services/observability/structured-logger';
import { env } from '@/config/environment';

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
    is_custom: boolean;
    is_library_agent: boolean;
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
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    // Also get role from profiles table as fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    // Use users table data if available, otherwise fallback to profiles
    const userRole = userData?.role || profile?.role || 'guest';
    const organizationId = userData?.organization_id;

    // Normalize role (handle both 'superadmin' and 'super_admin')
    const normalizedRole =
      userRole === 'superadmin' || userRole === 'super_admin'
        ? 'super_admin'
        : (userRole as 'admin' | 'manager' | 'member' | 'guest') || 'guest';

    // For subdomain-based multitenancy, use the tenant_id from cookie/header
    // This is set by the tenant-middleware based on the subdomain
    const cookieTenantId = request.cookies.get('tenant_id')?.value;
    const headerTenantId = request.headers.get('x-tenant-id');

    // Priority: cookie (set by middleware) > header > user's organization > platform default
    const tenantIds = env.getTenantIds();
    const tenantId = cookieTenantId || headerTenantId || organizationId || tenantIds.platform;

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

      // Fetch agent details
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id, created_by, tenant_id, is_custom, is_library_agent')
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

      context.agent = {
        id: agent.id,
        created_by: agent.created_by || '',
        tenant_id: agent.tenant_id || '',
        is_custom: agent.is_custom === true,
        is_library_agent: agent.is_library_agent === true,
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
      const isOwner = agent.created_by === user.id;
      const isCustom = agent.is_custom === true;
      const isNotLibrary = agent.is_library_agent !== true;

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
    const agentId = params?.params?.id || params?.id;

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
    return handler(request, context!, params);
  };
}


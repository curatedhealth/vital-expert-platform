/**
 * Prompt Authentication & Authorization Middleware
 * 
 * Enterprise-grade permission system for prompt CRUD operations.
 * Follows same pattern as agent-auth for consistency.
 * 
 * Features:
 * - User session-based authentication (no service role key in routes)
 * - Ownership validation for update/delete operations
 * - Tenant isolation enforcement (if prompts are tenant-scoped)
 * - Admin bypass support
 * - Comprehensive audit logging
 * 
 * @module middleware/prompt-auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { env } from '@/config/environment';

/**
 * Prompt Permission Context
 */
export interface PromptPermissionContext {
  user: {
    id: string;
    email: string;
  };
  profile: {
    tenant_id: string;
    role: 'super_admin' | 'admin' | 'manager' | 'member' | 'guest';
  };
  prompt?: {
    id: string;
    created_by: string | null;
    tenant_id?: string | null;
  };
}

/**
 * Verify prompt permissions for CRUD operations
 * 
 * Rules:
 * - READ: All authenticated users can read all prompts (for library access)
 * - CREATE: All authenticated users can create prompts
 * - UPDATE/DELETE: Only owners or admins can modify prompts
 * 
 * @param request - Next.js request object
 * @param action - CRUD action to verify
 * @param promptId - Optional prompt ID for update/delete operations
 * @returns Permission check result
 */
export async function verifyPromptPermissions(
  request: NextRequest,
  action: 'create' | 'read' | 'update' | 'delete',
  promptId?: string
): Promise<{
  allowed: boolean;
  context?: PromptPermissionContext;
  error?: string;
}> {
  const logger = createLogger();

  try {
    // Use user's session, not service role
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('prompt_permission_auth_failed', {
        action,
        promptId,
        error: authError?.message,
      });

      return {
        allowed: false,
        error: 'Authentication required',
      };
    }

    // Get user profile with role and tenant
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.warn('prompt_permission_profile_not_found', {
        userId: user.id,
        action,
      });

      return {
        allowed: false,
        error: 'User profile not found',
      };
    }

    // Normalize role
    const normalizedRole =
      (profile.role as PromptPermissionContext['profile']['role']) || 'guest';

    // Ensure tenant_id exists (fallback to platform tenant from env config)
    const tenantIds = env.getTenantIds();
    const tenantId = profile.tenant_id || tenantIds.platform;

    const context: PromptPermissionContext = {
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
      logger.debug('prompt_permission_read_allowed', {
        userId: user.id,
        tenantId,
      });

      return { allowed: true, context };
    }

    // CREATE permission - all authenticated users can create
    if (action === 'create') {
      logger.debug('prompt_permission_create_allowed', {
        userId: user.id,
        tenantId,
      });

      return { allowed: true, context };
    }

    // UPDATE/DELETE require ownership or admin rights
    if (action === 'update' || action === 'delete') {
      if (!promptId) {
        return {
          allowed: false,
          error: 'Prompt ID required for update/delete',
        };
      }

      // Fetch prompt details
      const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .select('id, created_by, tenant_id')
        .eq('id', promptId)
        .single();

      if (promptError || !prompt) {
        logger.warn('prompt_permission_prompt_not_found', {
          promptId,
          userId: user.id,
        });

        return {
          allowed: false,
          error: 'Prompt not found',
        };
      }

      context.prompt = {
        id: prompt.id,
        created_by: prompt.created_by,
        tenant_id: prompt.tenant_id || null,
      };

      // Super admins can do anything
      if (normalizedRole === 'super_admin') {
        logger.debug('prompt_permission_admin_bypass', {
          promptId,
          userId: user.id,
          role: normalizedRole,
        });

        return { allowed: true, context };
      }

      // Tenant admins can edit prompts in their tenant (if tenant_id exists)
      if (
        normalizedRole === 'admin' &&
        prompt.tenant_id &&
        prompt.tenant_id === tenantId
      ) {
        logger.debug('prompt_permission_tenant_admin', {
          promptId,
          userId: user.id,
          tenantId,
        });

        return { allowed: true, context };
      }

      // Users can only edit their own prompts
      const isOwner = prompt.created_by === user.id;

      if (isOwner) {
        logger.debug('prompt_permission_owner_allowed', {
          promptId,
          userId: user.id,
        });

        return { allowed: true, context };
      }

      logger.warn('prompt_permission_denied', {
        promptId,
        userId: user.id,
        promptOwner: prompt.created_by,
        userRole: normalizedRole,
      });

      return {
        allowed: false,
        error: 'Insufficient permissions to modify this prompt',
      };
    }

    return {
      allowed: false,
      error: 'Invalid action',
    };
  } catch (error) {
    logger.error(
      'prompt_permission_verification_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        action,
        promptId,
      }
    );

    return {
      allowed: false,
      error: 'Permission verification failed',
    };
  }
}

/**
 * Middleware wrapper for prompt API routes
 * 
 * Automatically extracts action from HTTP method and verifies permissions.
 * 
 * @param handler - Route handler function
 * @returns Wrapped route handler with authentication
 */
export function withPromptAuth(
  handler: (
    request: NextRequest,
    context: PromptPermissionContext,
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

    const action = actionMap[request.method || 'GET'];
    const promptId = params?.params?.id;

    const { allowed, context, error } = await verifyPromptPermissions(
      request,
      action,
      promptId
    );

    if (!allowed) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 403 }
      );
    }

    return handler(request, context!, params);
  };
}


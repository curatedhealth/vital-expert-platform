/**
 * Knowledge Domain Authentication & Authorization Middleware
 * 
 * Enterprise-grade permission system for knowledge domain CRUD operations.
 * 
 * Features:
 * - User session-based authentication (no service role key)
 * - Superadmin-only access for domain management
 * - Tenant isolation enforcement
 * - Comprehensive audit logging
 * 
 * @module middleware/knowledge-auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { env } from '@/lib/config/environment';

/**
 * Knowledge Permission Context
 * Contains all necessary information for authorization decisions
 */
export interface KnowledgePermissionContext {
  user: {
    id: string;
    email: string;
  };
  profile: {
    tenant_id: string;
    role: 'super_admin' | 'admin' | 'manager' | 'member' | 'guest';
  };
}

/**
 * Verify knowledge domain permissions
 * 
 * Rules:
 * - READ: All authenticated users can read
 * - CREATE: Superadmins only
 * - UPDATE: Superadmins only
 * - DELETE: Superadmins only (with safety checks)
 * 
 * @param request - Next.js request object
 * @param action - CRUD action to verify
 * @param domainId - Optional domain ID for update/delete operations
 * @returns Permission result with context if allowed
 */
export async function verifyKnowledgeDomainPermissions(
  request: NextRequest,
  action: 'create' | 'read' | 'update' | 'delete',
  domainId?: string
): Promise<{
  allowed: boolean;
  context?: KnowledgePermissionContext;
  error?: string;
}> {
  const logger = createLogger();
  const operationId = `knowledge_auth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
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
      logger.warn('knowledge_auth_failed', {
        operation: 'verifyKnowledgeDomainPermissions',
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.warn('knowledge_auth_failed', {
        operation: 'verifyKnowledgeDomainPermissions',
        operationId,
        action,
        userId: user.id,
        reason: 'profile_not_found',
        error: profileError?.message,
      });

      return {
        allowed: false,
        error: 'User profile not found',
      };
    }

    // Normalize role (handle both 'superadmin' and 'super_admin')
    const normalizedRole =
      profile.role === 'superadmin' || profile.role === 'super_admin'
        ? 'super_admin'
        : (profile.role as 'admin' | 'manager' | 'member' | 'guest') || 'guest';

    // Ensure tenant_id exists (fallback to platform tenant from env config)
    const tenantIds = env.getTenantIds();
    const tenantId = profile.tenant_id || tenantIds.platform;

    const context: KnowledgePermissionContext = {
      user: {
        id: user.id,
        email: user.email || '',
      },
      profile: {
        tenant_id: tenantId,
        role: normalizedRole,
      },
    };

    // Permission checks
    switch (action) {
      case 'read':
        // All authenticated users can read
        logger.info('knowledge_auth_success', {
          operation: 'verifyKnowledgeDomainPermissions',
          operationId,
          action,
          userId: user.id,
          role: normalizedRole,
          duration: Date.now() - startTime,
        });
        return { allowed: true, context };

      case 'create':
      case 'update':
      case 'delete':
        // Only superadmins can modify knowledge domains
        if (normalizedRole !== 'super_admin') {
          logger.warn('knowledge_auth_denied', {
            operation: 'verifyKnowledgeDomainPermissions',
            operationId,
            action,
            userId: user.id,
            role: normalizedRole,
            reason: 'insufficient_permissions',
            requiredRole: 'super_admin',
            duration: Date.now() - startTime,
          });

          return {
            allowed: false,
            error: 'Superadmin access required',
          };
        }

        // For delete, check if domain has associated documents
        if (action === 'delete' && domainId) {
          const { count, error: docError } = await supabase
            .from('knowledge_documents')
            .select('*', { count: 'exact', head: true })
            .eq('domain', domainId);

          if (docError) {
            logger.error('knowledge_auth_error', {
              operation: 'verifyKnowledgeDomainPermissions',
              operationId,
              action,
              domainId,
              error: docError.message,
            });

            return {
              allowed: false,
              error: 'Failed to check domain dependencies',
            };
          }

          if (count && count > 0) {
            return {
              allowed: false,
              error: `Cannot delete domain: ${count} documents are associated with it`,
            };
          }
        }

        logger.info('knowledge_auth_success', {
          operation: 'verifyKnowledgeDomainPermissions',
          operationId,
          action,
          userId: user.id,
          role: normalizedRole,
          domainId,
          duration: Date.now() - startTime,
        });

        return { allowed: true, context };

      default:
        return {
          allowed: false,
          error: 'Invalid action',
        };
    }
  } catch (error) {
    logger.error('knowledge_auth_exception', {
      operation: 'verifyKnowledgeDomainPermissions',
      operationId,
      action,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
    });

    return {
      allowed: false,
      error: 'Authorization check failed',
    };
  }
}

/**
 * Wrapper for knowledge domain API routes
 * 
 * Replaces insecure service role key usage with proper authentication.
 * 
 * @param handler - Route handler function
 * @param requiredAction - Required CRUD action
 * @returns Protected route handler
 */
export function withKnowledgeAuth(
  handler: (
    request: NextRequest,
    context: KnowledgePermissionContext,
    params?: Record<string, string>
  ) => Promise<NextResponse>,
  requiredAction: 'create' | 'read' | 'update' | 'delete'
) {
  return async (
    request: NextRequest,
    context?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    try {
      // Extract domain ID from URL params if available
      const domainId = context?.params?.id;

      // Verify permissions
      const permissionResult = await verifyKnowledgeDomainPermissions(
        request,
        requiredAction,
        domainId
      );

      if (!permissionResult.allowed || !permissionResult.context) {
        return NextResponse.json(
          { error: permissionResult.error || 'Unauthorized' },
          { status: 403 }
        );
      }

      // Call handler with authenticated context
      return handler(request, permissionResult.context, context?.params);
    } catch (error) {
      const logger = createLogger();
      logger.error('knowledge_auth_wrapper_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}


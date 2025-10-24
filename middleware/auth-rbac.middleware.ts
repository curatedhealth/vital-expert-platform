/**
 * Authentication & RBAC Middleware
 *
 * Middleware that validates authentication and enforces RBAC permissions
 * Extracts user context and injects it into request headers for RLS
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { UserRole, Permission, hasPermission } from '@/lib/auth/rbac';
import { injectRLSContextIntoHeaders, buildRLSContext } from '@/lib/auth/rls-helpers';

// ============================================================================
// TYPES
// ============================================================================

interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  userRole?: UserRole;
  organizationId?: string;
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    {
      error: 'UNAUTHORIZED',
      message,
    },
    { status: 401 }
  );
}

function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json(
    {
      error: 'FORBIDDEN',
      message,
    },
    { status: 403 }
  );
}

// ============================================================================
// AUTH EXTRACTION
// ============================================================================

/**
 * Extract user authentication from request
 */
async function extractUserAuth(request: NextRequest): Promise<{
  userId: string | null;
  userRole: UserRole | null;
  organizationId: string | null;
}> {
  try {
    // Create Supabase client for server-side auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    // Get session from Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return { userId: null, userRole: null, organizationId: null };
    }

    // Get user profile with role information
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', session.user.id)
      .single();

    return {
      userId: session.user.id,
      userRole: (profile?.role as UserRole) || UserRole.USER,
      organizationId: profile?.organization_id || null,
    };
  } catch (error) {
    console.error('Error extracting user auth:', error);
    return { userId: null, userRole: null, organizationId: null };
  }
}

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Main authentication middleware with RBAC support
 */
export function withAuthRBAC<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
): (request: NextRequest, ...args: T) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const {
      requireAuth = true,
      requiredPermission,
      requiredRole,
      allowedRoles,
    } = options;

    // Extract user authentication
    const { userId, userRole, organizationId } = await extractUserAuth(request);

    // Check if authentication is required
    if (requireAuth && !userId) {
      return unauthorizedResponse('Authentication required');
    }

    // Type-safe authenticated request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.userId = userId || undefined;
    authenticatedRequest.userRole = userRole || undefined;
    authenticatedRequest.organizationId = organizationId || undefined;

    // Check role requirements
    if (requiredRole && userRole) {
      const roleTiers: Record<UserRole, number> = {
        [UserRole.SUPER_ADMIN]: 1,
        [UserRole.ADMIN]: 2,
        [UserRole.MANAGER]: 3,
        [UserRole.USER]: 4,
        [UserRole.VIEWER]: 5,
        [UserRole.GUEST]: 6,
      };

      const userTier = roleTiers[userRole] || 999;
      const requiredTier = roleTiers[requiredRole] || 999;

      if (userTier > requiredTier) {
        return forbiddenResponse(
          `This endpoint requires ${requiredRole} role or higher`
        );
      }
    }

    // Check allowed roles
    if (allowedRoles && userRole) {
      if (!allowedRoles.includes(userRole)) {
        return forbiddenResponse(
          `This endpoint is only accessible to: ${allowedRoles.join(', ')}`
        );
      }
    }

    // Check permission requirements
    if (requiredPermission && userRole) {
      if (!hasPermission(userRole, requiredPermission)) {
        return forbiddenResponse(
          `Missing required permission: ${requiredPermission}`
        );
      }
    }

    // Inject RLS context into request headers for downstream use
    if (userId && userRole) {
      const rlsContext = buildRLSContext(userId, userRole, organizationId || undefined);
      const headersWithRLS = injectRLSContextIntoHeaders(
        request.headers,
        rlsContext
      );

      // Create new request with RLS headers
      const requestWithRLS = new Request(request, {
        headers: headersWithRLS,
      });

      Object.assign(authenticatedRequest, requestWithRLS);
    }

    // Call the handler with authenticated request
    const response = await handler(authenticatedRequest, ...args);

    // Add user context to response headers for debugging
    if (userId) {
      response.headers.set('X-User-Id', userId);
      if (userRole) {
        response.headers.set('X-User-Role', userRole);
      }
      if (organizationId) {
        response.headers.set('X-Organization-Id', organizationId);
      }
    }

    return response;
  };
}

// ============================================================================
// CONVENIENCE WRAPPERS
// ============================================================================

/**
 * Require authentication (no specific permission)
 */
export function requireAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuthRBAC(handler, { requireAuth: true });
}

/**
 * Require specific permission
 */
export function requirePermission<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
  permission: Permission
) {
  return withAuthRBAC(handler, {
    requireAuth: true,
    requiredPermission: permission,
  });
}

/**
 * Require specific role or higher
 */
export function requireRole<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
  role: UserRole
) {
  return withAuthRBAC(handler, {
    requireAuth: true,
    requiredRole: role,
  });
}

/**
 * Require admin role or higher (ADMIN or SUPER_ADMIN)
 */
export function requireAdmin<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuthRBAC(handler, {
    requireAuth: true,
    requiredRole: UserRole.ADMIN,
  });
}

/**
 * Require super admin role
 */
export function requireSuperAdmin<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuthRBAC(handler, {
    requireAuth: true,
    allowedRoles: [UserRole.SUPER_ADMIN],
  });
}

/**
 * Optional authentication (user context if available, but not required)
 */
export function optionalAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return withAuthRBAC(handler, { requireAuth: false });
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { AuthenticatedRequest, AuthMiddlewareOptions };

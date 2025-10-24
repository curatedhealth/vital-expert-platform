/**
 * Row-Level Security (RLS) Validation Middleware
 * Ensures all database operations include proper tenant/user context
 * Prevents cross-tenant data leakage
 */

import { NextRequest, NextResponse } from 'next/server';

export interface RLSContext {
  userId: string;
  userEmail?: string;
  tenantId?: string;
  role?: string;
}

/**
 * Extract RLS context from request headers
 * These headers are set by the auth middleware
 */
export function extractRLSContext(request: NextRequest): RLSContext | null {
  const userId = request.headers.get('X-User-Id');
  const userEmail = request.headers.get('X-User-Email');
  const tenantId = request.headers.get('X-Tenant-Id');
  const role = request.headers.get('X-User-Role');

  if (!userId) {
    return null;
  }

  return {
    userId,
    userEmail: userEmail || undefined,
    tenantId: tenantId || undefined,
    role: role || undefined
  };
}

/**
 * Validate that RLS context exists for protected operations
 */
export function validateRLSContext(context: RLSContext | null): NextResponse | null {
  if (!context || !context.userId) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'User context required for this operation',
        code: 'RLS_CONTEXT_MISSING'
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Check if user has required role for operation
 */
export function validateRole(context: RLSContext, requiredRole: string): NextResponse | null {
  if (!context.role || context.role !== requiredRole) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `${requiredRole} role required for this operation`,
        code: 'INSUFFICIENT_PERMISSIONS'
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Apply RLS context to Supabase query
 * Ensures all queries are scoped to the current user/tenant
 */
export function applyRLSFilter<T>(
  query: any,
  context: RLSContext,
  options?: {
    tenantColumn?: string;
    userColumn?: string;
  }
): any {
  const { tenantColumn = 'tenant_id', userColumn = 'user_id' } = options || {};

  // If tenant context exists, filter by tenant
  if (context.tenantId) {
    query = query.eq(tenantColumn, context.tenantId);
  }

  // Always filter by user for maximum security
  // Comment this out if tenant-level sharing is needed
  query = query.eq(userColumn, context.userId);

  return query;
}

/**
 * Middleware wrapper for API routes requiring RLS validation
 */
export function withRLSValidation(
  handler: (request: NextRequest, context: RLSContext) => Promise<NextResponse>,
  options?: {
    requireRole?: string;
  }
) {
  return async (request: NextRequest) => {
    // Extract RLS context from headers
    const context = extractRLSContext(request);

    // Validate context exists
    const contextError = validateRLSContext(context);
    if (contextError) {
      return contextError;
    }

    // Validate role if required
    if (options?.requireRole) {
      const roleError = validateRole(context!, options.requireRole);
      if (roleError) {
        return roleError;
      }
    }

    // Call the actual handler with validated context
    return handler(request, context!);
  };
}

/**
 * Create an RLS-aware Supabase client
 * Automatically applies user/tenant filters to all queries
 */
export function createRLSClient(supabase: any, context: RLSContext) {
  return new Proxy(supabase, {
    get(target, prop) {
      const value = target[prop];

      // Intercept 'from' method to apply RLS filters
      if (prop === 'from') {
        return (table: string) => {
          const query = target.from(table);

          // Apply RLS context to query
          return applyRLSFilter(query, context);
        };
      }

      return value;
    }
  });
}

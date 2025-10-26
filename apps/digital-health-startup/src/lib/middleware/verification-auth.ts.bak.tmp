/**
 * Authentication Middleware for Verification Endpoints
 *
 * Provides role-based access control for entity verification
 *
 * Roles:
 * - clinician: Can verify, approve, reject, and flag entities
 * - reviewer: Can view and flag entities (read-only + flag)
 * - admin: Full access to all verification features
 * - viewer: Read-only access to verification UI
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export type VerificationRole = 'clinician' | 'reviewer' | 'admin' | 'viewer';

export interface VerificationUser {
  id: string;
  email: string;
  role: VerificationRole;
  permissions: {
    canView: boolean;
    canApprove: boolean;
    canReject: boolean;
    canFlag: boolean;
    canExport: boolean;
    canManageQueue: boolean;
  };
}

/**
 * Permission matrix for verification roles
 */
const ROLE_PERMISSIONS: Record<VerificationRole, VerificationUser['permissions']> = {
  admin: {
    canView: true,
    canApprove: true,
    canReject: true,
    canFlag: true,
    canExport: true,
    canManageQueue: true
  },
  clinician: {
    canView: true,
    canApprove: true,
    canReject: true,
    canFlag: true,
    canExport: true,
    canManageQueue: false
  },
  reviewer: {
    canView: true,
    canApprove: false,
    canReject: false,
    canFlag: true,
    canExport: true,
    canManageQueue: false
  },
  viewer: {
    canView: true,
    canApprove: false,
    canReject: false,
    canFlag: false,
    canExport: false,
    canManageQueue: false
  }
};

/**
 * Verify JWT token and extract user information
 */
export async function verifyToken(token: string): Promise<VerificationUser | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Invalid token:', error);
      return null;
    }

    // Get user role from metadata or database
    // For now, default to 'viewer' - in production, fetch from user profile
    const role: VerificationRole = (user.user_metadata?.verification_role as VerificationRole) || 'viewer';

    return {
      id: user.id,
      email: user.email || '',
      role,
      permissions: ROLE_PERMISSIONS[role]
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Extract bearer token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and direct token
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }

  return authHeader;
}

/**
 * Middleware to require authentication for verification endpoints
 */
export async function requireAuth(
  request: NextRequest,
  requiredPermission?: keyof VerificationUser['permissions']
): Promise<{ user: VerificationUser } | NextResponse> {
  // Extract token from request
  const token = extractToken(request);

  if (!token) {
    // For development/demo, allow unauthenticated access with viewer role
    if (process.env.NODE_ENV === 'development' && process.env.ALLOW_ANONYMOUS_VERIFICATION === 'true') {
      console.warn('⚠️ Anonymous verification access enabled (development only)');
      return {
        user: {
          id: 'anonymous',
          email: 'anonymous@vital.ai',
          role: 'viewer',
          permissions: ROLE_PERMISSIONS.viewer
        }
      };
    }

    return NextResponse.json(
      { error: 'Authentication required. Please provide a valid token.' },
      { status: 401 }
    );
  }

  // Verify token and get user
  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Check required permission if specified
  if (requiredPermission) {
    const hasPermission = user.permissions[requiredPermission];

    if (!hasPermission) {
      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          required: requiredPermission,
          role: user.role
        },
        { status: 403 }
      );
    }
  }

  return { user };
}

/**
 * Middleware to require specific role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: VerificationRole[]
): Promise<{ user: VerificationUser } | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      {
        error: 'Access denied',
        required_roles: allowedRoles,
        user_role: user.role
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Create audit log entry for verification actions
 */
export async function createVerificationAuditLog(params: {
  entityId: string;
  action: string;
  user: VerificationUser;
  changes?: any;
  reason?: string;
}): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('entity_extraction_audit_log')
      .insert({
        entity_id: params.entityId,
        action: params.action,
        actor_id: params.user.id,
        actor_type: params.user.id === 'anonymous' ? 'system' : 'user',
        changes: params.changes || {},
        reason: params.reason || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to create audit log:', error);
    }
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

/**
 * Rate limiting for verification actions
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Create new rate limit window
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + windowMs
    });
    return { allowed: true };
  }

  if (userLimit.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      retryAfter: Math.ceil((userLimit.resetAt - now) / 1000)
    };
  }

  // Increment counter
  userLimit.count++;
  return { allowed: true };
}

/**
 * Helper to get user from request (use in route handlers)
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<VerificationUser | null> {
  const token = extractToken(request);

  if (!token) {
    // Development mode: allow anonymous
    if (process.env.NODE_ENV === 'development' && process.env.ALLOW_ANONYMOUS_VERIFICATION === 'true') {
      return {
        id: 'anonymous',
        email: 'anonymous@vital.ai',
        role: 'viewer',
        permissions: ROLE_PERMISSIONS.viewer
      };
    }
    return null;
  }

  return await verifyToken(token);
}

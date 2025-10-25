import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

import { UserRole, PermissionScope, PermissionAction } from '@vital/sdk/types/auth.types';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

interface PermissionCheck {
  scope: PermissionScope;
  action: PermissionAction;
}

export class AuthMiddleware {
  private static instance: AuthMiddleware;
  private rolePermissions: Map<UserRole, Set<string>> = new Map();

  constructor() {
    this.initializePermissions();
  }

  static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  private initializePermissions() {
    // Super Admin - Full access
    this.rolePermissions.set(UserRole.SUPER_ADMIN, new Set([
      'llm_providers:create', 'llm_providers:read', 'llm_providers:update', 'llm_providers:delete', 'llm_providers:manage',
      'agents:create', 'agents:read', 'agents:update', 'agents:delete', 'agents:manage',
      'workflows:create', 'workflows:read', 'workflows:update', 'workflows:delete', 'workflows:execute',
      'analytics:read', 'analytics:manage',
      'system_settings:read', 'system_settings:update', 'system_settings:manage',
      'user_management:create', 'user_management:read', 'user_management:update', 'user_management:delete', 'user_management:manage',
      'audit_logs:read'
    ]));

    // Admin - Almost full access except user management
    this.rolePermissions.set(UserRole.ADMIN, new Set([
      'llm_providers:create', 'llm_providers:read', 'llm_providers:update', 'llm_providers:delete', 'llm_providers:manage',
      'agents:create', 'agents:read', 'agents:update', 'agents:delete', 'agents:manage',
      'workflows:create', 'workflows:read', 'workflows:update', 'workflows:delete', 'workflows:execute',
      'analytics:read',
      'system_settings:read', 'system_settings:update',
      'audit_logs:read'
    ]));

    // LLM Manager - Focused on LLM management
    this.rolePermissions.set(UserRole.LLM_MANAGER, new Set([
      'llm_providers:create', 'llm_providers:read', 'llm_providers:update', 'llm_providers:delete',
      'agents:read',
      'workflows:read', 'workflows:execute',
      'analytics:read'
    ]));

    // User - Basic operational access
    this.rolePermissions.set(UserRole.USER, new Set([
      'llm_providers:read',
      'agents:read', 'agents:create', 'agents:update',
      'workflows:read', 'workflows:execute',
      'analytics:read'
    ]));

    // Viewer - Read-only access
    this.rolePermissions.set(UserRole.VIEWER, new Set([
      'llm_providers:read',
      'agents:read',
      'workflows:read',
      'analytics:read'
    ]));
  }

  async authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
    try {
      const response = NextResponse.next();
      const supabase = createMiddlewareClient({ req: request, res: response });

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        return null;
      }

      // Get user profile with role information
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('email, role, is_active')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || !userProfile || !userProfile.is_active) {
        return null;
      }

      return {
        id: session.user.id,
        email: userProfile.email,
        role: userProfile.role as UserRole,
        isActive: userProfile.is_active
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  checkPermission(user: AuthenticatedUser, permission: PermissionCheck): boolean {
    const userPermissions = this.rolePermissions.get(user.role);
    if (!userPermissions) {
      return false;
    }

    const permissionKey = `${permission.scope}:${permission.action}`;
    return userPermissions.has(permissionKey);
  }

  isAdmin(user: AuthenticatedUser): boolean {
    return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
  }

  isSuperAdmin(user: AuthenticatedUser): boolean {
    return user.role === UserRole.SUPER_ADMIN;
  }

  async logSecurityEvent(
    request: NextRequest,
    user: AuthenticatedUser | null,
    action: string,
    resourceType?: string,
    resourceId?: string,
    success: boolean = true,
    errorMessage?: string
  ) {
    try {
      const response = NextResponse.next();
      const supabase = createMiddlewareClient({ req: request, res: response });

      const userAgent = request.headers.get('user-agent') || '';
      const ipAddress = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';

      await supabase
        .from('security_audit_log')
        .insert({
          user_id: user?.id || null,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          ip_address: ipAddress,
          user_agent: userAgent,
          success,
          error_message: errorMessage
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

// Middleware wrapper functions for API routes
export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = AuthMiddleware.getInstance();
// const user = // Unused variable await auth.authenticateRequest(request);

    if (!user) {
      await auth.logSecurityEvent(request, null, 'UNAUTHORIZED_ACCESS', 'api', request.nextUrl.pathname, false, 'No valid session');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

export function requirePermission(permission: PermissionCheck) {
  return function(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      const auth = AuthMiddleware.getInstance();
// const user = // Unused variable await auth.authenticateRequest(request);

      if (!user) {
        await auth.logSecurityEvent(request, null, 'UNAUTHORIZED_ACCESS', 'api', request.nextUrl.pathname, false, 'No valid session');
        return NextResponse.json(
          { error: 'Unauthorized - Please log in' },
          { status: 401 }
        );
      }

      if (!auth.checkPermission(user, permission)) {
        await auth.logSecurityEvent(
          request,
          user,
          'FORBIDDEN_ACCESS',
          'api',
          request.nextUrl.pathname,
          false,
          `Missing permission: ${permission.scope}:${permission.action}`
        );
        return NextResponse.json(
          { error: `Forbidden - Missing permission: ${permission.scope}:${permission.action}` },
          { status: 403 }
        );
      }

      await auth.logSecurityEvent(request, user, 'API_ACCESS', 'api', request.nextUrl.pathname, true);
      return handler(request, user);
    };
  };
}

export function requireAdmin(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = AuthMiddleware.getInstance();
// const user = // Unused variable await auth.authenticateRequest(request);

    if (!user) {
      await auth.logSecurityEvent(request, null, 'UNAUTHORIZED_ACCESS', 'api', request.nextUrl.pathname, false, 'No valid session');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    if (!auth.isAdmin(user)) {
      await auth.logSecurityEvent(request, user, 'FORBIDDEN_ACCESS', 'api', request.nextUrl.pathname, false, 'Admin access required');
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    await auth.logSecurityEvent(request, user, 'ADMIN_ACCESS', 'api', request.nextUrl.pathname, true);
    return handler(request, user);
  };
}

export function requireSuperAdmin(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = AuthMiddleware.getInstance();
// const user = // Unused variable await auth.authenticateRequest(request);

    if (!user) {
      await auth.logSecurityEvent(request, null, 'UNAUTHORIZED_ACCESS', 'api', request.nextUrl.pathname, false, 'No valid session');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    if (!auth.isSuperAdmin(user)) {
      await auth.logSecurityEvent(request, user, 'FORBIDDEN_ACCESS', 'api', request.nextUrl.pathname, false, 'Super admin access required');
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    await auth.logSecurityEvent(request, user, 'SUPER_ADMIN_ACCESS', 'api', request.nextUrl.pathname, true);
    return handler(request, user);
  };
}

// Rate limiting for security
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return function(handler: (request: NextRequest, user?: AuthenticatedUser) => Promise<NextResponse>) {
    return async (request: NextRequest, user?: AuthenticatedUser) => {
      const clientId = user?.id || request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      const windowStart = now - windowMs;

      const clientData = requestCounts.get(clientId);

      if (!clientData || clientData.resetTime < windowStart) {
        requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
      } else if (clientData.count >= maxRequests) {
        const auth = AuthMiddleware.getInstance();
        await auth.logSecurityEvent(request, user || null, 'RATE_LIMIT_EXCEEDED', 'api', request.nextUrl.pathname, false);
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429, headers: { 'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString() } }
        );
      } else {
        clientData.count++;
      }

      return handler(request, user);
    };
  };
}

export default AuthMiddleware;
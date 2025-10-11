/**
 * Unified API Authentication Middleware
 * Provides consistent authentication and authorization for all API routes
 */

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// User role hierarchy
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Permission levels
export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// API route permissions mapping
const API_PERMISSIONS: Record<string, PermissionLevel> = {
  // Public routes (no auth required)
  '/api/health': PermissionLevel.READ,
  '/api/auth/login': PermissionLevel.READ,
  '/api/auth/register': PermissionLevel.READ,
  '/api/auth/logout': PermissionLevel.READ,
  '/api/public/': PermissionLevel.READ,
  
  // User routes (authenticated users)
  '/api/agents/': PermissionLevel.READ,
  '/api/knowledge/': PermissionLevel.READ,
  '/api/chat/': PermissionLevel.READ,
  '/api/workflows/': PermissionLevel.READ,
  '/api/medical-intelligence/': PermissionLevel.READ,
  '/api/llm/': PermissionLevel.READ,
  '/api/events/': PermissionLevel.READ,
  '/api/dashboard/': PermissionLevel.READ,
  '/api/settings/': PermissionLevel.WRITE,
  '/api/profile/': PermissionLevel.WRITE,
  
  // Admin routes (admin+ required)
  '/api/admin/': PermissionLevel.ADMIN,
  '/api/audit/': PermissionLevel.ADMIN,
  '/api/compliance/': PermissionLevel.ADMIN,
  '/api/security/': PermissionLevel.ADMIN,
  '/api/backup/': PermissionLevel.ADMIN,
  '/api/monitoring/': PermissionLevel.ADMIN,
  
  // Super admin routes
  '/api/super-admin/': PermissionLevel.SUPER_ADMIN,
  '/api/system/': PermissionLevel.SUPER_ADMIN
};

// Rate limiting configuration
const RATE_LIMITS = {
  [PermissionLevel.READ]: { requests: 1000, window: 60 * 1000 }, // 1000 req/min
  [PermissionLevel.WRITE]: { requests: 100, window: 60 * 1000 },  // 100 req/min
  [PermissionLevel.ADMIN]: { requests: 500, window: 60 * 1000 },  // 500 req/min
  [PermissionLevel.SUPER_ADMIN]: { requests: 1000, window: 60 * 1000 } // 1000 req/min
};

// Input validation schemas
const commonSchemas = {
  id: z.string().uuid(),
  email: z.string().email(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().max(255).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
};

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: PermissionLevel[];
  isActive: boolean;
  organizationId?: string;
  lastAccess: Date;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  statusCode?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export class APIAuthMiddleware {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Missing required Supabase environment variables');
    }
  }

  /**
   * Main authentication handler for API routes
   */
  async authenticateRequest(request: NextRequest): Promise<AuthResult> {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Check if route requires authentication
      const requiredPermission = this.getRequiredPermission(pathname);
      if (!requiredPermission) {
        return { success: true }; // Public route
      }

      // Get Supabase client
      const supabase = this.createSupabaseClient(request);

      // Authenticate user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required',
          statusCode: 401
        };
      }

      // Get user profile and role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, is_active, organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          error: 'User profile not found',
          statusCode: 401
        };
      }

      if (!profile.is_active) {
        return {
          success: false,
          error: 'Account is deactivated',
          statusCode: 403
        };
      }

      // Check permissions
      const hasPermission = this.checkPermission(profile.role as UserRole, requiredPermission);
      if (!hasPermission) {
        return {
          success: false,
          error: 'Insufficient permissions',
          statusCode: 403
        };
      }

      // Check rate limits
      const rateLimitResult = this.checkRateLimit(user.id, requiredPermission);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          statusCode: 429
        };
      }

      // Create authenticated user object
      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        email: user.email!,
        role: profile.role as UserRole,
        permissions: this.getUserPermissions(profile.role as UserRole),
        isActive: profile.is_active,
        organizationId: profile.organization_id,
        lastAccess: new Date()
      };

      return {
        success: true,
        user: authenticatedUser
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      };
    }
  }

  /**
   * Validate input data using Zod schemas
   */
  validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`
        };
      }
      return {
        success: false,
        error: 'Invalid input data'
      };
    }
  }

  /**
   * Sanitize input data to prevent XSS and injection attacks
   */
  sanitizeInput(input: unknown): unknown {
    if (typeof input === 'string') {
      // Remove potentially dangerous characters
      return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (input && typeof input === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        // Sanitize keys
        const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '');
        sanitized[cleanKey] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Create standardized error response
   */
  createErrorResponse(error: string, statusCode: number = 400, details?: unknown): NextResponse {
    const response = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
      ...(details && typeof details === 'object' ? { details } : {})
    };

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Create standardized success response
   */
  createSuccessResponse(data: unknown, statusCode: number = 200): NextResponse {
    const response = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * Log API access for audit purposes
   */
  async logAPIAccess(
    user: AuthenticatedUser,
    request: NextRequest,
    response: NextResponse,
    duration: number
  ): Promise<void> {
    try {
      const supabase = this.createSupabaseClient(request);
      
      await supabase.from('security_audit_log').insert({
        user_id: user.id,
        action: 'api_access',
        resource_type: 'api_endpoint',
        resource_id: request.nextUrl.pathname,
        ip_address: request.ip || request.headers.get('x-forwarded-for'),
        user_agent: request.headers.get('user-agent'),
        success: response.status < 400,
        details: {
          method: request.method,
          duration,
          statusCode: response.status
        }
      });
    } catch (error) {
      console.error('Failed to log API access:', error);
    }
  }

  // Private helper methods

  private createSupabaseClient(request: NextRequest) {
    return createServerClient(
      this.supabaseUrl,
      this.supabaseKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {
            // Not implemented for API routes
          },
          remove() {
            // Not implemented for API routes
          }
        }
      }
    );
  }

  private getRequiredPermission(pathname: string): PermissionLevel | null {
    for (const [pattern, permission] of Object.entries(API_PERMISSIONS)) {
      if (pathname.startsWith(pattern)) {
        return permission;
      }
    }
    return null; // Public route
  }

  private checkPermission(userRole: UserRole, requiredPermission: PermissionLevel): boolean {
    const roleHierarchy = {
      [UserRole.USER]: [PermissionLevel.READ, PermissionLevel.WRITE],
      [UserRole.ADMIN]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN],
      [UserRole.SUPER_ADMIN]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN, PermissionLevel.SUPER_ADMIN]
    };

    return roleHierarchy[userRole]?.includes(requiredPermission) || false;
  }

  private getUserPermissions(role: UserRole): PermissionLevel[] {
    const roleHierarchy = {
      [UserRole.USER]: [PermissionLevel.READ, PermissionLevel.WRITE],
      [UserRole.ADMIN]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN],
      [UserRole.SUPER_ADMIN]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN, PermissionLevel.SUPER_ADMIN]
    };

    return roleHierarchy[role] || [];
  }

  private checkRateLimit(userId: string, permission: PermissionLevel): RateLimitResult {
    const key = `${userId}:${permission}`;
    const now = Date.now();
    const limit = RATE_LIMITS[permission];
    
    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      // Reset or create new limit
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + limit.window
      });
      
      return {
        allowed: true,
        remaining: limit.requests - 1,
        resetTime: now + limit.window
      };
    }
    
    if (current.count >= limit.requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      };
    }
    
    // Increment count
    current.count++;
    rateLimitStore.set(key, current);
    
    return {
      allowed: true,
      remaining: limit.requests - current.count,
      resetTime: current.resetTime
    };
  }
}

// Export singleton instance
export const apiAuth = new APIAuthMiddleware();

// Export common schemas for use in API routes
export { commonSchemas };

// Export helper function for easy use in API routes
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
): Promise<NextResponse> {
  const authResult = await apiAuth.authenticateRequest(request);
  
  if (!authResult.success) {
    return apiAuth.createErrorResponse(
      authResult.error || 'Authentication failed',
      authResult.statusCode || 401
    );
  }
  
  if (!authResult.user) {
    return apiAuth.createErrorResponse('User not found', 401);
  }
  
  const startTime = Date.now();
  
  try {
    const response = await handler(request, authResult.user);
    const duration = Date.now() - startTime;
    
    // Log API access
    await apiAuth.logAPIAccess(authResult.user, request, response, duration);
    
    return response;
  } catch (error) {
    console.error('API handler error:', error);
    return apiAuth.createErrorResponse(
      'Internal server error',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// Additional helper functions for permission checking
export function requirePermission(scope: string, action: string) {
  return async (user: AuthenticatedUser) => {
    // This would integrate with the PermissionService
    // For now, we'll use the existing role-based check
    const hasPermission = user.permissions.includes(PermissionLevel.ADMIN) || 
                         user.permissions.includes(PermissionLevel.SUPER_ADMIN);
    
    if (!hasPermission) {
      throw new Error(`Insufficient permissions: ${scope}:${action}`);
    }
    
    return true;
  };
}

export function requireRole(roles: UserRole[]) {
  return (user: AuthenticatedUser) => {
    if (!roles.includes(user.role)) {
      throw new Error('Insufficient role permissions');
    }
    return true;
  };
}

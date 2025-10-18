/**
 * VITAL RAG System - Tenant Middleware
 * 
 * Next.js middleware for tenant isolation, authentication, and context management.
 * Automatically extracts tenant information from requests and sets up proper context.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  TenantContextManager, 
  TenantService, 
  TenantContext, 
  TenantPermissions 
} from '../tenant/tenant-context';
import { 
  AuthenticationError, 
  AuthorizationError, 
  ValidationError,
  RAGErrorFactory 
} from '../errors/rag-errors';
import { getLogger } from '../logging/logger';

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export interface TenantMiddlewareConfig {
  // Routes that require tenant context
  protectedRoutes: string[];
  
  // Routes that are public (no tenant required)
  publicRoutes: string[];
  
  // Header names for tenant identification
  tenantHeader: string;
  userHeader: string;
  sessionHeader: string;
  
  // Default tenant for development
  defaultTenant?: string;
  
  // Enable strict tenant validation
  strictMode: boolean;
}

const defaultConfig: TenantMiddlewareConfig = {
  protectedRoutes: [
    '/api/knowledge',
    '/api/rag',
    '/api/search',
    '/api/upload',
    '/api/tenants'
  ],
  publicRoutes: [
    '/api/health',
    '/api/auth',
    '/api/public'
  ],
  tenantHeader: 'x-tenant-id',
  userHeader: 'x-user-id',
  sessionHeader: 'x-session-id',
  defaultTenant: process.env.DEFAULT_TENANT_ID,
  strictMode: process.env.NODE_ENV === 'production'
};

// ============================================================================
// TENANT MIDDLEWARE CLASS
// ============================================================================

export class TenantMiddleware {
  private static instance: TenantMiddleware;
  private config: TenantMiddlewareConfig;
  private tenantManager: TenantContextManager;
  private tenantService: TenantService;
  private logger = getLogger();

  private constructor(config: Partial<TenantMiddlewareConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.tenantManager = TenantContextManager.getInstance();
    this.tenantService = TenantService.getInstance();
  }

  static getInstance(config?: Partial<TenantMiddlewareConfig>): TenantMiddleware {
    if (!TenantMiddleware.instance) {
      TenantMiddleware.instance = new TenantMiddleware(config);
    }
    return TenantMiddleware.instance;
  }

  /**
   * Main middleware function
   */
  async handle(request: NextRequest): Promise<NextResponse | null> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    this.logger.info('Processing tenant middleware', {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent')
    });

    try {
      // Check if route requires tenant context
      if (!this.requiresTenantContext(request)) {
        this.logger.debug('Route does not require tenant context', { requestId, url: request.url });
        return null; // Continue to next middleware
      }

      // Extract tenant context from request
      const tenantContext = await this.extractTenantContext(request, requestId);
      
      // Validate tenant access
      await this.validateTenantAccess(tenantContext, request, requestId);
      
      // Set tenant context
      this.tenantManager.setContext(tenantContext);
      
      // Add tenant headers to response
      const response = NextResponse.next();
      this.addTenantHeaders(response, tenantContext);
      
      const duration = Date.now() - startTime;
      this.logger.info('Tenant middleware completed', {
        requestId,
        tenantId: tenantContext.tenantId,
        userId: tenantContext.userId,
        duration
      });

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Tenant middleware failed', {
        requestId,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });

      return this.handleMiddlewareError(error, requestId);
    }
  }

  /**
   * Check if route requires tenant context
   */
  private requiresTenantContext(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    
    // Check if route is explicitly public
    if (this.config.publicRoutes.some(route => pathname.startsWith(route))) {
      return false;
    }
    
    // Check if route is protected
    return this.config.protectedRoutes.some(route => pathname.startsWith(route));
  }

  /**
   * Extract tenant context from request
   */
  private async extractTenantContext(request: NextRequest, requestId: string): Promise<TenantContext> {
    // Extract tenant ID from headers
    const tenantId = this.extractTenantId(request);
    const userId = request.headers.get(this.config.userHeader) || undefined;
    const sessionId = request.headers.get(this.config.sessionHeader) || undefined;

    this.logger.debug('Extracted tenant context', {
      requestId,
      tenantId,
      userId,
      sessionId
    });

    // Validate tenant exists and is active
    if (this.config.strictMode) {
      const isActive = await this.tenantService.isTenantActive(tenantId);
      if (!isActive) {
        throw new AuthenticationError(`Tenant ${tenantId} is not active`, {
          tenantId,
          requestId
        });
      }
    }

    // Get tenant permissions
    const permissions = await this.tenantService.getTenantPermissions(tenantId, userId);

    return {
      tenantId,
      userId,
      sessionId,
      permissions,
      metadata: {
        requestId,
        userAgent: request.headers.get('user-agent'),
        ip: this.getClientIP(request)
      }
    };
  }

  /**
   * Extract tenant ID from request
   */
  private extractTenantId(request: NextRequest): string {
    // Try header first
    const headerTenantId = request.headers.get(this.config.tenantHeader);
    if (headerTenantId) {
      return headerTenantId;
    }

    // Try query parameter
    const queryTenantId = request.nextUrl.searchParams.get('tenant_id');
    if (queryTenantId) {
      return queryTenantId;
    }

    // Try default tenant for development
    if (this.config.defaultTenant && !this.config.strictMode) {
      this.logger.warn('Using default tenant for development', {
        defaultTenant: this.config.defaultTenant
      });
      return this.config.defaultTenant;
    }

    throw new AuthenticationError('Tenant ID not provided', {
      headers: Object.fromEntries(request.headers.entries()),
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries())
    });
  }

  /**
   * Validate tenant access
   */
  private async validateTenantAccess(
    context: TenantContext, 
    request: NextRequest, 
    requestId: string
  ): Promise<void> {
    // Check if tenant is active
    const isActive = await this.tenantService.isTenantActive(context.tenantId);
    if (!isActive) {
      throw new AuthorizationError(`Tenant ${context.tenantId} is not active`, {
        tenantId: context.tenantId,
        requestId
      });
    }

    // Check specific permissions based on route
    const pathname = request.nextUrl.pathname;
    const method = request.method;

    if (pathname.includes('/search') && method === 'POST') {
      this.tenantManager.validateAccess('canSearch', pathname);
    } else if (pathname.includes('/upload') && method === 'POST') {
      this.tenantManager.validateAccess('canUpload', pathname);
    } else if (pathname.includes('/sources') && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      this.tenantManager.validateAccess('canManageSources', pathname);
    } else if (method === 'GET') {
      this.tenantManager.validateAccess('canRead', pathname);
    } else if (method === 'POST' || method === 'PUT') {
      this.tenantManager.validateAccess('canWrite', pathname);
    } else if (method === 'DELETE') {
      this.tenantManager.validateAccess('canDelete', pathname);
    }

    this.logger.debug('Tenant access validated', {
      requestId,
      tenantId: context.tenantId,
      pathname,
      method
    });
  }

  /**
   * Add tenant headers to response
   */
  private addTenantHeaders(response: NextResponse, context: TenantContext): void {
    response.headers.set('x-tenant-id', context.tenantId);
    response.headers.set('x-request-id', context.metadata?.requestId || '');
    
    if (context.userId) {
      response.headers.set('x-user-id', context.userId);
    }
    
    if (context.sessionId) {
      response.headers.set('x-session-id', context.sessionId);
    }
  }

  /**
   * Handle middleware errors
   */
  private handleMiddlewareError(error: unknown, requestId: string): NextResponse {
    const ragError = RAGErrorFactory.fromUnknown(error, { requestId });
    
    const response = NextResponse.json(
      {
        error: {
          code: ragError.code,
          message: ragError.getUserMessage(),
          requestId
        },
        timestamp: new Date().toISOString()
      },
      { status: ragError.statusCode }
    );

    // Add error headers
    response.headers.set('x-error-code', ragError.code);
    response.headers.set('x-request-id', requestId);

    return response;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return request.ip || 'unknown';
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create tenant middleware instance
 */
export function createTenantMiddleware(config?: Partial<TenantMiddlewareConfig>): TenantMiddleware {
  return new TenantMiddleware(config);
}

/**
 * Get tenant middleware instance
 */
export function getTenantMiddleware(): TenantMiddleware {
  return TenantMiddleware.getInstance();
}

/**
 * Middleware function for Next.js
 */
export async function tenantMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const middleware = getTenantMiddleware();
  return middleware.handle(request);
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

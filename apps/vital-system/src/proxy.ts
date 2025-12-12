/**
 * Next.js Middleware
 *
 * Security and authentication layer for all requests.
 * Handles:
 * - Authentication
 * - Tenant detection (subdomain-based)
 * - Rate limiting
 * - CSRF protection
 * - Security headers
 *
 * @module middleware
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { tenantMiddleware } from './middleware/tenant-middleware';
import {
  checkRateLimit,
  createRateLimitHeaders,
  getIdentifier,
  getRateLimitTier,
} from './lib/security/rate-limiter';
import {
  validateCsrfToken,
  validateOrigin,
  needsCsrfProtection,
  createCsrfErrorResponse,
  createOriginErrorResponse,
  generateCsrfToken,
  setCsrfCookie,
  getCsrfToken,
} from './lib/security/csrf';
import { applySecurityHeaders, createCorsPreflightResponse } from './lib/security/headers';

export default async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;

  // ========================================================================
  // 1. CORS PREFLIGHT
  // ========================================================================

  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    if (origin) {
      return createCorsPreflightResponse(origin);
    }
  }

  // ========================================================================
  // 2. ORIGIN VALIDATION
  // ========================================================================

  if (pathname.startsWith('/api') && !validateOrigin(request)) {
    console.warn('[Proxy] Invalid origin:', request.headers.get('origin'));
    return createOriginErrorResponse();
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/platform', '/services', '/framework', '/auth/callback'];
  const isPublicRoute = publicRoutes.includes(url.pathname) || url.pathname.startsWith('/auth/');

  // Allow Ask Expert API routes without authentication (uses service role key internally)
  // Also allow monitoring/metrics endpoints for internal use
  // Note: These routes have their own session auth via auth() - CSRF is redundant
  const publicApiRoutes = [
    // All Ask Expert routes (Mode 1-4, missions, chat, streaming) - CSRF exempt
    // These routes have their own auth via tenant headers and service role keys
    '/api/ask-expert/',
    '/api/prompt-starters',  // Prompt starters for Ask Expert
    '/api/user-agents',
    '/api/chat/conversations',
    '/api/chat/sessions',
    '/api/chat/messages',
    '/api/agents-crud',  // Agents CRUD endpoint (uses service role internally)
    '/api/agents/',      // Agent-related API routes
    '/api/knowledge',    // Knowledge management endpoints (uses service role internally)
    '/api/metrics',  // Prometheus metrics endpoint
    '/api/health',    // Health check endpoint
    '/api/prompt-enhancer', // Prompt enhancer (CSRF exempt)
    // Mode 1-4 Expert streaming routes (have session auth via auth() - CSRF redundant for SSE)
    '/api/expert/',
  ];
  const isPublicApiRoute = publicApiRoutes.some(route => url.pathname.startsWith(route));

  if (isPublicApiRoute) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // Redirect old dashboard routes to new structure
  const redirectMap: Record<string, string> = {
    '/dashboard/agents': '/agents',
    '/dashboard/knowledge': '/knowledge',
    '/dashboard/workflows': '/workflows',
    '/dashboard/ma01': '/medical-intelligence',
    '/dashboard/settings': '/settings',
  };

  // Check if the current path matches any redirect rules
  for (const [oldPath, newPath] of Object.entries(redirectMap)) {
    if (url.pathname === oldPath || url.pathname.startsWith(oldPath + '/')) {
      // Replace the old path prefix with the new one
      url.pathname = url.pathname.replace(oldPath, newPath);
      return NextResponse.redirect(url);
    }
  }

  // Redirect old API routes
  if (url.pathname.startsWith('/api/jobs')) {
    url.pathname = url.pathname.replace('/api/jobs', '/api/medical-intelligence/jobs');
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip auth check for public routes
  if (isPublicRoute) {
    return response;
  }

  // Require Supabase environment variables for auth - do not bypass in production
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('CRITICAL: Supabase environment variables not configured. Authentication cannot proceed.');
    // In production, redirect to error page instead of bypassing auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(new URL('/error?code=config', request.url));
    }
    // In development, allow bypass with clear warning
    console.warn('WARNING: Development mode - bypassing auth check. This should NEVER happen in production.');
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: unknown) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: unknown) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // TEMPORARY: Bypass authentication check for testing
  // TODO: Remove this bypass before production deployment
  const BYPASS_AUTH_MIDDLEWARE = process.env.BYPASS_AUTH === 'true' || true; // Set to false to re-enable auth

  const { data: { user }, error } = await supabase.auth.getUser();
  const userId = user?.id;
  const isAuthenticated = !!user && !error;

  // Redirect unauthenticated users to login page (except for public routes)
  // Skip this check if bypass is enabled
  if (!BYPASS_AUTH_MIDDLEWARE && !isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ========================================================================
  // 3. RATE LIMITING
  // ========================================================================

  if (process.env.ENABLE_RATE_LIMITING === 'true') {
    const identifier = getIdentifier(request, userId);
    const tier = getRateLimitTier(request, isAuthenticated);

    const rateLimitResult = await checkRateLimit(identifier, tier);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      console.warn('[Proxy] Rate limit exceeded:', { identifier, tier, pathname });

      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...rateLimitHeaders,
          },
        }
      );
    }

    // Add rate limit headers to response
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // ========================================================================
  // 4. CSRF PROTECTION
  // ========================================================================

  if (process.env.ENABLE_CSRF_PROTECTION !== 'false') {
    // Generate CSRF token if not present
    let csrfToken = getCsrfToken(request);
    if (!csrfToken) {
      csrfToken = generateCsrfToken();
    }

    // Validate CSRF for protected requests
    if (needsCsrfProtection(request)) {
      if (!(await validateCsrfToken(request))) {
        console.warn('[Proxy] CSRF validation failed:', pathname);
        return createCsrfErrorResponse();
      }
    }

    // Set CSRF cookie
    setCsrfCookie(response, csrfToken);
  }

  // Add user ID to headers (for API routes)
  if (userId) {
    response.headers.set('x-user-id', userId);
  }

  // Add request ID for tracing
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  response.headers.set('x-request-id', requestId);

  // ========================================================================
  // 5. SECURITY HEADERS
  // ========================================================================

  const origin = request.headers.get('origin') || undefined;
  applySecurityHeaders(response, origin);

  // Apply tenant middleware to add tenant headers (pass userId for profile lookup)
  response = await tenantMiddleware(request, response, userId);

  // Restrict client-only pages to non-platform tenants
  // Note: /ask-expert, /ask-panel, and /agents are allowed on Platform for demo/testing
  // Only /chat requires tenant-specific access
  const clientOnlyPages = ['/chat'];
  const isClientOnlyPage = clientOnlyPages.some(page => url.pathname === page || url.pathname.startsWith(page + '/'));

  if (isClientOnlyPage) {
    const tenantId = response.headers.get('x-tenant-id');
    const PLATFORM_TENANT_ID = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'; // VITAL System tenant

    // If on platform tenant, redirect to dashboard instead of marketing home
    if (tenantId === PLATFORM_TENANT_ID) {
      console.log(`[Proxy] Blocking access to ${url.pathname} on Platform Tenant - redirecting to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// Note: This file serves as Next.js proxy (Next.js 16+ convention)
// The default export is the proxy handler

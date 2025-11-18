/**
 * Security Headers
 *
 * Comprehensive security headers for defense in depth.
 * Implements OWASP recommendations.
 *
 * Features:
 * - Content Security Policy (CSP)
 * - XSS Protection
 * - Clickjacking prevention
 * - MIME sniffing prevention
 * - HTTPS enforcement
 *
 * @module lib/security/headers
 */

import type { NextResponse } from 'next/server';

// ============================================================================
// SECURITY HEADERS CONFIGURATION
// ============================================================================

/**
 * Content Security Policy
 *
 * Restricts resource loading to prevent XSS attacks.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
function getContentSecurityPolicy(): string {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const directives = [
    // Default: only same origin
    "default-src 'self'",

    // Scripts: self + inline (with nonce in production)
    isDevelopment
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline'",

    // Styles: self + inline
    "style-src 'self' 'unsafe-inline'",

    // Images: self + data URIs + external CDNs
    "img-src 'self' data: https:",

    // Fonts: self + data URIs
    "font-src 'self' data:",

    // Connections: self + API domains
    `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://*.supabase.co`,

    // Frames: none (prevent clickjacking)
    "frame-src 'none'",

    // Objects: none (prevent Flash/Java)
    "object-src 'none'",

    // Base URI: self only
    "base-uri 'self'",

    // Form actions: self only
    "form-action 'self'",

    // Frame ancestors: none (additional clickjacking protection)
    "frame-ancestors 'none'",

    // Upgrade insecure requests (HTTPS)
    'upgrade-insecure-requests',

    // Block mixed content
    'block-all-mixed-content',
  ];

  return directives.join('; ');
}

/**
 * Get all security headers
 *
 * Comprehensive security headers following OWASP recommendations.
 *
 * @returns Security headers object
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Content Security Policy
    'Content-Security-Policy': getContentSecurityPolicy(),

    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',

    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Referrer policy (privacy)
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy (restrict browser features)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
    ].join(', '),

    // Strict Transport Security (HTTPS enforcement)
    // Only in production
    ...(process.env.NODE_ENV === 'production'
      ? {
          'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        }
      : {}),
  };
}

/**
 * Get CORS headers
 *
 * Configure Cross-Origin Resource Sharing.
 *
 * @param origin - Request origin
 * @returns CORS headers
 */
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL!,
    ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
  ];

  // Check if origin is allowed
  const isAllowed = origin && allowedOrigins.includes(origin);

  if (!isAllowed) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Apply security headers to response
 *
 * @param response - Next.js response
 * @param origin - Optional request origin for CORS
 * @returns Response with security headers
 */
export function applySecurityHeaders(response: NextResponse, origin?: string): NextResponse {
  const securityHeaders = getSecurityHeaders();
  const corsHeaders = origin ? getCorsHeaders(origin) : {};

  // Apply all headers
  Object.entries({ ...securityHeaders, ...corsHeaders }).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Create OPTIONS response with CORS headers
 *
 * Handles preflight requests.
 *
 * @param origin - Request origin
 * @returns OPTIONS response
 */
export function createCorsPreflightResponse(origin: string): Response {
  const corsHeaders = getCorsHeaders(origin);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Additional headers for specific content types
 */
export const CONTENT_TYPE_HEADERS = {
  json: { 'Content-Type': 'application/json; charset=utf-8' },
  html: { 'Content-Type': 'text/html; charset=utf-8' },
  text: { 'Content-Type': 'text/plain; charset=utf-8' },
  stream: { 'Content-Type': 'text/event-stream; charset=utf-8' },
} as const;

/**
 * Cache control headers
 */
export const CACHE_HEADERS = {
  noCache: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
  shortCache: {
    'Cache-Control': 'public, max-age=60, s-maxage=60',
  },
  longCache: {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
  },
  immutable: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
} as const;

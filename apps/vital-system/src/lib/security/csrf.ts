/**
 * CSRF Protection
 *
 * Double-submit cookie pattern for CSRF protection.
 * Validates that requests come from legitimate origins.
 *
 * Features:
 * - Double-submit cookie pattern
 * - Cryptographically secure tokens
 * - Origin validation
 * - SameSite cookie attributes
 *
 * @module lib/security/csrf
 */

import type { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = '__Host-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET!;

/**
 * Methods that require CSRF protection
 */
const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;

/**
 * Allowed origins (for CORS)
 */
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL!,
  ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
];

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate CSRF token
 *
 * Creates a cryptographically secure random token.
 *
 * @returns CSRF token (hex string)
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash CSRF token with secret
 *
 * Used for double-submit cookie pattern.
 * Uses Web Crypto API for Edge runtime compatibility.
 *
 * @param token - CSRF token
 * @returns Hashed token
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${token}${CSRF_SECRET}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate CSRF token
 *
 * Compares token from cookie with token from header.
 *
 * @param request - Next.js request
 * @returns True if valid
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Skip CSRF for safe methods (GET, HEAD, OPTIONS)
  if (!PROTECTED_METHODS.includes(request.method as typeof PROTECTED_METHODS[number])) {
    return true;
  }

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!cookieToken) {
    return false;
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const expectedHash = await hashToken(cookieToken);
  const actualHash = await hashToken(headerToken);

  return timingSafeEqual(expectedHash, actualHash);
}

/**
 * Timing-safe string comparison
 *
 * Prevents timing attacks by ensuring comparison takes constant time.
 *
 * @param a - First string
 * @param b - Second string
 * @returns True if equal
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// ============================================================================
// ORIGIN VALIDATION
// ============================================================================

/**
 * Validate request origin
 *
 * Ensures requests come from allowed origins.
 *
 * @param request - Next.js request
 * @returns True if valid origin
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // If no origin/referer, it's likely a direct API call (allow for now)
  if (!origin && !referer) {
    return true;
  }

  // Development: Allow all localhost origins
  if (process.env.NODE_ENV === 'development') {
    if (origin?.includes('localhost') || origin?.includes('127.0.0.1')) {
      return true;
    }
    if (referer?.includes('localhost') || referer?.includes('127.0.0.1')) {
      return true;
    }
  }

  // Check origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Check referer (fallback)
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      if (ALLOWED_ORIGINS.includes(refererOrigin)) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

// ============================================================================
// COOKIE HELPERS
// ============================================================================

/**
 * Create CSRF cookie options
 *
 * Secure cookie configuration:
 * - HttpOnly: Prevents XSS access
 * - Secure: HTTPS only
 * - SameSite: Strict (prevents CSRF)
 * - __Host prefix: Additional security
 *
 * @returns Cookie options
 */
export function createCsrfCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict';
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  };
}

/**
 * Set CSRF token in response
 *
 * @param response - Next.js response
 * @param token - CSRF token
 */
export function setCsrfCookie(response: NextResponse, token: string): void {
  const options = createCsrfCookieOptions();

  response.cookies.set(CSRF_COOKIE_NAME, token, options);
}

/**
 * Get CSRF token from request
 *
 * @param request - Next.js request
 * @returns CSRF token or undefined
 */
export function getCsrfToken(request: NextRequest): string | undefined {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value;
}

// ============================================================================
// MIDDLEWARE HELPER
// ============================================================================

/**
 * Check if request needs CSRF protection
 *
 * API routes with protected methods need CSRF tokens.
 *
 * @param request - Next.js request
 * @returns True if CSRF protection needed
 */
export function needsCsrfProtection(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;

  // Only protect API routes
  if (!pathname.startsWith('/api')) {
    return false;
  }

  // Only protect mutating methods
  if (!PROTECTED_METHODS.includes(request.method as typeof PROTECTED_METHODS[number])) {
    return false;
  }

  return true;
}

/**
 * Create CSRF error response
 *
 * @returns JSON error response
 */
export function createCsrfErrorResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'CSRF validation failed',
      message: 'Invalid or missing CSRF token',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create origin error response
 *
 * @returns JSON error response
 */
export function createOriginErrorResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Invalid origin',
      message: 'Request origin is not allowed',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// ============================================================================
// TEST COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Generate CSRF token (test-compatible export)
 * Alias for generateCsrfToken with uppercase naming
 */
export const generateCSRFToken = generateCsrfToken;

/**
 * Validate CSRF token (test-compatible export)
 * Simplified validation that compares two token strings directly
 */
export function validateCSRFToken(cookieToken: string, headerToken: string): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }

  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  return timingSafeEqual(cookieToken, headerToken);
}

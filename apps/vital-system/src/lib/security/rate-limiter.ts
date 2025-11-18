/**
 * Rate Limiting Service
 *
 * Token bucket rate limiting using Upstash Redis.
 * Provides DDoS protection and API abuse prevention.
 *
 * Features:
 * - Token bucket algorithm
 * - Multiple rate limit tiers
 * - IP-based and user-based limiting
 * - Sliding window counters
 * - Redis-backed for distributed systems
 *
 * @module lib/security/rate-limiter
 */

import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Initialize Redis only if credentials are available
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('✅ Upstash Redis initialized for rate limiting');
  } else {
    console.warn('⚠️  Upstash Redis not configured - Rate limiting is disabled');
    console.warn('   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable');
  }
} catch (error) {
  console.error('❌ Failed to initialize Upstash Redis:', error);
  redis = null;
}

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  // Anonymous users (IP-based)
  anonymous: {
    requests: parseInt(process.env.RATE_LIMIT_ANONYMOUS_REQUESTS ?? '10', 10),
    window: parseInt(process.env.RATE_LIMIT_ANONYMOUS_WINDOW ?? '60', 10), // seconds
  },
  // Authenticated users (user-based)
  authenticated: {
    requests: parseInt(process.env.RATE_LIMIT_AUTHENTICATED_REQUESTS ?? '60', 10),
    window: parseInt(process.env.RATE_LIMIT_AUTHENTICATED_WINDOW ?? '60', 10),
  },
  // API endpoints (stricter limits)
  api: {
    requests: parseInt(process.env.RATE_LIMIT_API_REQUESTS ?? '30', 10),
    window: parseInt(process.env.RATE_LIMIT_API_WINDOW ?? '60', 10),
  },
  // Expensive operations (orchestration)
  orchestration: {
    requests: parseInt(process.env.RATE_LIMIT_ORCHESTRATION_REQUESTS ?? '5', 10),
    window: parseInt(process.env.RATE_LIMIT_ORCHESTRATION_WINDOW ?? '60', 10),
  },
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface RateLimitResult {
  readonly success: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly reset: number; // Unix timestamp
  readonly retryAfter?: number; // Seconds until reset
}

export type RateLimitTier = keyof typeof RATE_LIMITS;

// ============================================================================
// RATE LIMITER
// ============================================================================

/**
 * Check rate limit for a given identifier
 *
 * Uses sliding window counter algorithm:
 * 1. Get current timestamp
 * 2. Calculate window start
 * 3. Count requests in window
 * 4. Allow/deny based on limit
 *
 * @param identifier - Unique identifier (IP address or user ID)
 * @param tier - Rate limit tier to apply
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'anonymous'
): Promise<RateLimitResult> {
  // If Redis is not configured, allow all requests (fail open)
  if (!redis) {
    const config = RATE_LIMITS[tier];
    const now = Date.now();
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: now + config.window * 1000,
    };
  }

  const config = RATE_LIMITS[tier];
  const now = Date.now();
  const windowStart = now - config.window * 1000;

  // Redis key for this identifier and tier
  const key = `ratelimit:${tier}:${identifier}`;

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Remove old requests outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    pipeline.zcard(key);

    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}` });

    // Set expiry (cleanup old keys)
    pipeline.expire(key, config.window);

    const results = await pipeline.exec();

    // Extract count (results[1] is zcard result)
    const count = (results[1] as number) || 0;

    const remaining = Math.max(0, config.requests - count - 1);
    const reset = now + config.window * 1000;

    if (count >= config.requests) {
      return {
        success: false,
        limit: config.requests,
        remaining: 0,
        reset,
        retryAfter: config.window,
      };
    }

    return {
      success: true,
      limit: config.requests,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);

    // Fail open (allow request) to prevent Redis outages from blocking all traffic
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: now + config.window * 1000,
    };
  }
}

/**
 * Get identifier from request
 *
 * Prefers user ID if authenticated, falls back to IP address.
 *
 * @param request - Next.js request
 * @param userId - Optional user ID from authentication
 * @returns Identifier for rate limiting
 */
export function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP address from various headers (prioritize CF-Connecting-IP for Cloudflare)
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Get appropriate rate limit tier for request
 *
 * @param request - Next.js request
 * @param isAuthenticated - Whether user is authenticated
 * @returns Rate limit tier
 */
export function getRateLimitTier(
  request: NextRequest,
  isAuthenticated: boolean
): RateLimitTier {
  const pathname = request.nextUrl.pathname;

  // Orchestration endpoints (most expensive)
  if (
    pathname.startsWith('/api/orchestrate') ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/ask-expert/orchestrate')
  ) {
    return 'orchestration';
  }

  // API endpoints
  if (pathname.startsWith('/api')) {
    return 'api';
  }

  // Authenticated users get higher limits
  if (isAuthenticated) {
    return 'authenticated';
  }

  // Default to anonymous
  return 'anonymous';
}

/**
 * Create rate limit headers for response
 *
 * Standard HTTP headers for rate limiting:
 * - X-RateLimit-Limit: Maximum requests per window
 * - X-RateLimit-Remaining: Remaining requests in current window
 * - X-RateLimit-Reset: Unix timestamp when window resets
 * - Retry-After: Seconds until reset (only when rate limited)
 *
 * @param result - Rate limit result
 * @returns Headers object
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.reset / 1000).toString(),
  };

  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Reset rate limit for identifier (admin function)
 *
 * @param identifier - Identifier to reset
 * @param tier - Rate limit tier
 */
export async function resetRateLimit(
  identifier: string,
  tier: RateLimitTier = 'anonymous'
): Promise<void> {
  const key = `ratelimit:${tier}:${identifier}`;
  await redis.del(key);
}

/**
 * Get rate limit status (for monitoring)
 *
 * @param identifier - Identifier to check
 * @param tier - Rate limit tier
 * @returns Current usage count
 */
export async function getRateLimitStatus(
  identifier: string,
  tier: RateLimitTier = 'anonymous'
): Promise<number> {
  const key = `ratelimit:${tier}:${identifier}`;
  const count = await redis.zcard(key);
  return count || 0;
}

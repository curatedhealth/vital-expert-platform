/**
 * Rate Limiting Middleware
 * Protects against DOS attacks and excessive LLM usage costs
 * Uses sliding window algorithm with Redis (Upstash) or in-memory fallback
 */

import { NextRequest, NextResponse } from 'next/server';
import { APIErrors } from './error-handler.middleware';

interface RateLimitConfig {
  requests: number; // Max requests
  window: number; // Time window in seconds
  identifier?: (req: NextRequest) => string; // Custom identifier function
}

interface RateLimitStore {
  get: (key: string) => Promise<number | null>;
  set: (key: string, value: number, ttl: number) => Promise<void>;
  increment: (key: string) => Promise<number>;
}

/**
 * In-memory rate limit store (fallback for development)
 */
class InMemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, { count: number; expiresAt: number }> = new Map();

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.count;
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    this.store.set(key, {
      count: value,
      expiresAt: Date.now() + ttl * 1000
    });

    // Cleanup expired entries periodically
    if (this.store.size > 10000) {
      this.cleanup();
    }
  }

  async increment(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (current || 0) + 1;
    // Default TTL of 60 seconds for increment
    await this.set(key, newValue, 60);
    return newValue;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Upstash Redis rate limit store (production)
 */
class UpstashRateLimitStore implements RateLimitStore {
  private redisUrl: string;
  private redisToken: string;

  constructor() {
    this.redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
    this.redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

    if (!this.redisUrl || !this.redisToken) {
      console.warn(
        'UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured. ' +
        'Falling back to in-memory rate limiting.'
      );
    }
  }

  async get(key: string): Promise<number | null> {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${this.redisUrl}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${this.redisToken}`
        }
      });

      const data = await response.json();
      return data.result ? parseInt(data.result) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    if (!this.isConfigured()) return;

    try {
      await fetch(`${this.redisUrl}/setex/${key}/${ttl}/${value}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.redisToken}`
        }
      });
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async increment(key: string): Promise<number> {
    if (!this.isConfigured()) return 1;

    try {
      const response = await fetch(`${this.redisUrl}/incr/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.redisToken}`
        }
      });

      const data = await response.json();
      return data.result || 1;
    } catch (error) {
      console.error('Redis INCR error:', error);
      return 1;
    }
  }

  private isConfigured(): boolean {
    return !!(this.redisUrl && this.redisToken);
  }
}

/**
 * Get rate limit store (Redis or in-memory fallback)
 */
function getRateLimitStore(): RateLimitStore {
  const upstashStore = new UpstashRateLimitStore();

  // Check if Upstash is configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return upstashStore;
  }

  // Fallback to in-memory store
  return new InMemoryRateLimitStore();
}

const store = getRateLimitStore();

/**
 * Tier-based rate limit configurations
 */
export const RateLimitTiers = {
  FREE: { requests: 100, window: 3600 }, // 100 requests per hour
  TIER_1: { requests: 100, window: 3600 },
  TIER_2: { requests: 500, window: 3600 },
  TIER_3: { requests: 2000, window: 3600 },
  ADMIN: { requests: 10000, window: 3600 }
};

/**
 * Endpoint-specific rate limits
 */
export const EndpointRateLimits = {
  '/api/chat': { requests: 60, window: 60 }, // 1 per second
  '/api/panel/orchestrate': { requests: 30, window: 60 }, // 30 per minute
  '/api/agents-crud': { requests: 100, window: 60 }, // 100 per minute
  '/api/knowledge/upload': { requests: 10, window: 60 }, // 10 per minute
};

/**
 * Default identifier: Use user ID or IP address
 */
function defaultIdentifier(request: NextRequest): string {
  // Try to get user ID from headers (set by auth middleware)
  const userId = request.headers.get('X-User-Id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  return `ip:${ip}`;
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ allowed: boolean; limit: number; remaining: number; reset: number }> {
  const identifier = config.identifier ? config.identifier(request) : defaultIdentifier(request);
  const endpoint = new URL(request.url).pathname;
  const key = `ratelimit:${endpoint}:${identifier}`;

  // Get current count
  const current = await store.get(key);

  if (current === null) {
    // First request in window
    await store.set(key, 1, config.window);
    return {
      allowed: true,
      limit: config.requests,
      remaining: config.requests - 1,
      reset: Date.now() + config.window * 1000
    };
  }

  if (current >= config.requests) {
    // Rate limit exceeded
    return {
      allowed: false,
      limit: config.requests,
      remaining: 0,
      reset: Date.now() + config.window * 1000
    };
  }

  // Increment count
  const newCount = await store.increment(key);

  return {
    allowed: true,
    limit: config.requests,
    remaining: Math.max(0, config.requests - newCount),
    reset: Date.now() + config.window * 1000
  };
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: Partial<RateLimitConfig>
) {
  return async (request: NextRequest) => {
    const endpoint = new URL(request.url).pathname;

    // Get rate limit config (endpoint-specific or default)
    const endpointConfig = EndpointRateLimits[endpoint as keyof typeof EndpointRateLimits];
    const rateLimitConfig: RateLimitConfig = {
      requests: config?.requests || endpointConfig?.requests || RateLimitTiers.FREE.requests,
      window: config?.window || endpointConfig?.window || RateLimitTiers.FREE.window,
      identifier: config?.identifier
    };

    // Check rate limit
    const result = await checkRateLimit(request, rateLimitConfig);

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString()
    };

    if (!result.allowed) {
      // Rate limit exceeded
      console.warn('Rate limit exceeded:', {
        endpoint,
        identifier: rateLimitConfig.identifier ?
          rateLimitConfig.identifier(request) :
          defaultIdentifier(request)
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            details: {
              limit: result.limit,
              window: rateLimitConfig.window,
              reset: new Date(result.reset).toISOString()
            }
          },
          timestamp: new Date().toISOString()
        },
        { status: 429, headers }
      );
    }

    // Call handler and add rate limit headers
    const response = await handler(request);

    // Add rate limit headers to successful response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Get user's rate limit tier from database
 * TODO: Implement tier lookup from user profile
 */
export async function getUserRateLimitTier(userId: string): Promise<RateLimitConfig> {
  // For now, return default tier
  // In production, fetch from database based on user subscription
  return RateLimitTiers.TIER_1;
}

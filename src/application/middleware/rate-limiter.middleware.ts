/**
 * Rate Limiter Middleware - Comprehensive rate limiting for API endpoints
 * 
 * This middleware provides multiple rate limiting strategies including
 * token bucket, sliding window, and fixed window algorithms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/infrastructure/monitoring/logger';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  handler?: (req: NextRequest, res: NextResponse) => NextResponse;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

export interface RateLimitWindow {
  count: number;
  resetAt: number;
  lastRequest: number;
}

export type RateLimitAlgorithm = 'token-bucket' | 'sliding-window' | 'fixed-window';

export class RateLimiter {
  private windows = new Map<string, RateLimitWindow>();
  private config: RateLimitConfig;
  private algorithm: RateLimitAlgorithm;
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    config: RateLimitConfig,
    algorithm: RateLimitAlgorithm = 'sliding-window'
  ) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      ...config
    };
    this.algorithm = algorithm;
    
    // Cleanup old windows every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Main middleware function
   */
  async middleware(req: NextRequest): Promise<NextResponse | null> {
    try {
      const key = this.config.keyGenerator(req);
      const now = Date.now();
      
      // Get or create window for this key
      let window = this.windows.get(key);
      
      if (!window) {
        window = {
          count: 0,
          resetAt: now + this.config.windowMs,
          lastRequest: now
        };
        this.windows.set(key, window);
      }

      // Check if window needs to be reset
      if (now >= window.resetAt) {
        window = this.resetWindow(window, now);
        this.windows.set(key, window);
      }

      // Apply rate limiting based on algorithm
      const isAllowed = this.checkRateLimit(window, now);
      
      if (!isAllowed) {
        return this.createRateLimitResponse(req, window, now);
      }

      // Increment counter
      window.count++;
      window.lastRequest = now;
      this.windows.set(key, window);

      // Log rate limit check
      logger.info('Rate limit check passed', {
        key: this.hashKey(key),
        count: window.count,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - window.count,
        algorithm: this.algorithm
      });

      return null; // Continue to next middleware

    } catch (error) {
      logger.error('Rate limiter error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return null; // Allow request on error
    }
  }

  /**
   * Check rate limit based on algorithm
   */
  private checkRateLimit(window: RateLimitWindow, now: number): boolean {
    switch (this.algorithm) {
      case 'token-bucket':
        return this.checkTokenBucket(window, now);
      case 'sliding-window':
        return this.checkSlidingWindow(window, now);
      case 'fixed-window':
        return this.checkFixedWindow(window, now);
      default:
        return this.checkSlidingWindow(window, now);
    }
  }

  /**
   * Token bucket algorithm
   */
  private checkTokenBucket(window: RateLimitWindow, now: number): boolean {
    const timePassed = now - window.lastRequest;
    const tokensToAdd = (timePassed / this.config.windowMs) * this.config.maxRequests;
    const newTokens = Math.min(window.count + tokensToAdd, this.config.maxRequests);
    
    if (newTokens >= 1) {
      window.count = newTokens - 1;
      return true;
    }
    
    return false;
  }

  /**
   * Sliding window algorithm
   */
  private checkSlidingWindow(window: RateLimitWindow, now: number): boolean {
    // For simplicity, we'll use a basic sliding window
    // In production, you might want to use Redis or a more sophisticated implementation
    return window.count < this.config.maxRequests;
  }

  /**
   * Fixed window algorithm
   */
  private checkFixedWindow(window: RateLimitWindow, now: number): boolean {
    return window.count < this.config.maxRequests;
  }

  /**
   * Reset window for new period
   */
  private resetWindow(window: RateLimitWindow, now: number): RateLimitWindow {
    return {
      count: 0,
      resetAt: now + this.config.windowMs,
      lastRequest: now
    };
  }

  /**
   * Create rate limit response
   */
  private createRateLimitResponse(
    req: NextRequest,
    window: RateLimitWindow,
    now: number
  ): NextResponse {
    const retryAfter = Math.ceil((window.resetAt - now) / 1000);
    
    // Log rate limit exceeded
    logger.warn('Rate limit exceeded', {
      key: this.hashKey(this.config.keyGenerator(req)),
      count: window.count,
      limit: this.config.maxRequests,
      retryAfter,
      algorithm: this.algorithm
    });

    // Use custom handler if provided
    if (this.config.handler) {
      const response = NextResponse.json(
        { error: this.config.message, retryAfter },
        { status: 429 }
      );
      return this.config.handler(req, response);
    }

    // Create standard response
    const response = NextResponse.json(
      {
        error: this.config.message,
        retryAfter,
        limit: this.config.maxRequests,
        remaining: 0,
        reset: new Date(window.resetAt).toISOString()
      },
      { status: 429 }
    );

    // Add standard headers
    if (this.config.standardHeaders) {
      response.headers.set('X-RateLimit-Limit', String(this.config.maxRequests));
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', new Date(window.resetAt).toISOString());
      response.headers.set('Retry-After', String(retryAfter));
    }

    // Add legacy headers
    if (this.config.legacyHeaders) {
      response.headers.set('X-Rate-Limit-Limit', String(this.config.maxRequests));
      response.headers.set('X-Rate-Limit-Remaining', '0');
      response.headers.set('X-Rate-Limit-Reset', String(Math.ceil(window.resetAt / 1000)));
    }

    return response;
  }

  /**
   * Get rate limit info for a key
   */
  getRateLimitInfo(key: string): RateLimitInfo | null {
    const window = this.windows.get(key);
    if (!window) return null;

    const now = Date.now();
    const remaining = Math.max(0, this.config.maxRequests - window.count);
    const reset = new Date(window.resetAt);
    const retryAfter = window.resetAt > now ? Math.ceil((window.resetAt - now) / 1000) : 0;

    return {
      limit: this.config.maxRequests,
      remaining,
      reset,
      retryAfter: retryAfter > 0 ? retryAfter : undefined
    };
  }

  /**
   * Reset rate limit for a key
   */
  resetRateLimit(key: string): void {
    this.windows.delete(key);
    logger.info('Rate limit reset', { key: this.hashKey(key) });
  }

  /**
   * Cleanup old windows
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, window] of this.windows.entries()) {
      if (window.resetAt < now) {
        this.windows.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug('Rate limiter cleanup', { cleaned, remaining: this.windows.size });
    }
  }

  /**
   * Hash key for logging (privacy)
   */
  private hashKey(key: string): string {
    return Buffer.from(key).toString('base64').substring(0, 8);
  }

  /**
   * Destroy the rate limiter
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.windows.clear();
  }
}

// Pre-configured rate limiters
export const chatLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 10,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id');
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    return `chat:${userId || ip}`;
  },
  message: 'Too many chat requests, please slow down.'
});

export const agentSelectionLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 20,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id');
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    return `agent:${userId || ip}`;
  },
  message: 'Too many agent selection requests, please slow down.'
});

export const workflowLimiter = new RateLimiter({
  windowMs: 300000, // 5 minutes
  maxRequests: 5,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id');
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    return `workflow:${userId || ip}`;
  },
  message: 'Too many workflow requests, please wait before starting a new workflow.'
});

export const authLimiter = new RateLimiter({
  windowMs: 900000, // 15 minutes
  maxRequests: 5,
  keyGenerator: (req) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    return `auth:${ip}`;
  },
  message: 'Too many authentication attempts, please try again later.'
});

export const apiLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id');
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    return `api:${userId || ip}`;
  },
  message: 'Too many API requests, please slow down.'
});

// Utility functions
export function createRateLimiter(config: RateLimitConfig, algorithm?: RateLimitAlgorithm): RateLimiter {
  return new RateLimiter(config, algorithm);
}

export function getRateLimitInfo(limiter: RateLimiter, key: string): RateLimitInfo | null {
  return limiter.getRateLimitInfo(key);
}

export function resetRateLimit(limiter: RateLimiter, key: string): void {
  limiter.resetRateLimit(key);
}

// Middleware wrapper for Next.js API routes
export function withRateLimit(
  limiter: RateLimiter,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await limiter.middleware(req);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(req);
  };
}

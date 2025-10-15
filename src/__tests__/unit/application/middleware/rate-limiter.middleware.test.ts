import { describe, it, expect, beforeEach, jest, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, chatLimiter, expensiveLimiter } from '@/application/middleware/rate-limiter.middleware';

// Mock NextRequest
const createMockRequest = (headers: Record<string, string> = {}): NextRequest => {
  const mockHeaders = new Map(Object.entries(headers));
  return {
    headers: {
      get: (name: string) => mockHeaders.get(name) || null,
      has: (name: string) => mockHeaders.has(name),
      set: (name: string, value: string) => mockHeaders.set(name, value),
      delete: (name: string) => mockHeaders.delete(name),
      forEach: (callback: (value: string, key: string) => void) => {
        mockHeaders.forEach(callback);
      },
      entries: () => mockHeaders.entries(),
      keys: () => mockHeaders.keys(),
      values: () => mockHeaders.values(),
      [Symbol.iterator]: () => mockHeaders[Symbol.iterator]()
    },
    ip: '127.0.0.1'
  } as any;
};

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let mockConfig: any;

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();

    mockConfig = {
      windowMs: 60000, // 1 minute
      maxRequests: 5,
      keyGenerator: (req: NextRequest) => req.headers.get('x-user-id') || req.ip || 'anonymous'
    };

    rateLimiter = new RateLimiter(mockConfig);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('middleware', () => {
    it('should allow requests within limit', async () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        const response = await rateLimiter.middleware(req);
        expect(response).toBeNull(); // No rate limiting applied
      }
    });

    it('should block requests exceeding limit', async () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        await rateLimiter.middleware(req);
      }

      // 6th request should be rate limited
      const response = await rateLimiter.middleware(req);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(429);
    });

    it('should reset window after time expires', async () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Exceed limit
      for (let i = 0; i < 6; i++) {
        await rateLimiter.middleware(req);
      }

      // Fast forward time by 1 minute
      vi.advanceTimersByTime(60000);

      // Should allow requests again
      const response = await rateLimiter.middleware(req);
      expect(response).toBeNull();
    });

    it('should handle different users independently', async () => {
      const req1 = createMockRequest({ 'x-user-id': 'user1' });
      const req2 = createMockRequest({ 'x-user-id': 'user2' });

      // User 1 exceeds limit
      for (let i = 0; i < 6; i++) {
        await rateLimiter.middleware(req1);
      }

      // User 2 should still be able to make requests
      const response = await rateLimiter.middleware(req2);
      expect(response).toBeNull();
    });

    it('should use IP when no user ID provided', async () => {
      const req1 = createMockRequest(); // No user ID, will use IP
      const req2 = createMockRequest({ 'x-user-id': 'user1' });

      // Exceed limit for IP-based user
      for (let i = 0; i < 6; i++) {
        await rateLimiter.middleware(req1);
      }

      // User with ID should still work
      const response = await rateLimiter.middleware(req2);
      expect(response).toBeNull();
    });

    it('should include rate limit headers in response', async () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Exceed limit
      for (let i = 0; i < 6; i++) {
        await rateLimiter.middleware(req);
      }

      const response = await rateLimiter.middleware(req);
      expect(response?.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(response?.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response?.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should include retry-after header', async () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Exceed limit
      for (let i = 0; i < 6; i++) {
        await rateLimiter.middleware(req);
      }

      const response = await rateLimiter.middleware(req);
      const retryAfter = response?.headers.get('Retry-After');
      expect(retryAfter).toBeDefined();
      expect(parseInt(retryAfter || '0')).toBeGreaterThan(0);
    });

    it('should return proper error response body', async () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Exceed limit
      for (let i = 0; i < 6; i++) {
        await rateLimiter.middleware(req);
      }

      const response = await rateLimiter.middleware(req);
      const body = await response?.json();
      
      expect(body.error).toBe('Rate limit exceeded');
      expect(body.retryAfter).toBeDefined();
      expect(typeof body.retryAfter).toBe('number');
    });
  });

  describe('cleanup', () => {
    it('should clean up expired windows', async () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Create some windows
      await rateLimiter.middleware(req);
      
      // Fast forward time to trigger cleanup
      vi.advanceTimersByTime(60000);

      // Cleanup should have removed expired windows
      // This is tested indirectly by ensuring the rate limiter still works
      const response = await rateLimiter.middleware(req);
      expect(response).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle zero max requests', async () => {
      const zeroLimitConfig = {
        ...mockConfig,
        maxRequests: 0
      };
      const zeroLimiter = new RateLimiter(zeroLimitConfig);
      const req = createMockRequest({ 'x-user-id': 'user1' });

      const response = await zeroLimiter.middleware(req);
      expect(response?.status).toBe(429);
    });

    it('should handle very large windowMs', async () => {
      const largeWindowConfig = {
        ...mockConfig,
        windowMs: 86400000 // 24 hours
      };
      const largeWindowLimiter = new RateLimiter(largeWindowConfig);
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Should work normally
      const response = await largeWindowLimiter.middleware(req);
      expect(response).toBeNull();
    });

    it('should handle concurrent requests', async () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Make concurrent requests
      const promises = Array(10).fill(null).map(() => rateLimiter.middleware(req));
      const responses = await Promise.all(promises);

      // Only 5 should be allowed, 5 should be rate limited
      const allowed = responses.filter(r => r === null).length;
      const rateLimited = responses.filter(r => r !== null).length;

      expect(allowed).toBe(5);
      expect(rateLimited).toBe(5);
    });
  });
});

describe('Pre-configured Limiters', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('chatLimiter', () => {
    it('should have correct configuration', () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Should allow 10 requests per minute
      for (let i = 0; i < 10; i++) {
        const response = chatLimiter.middleware(req);
        expect(response).toBeNull();
      }

      // 11th request should be rate limited
      const response = chatLimiter.middleware(req);
      expect(response?.status).toBe(429);
    });

    it('should use user ID for key generation', async () => {
      const reqWithUser = createMockRequest({ 'x-user-id': 'user1' });
      const reqWithoutUser = createMockRequest();

      // These should be treated as different users
      await chatLimiter.middleware(reqWithUser);
      const response = await chatLimiter.middleware(reqWithoutUser);
      expect(response).toBeNull();
    });
  });

  describe('expensiveLimiter', () => {
    it('should have correct configuration', () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Should allow 100 requests per hour
      for (let i = 0; i < 100; i++) {
        const response = expensiveLimiter.middleware(req);
        expect(response).toBeNull();
      }

      // 101st request should be rate limited
      const response = expensiveLimiter.middleware(req);
      expect(response?.status).toBe(429);
    });

    it('should use expensive prefix for key generation', async () => {
      const req = createMockRequest({ 'x-user-id': 'user1' });

      // Should work independently from chatLimiter
      await chatLimiter.middleware(req);
      const response = await expensiveLimiter.middleware(req);
      expect(response).toBeNull();
    });
  });
});

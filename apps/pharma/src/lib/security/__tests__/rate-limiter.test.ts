/**
 * RateLimiter Unit Tests
 *
 * Tests for token bucket rate limiting with Redis
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock Redis
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  quit: jest.fn(),
  flushdb: jest.fn()
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

// Import after mocking
import { RateLimiter, RateLimitConfig } from '../rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore - Using mocked Redis
    rateLimiter = new RateLimiter(mockRedis);
  });

  describe('checkLimit', () => {
    it('allows requests within limit', async () => {
      mockRedis.get.mockResolvedValue(null); // No existing tokens
      mockRedis.incr.mockResolvedValue(1);

      const config: RateLimitConfig = {
        points: 10,
        duration: 60
      };

      const result = await rateLimiter.checkLimit('test-key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it('blocks requests exceeding limit', async () => {
      mockRedis.get.mockResolvedValue('10'); // Limit reached
      mockRedis.incr.mockResolvedValue(11);
      mockRedis.ttl.mockResolvedValue(30);

      const config: RateLimitConfig = {
        points: 10,
        duration: 60
      };

      const result = await rateLimiter.checkLimit('test-key', config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBe(30);
    });

    it('sets expiration on first request', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);

      const config: RateLimitConfig = {
        points: 10,
        duration: 60
      };

      await rateLimiter.checkLimit('test-key', config);

      expect(mockRedis.expire).toHaveBeenCalledWith('test-key', 60);
    });

    it('calculates remaining tokens correctly', async () => {
      mockRedis.get.mockResolvedValue('3');
      mockRedis.incr.mockResolvedValue(4);

      const config: RateLimitConfig = {
        points: 10,
        duration: 60
      };

      const result = await rateLimiter.checkLimit('test-key', config);

      expect(result.remaining).toBe(6); // 10 - 4 = 6
    });

    it('returns retry-after when blocked', async () => {
      mockRedis.get.mockResolvedValue('10');
      mockRedis.incr.mockResolvedValue(11);
      mockRedis.ttl.mockResolvedValue(45);

      const config: RateLimitConfig = {
        points: 10,
        duration: 60
      };

      const result = await rateLimiter.checkLimit('test-key', config);

      expect(result.retryAfter).toBe(45);
    });
  });

  describe('different tiers', () => {
    it('applies anonymous tier limits', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);

      const config: RateLimitConfig = {
        points: 10, // Anonymous: 10 req/min
        duration: 60
      };

      const result = await rateLimiter.checkLimit('anon:192.168.1.1', config);

      expect(result.allowed).toBe(true);
    });

    it('applies authenticated tier limits', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);

      const config: RateLimitConfig = {
        points: 60, // Authenticated: 60 req/min
        duration: 60
      };

      const result = await rateLimiter.checkLimit('user:123', config);

      expect(result.allowed).toBe(true);
    });

    it('applies API tier limits', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);

      const config: RateLimitConfig = {
        points: 30, // API: 30 req/min
        duration: 60
      };

      const result = await rateLimiter.checkLimit('api:endpoint', config);

      expect(result.allowed).toBe(true);
    });

    it('applies orchestration tier limits', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);

      const config: RateLimitConfig = {
        points: 5, // Orchestration: 5 req/min
        duration: 60
      };

      const result = await rateLimiter.checkLimit('orchestration:user:123', config);

      expect(result.allowed).toBe(true);
    });
  });

  describe('reset behavior', () => {
    it('resets count after duration expires', async () => {
      // First request
      mockRedis.get.mockResolvedValueOnce('10');
      mockRedis.incr.mockResolvedValueOnce(11);
      mockRedis.ttl.mockResolvedValueOnce(1);

      const config: RateLimitConfig = {
        points: 10,
        duration: 1
      };

      // Should be blocked
      let result = await rateLimiter.checkLimit('test-key', config);
      expect(result.allowed).toBe(false);

      // After expiration
      mockRedis.get.mockResolvedValueOnce(null);
      mockRedis.incr.mockResolvedValueOnce(1);

      // Should be allowed
      result = await rateLimiter.checkLimit('test-key', config);
      expect(result.allowed).toBe(true);
    });
  });

  describe('error handling', () => {
    it('handles Redis connection errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const config: RateLimitConfig = {
        points: 10,
        duration: 60
      };

      await expect(
        rateLimiter.checkLimit('test-key', config)
      ).rejects.toThrow('Redis connection failed');
    });

    it('handles invalid config', async () => {
      const invalidConfig = {
        points: -1,
        duration: 0
      } as RateLimitConfig;

      await expect(
        rateLimiter.checkLimit('test-key', invalidConfig)
      ).rejects.toThrow();
    });
  });

  describe('concurrent requests', () => {
    it('handles concurrent requests correctly', async () => {
      let count = 0;
      mockRedis.get.mockImplementation(async () => {
        return count.toString();
      });
      mockRedis.incr.mockImplementation(async () => {
        count++;
        return count;
      });

      const config: RateLimitConfig = {
        points: 10,
        duration: 60
      };

      // Simulate 5 concurrent requests
      const promises = Array.from({ length: 5 }, () =>
        rateLimiter.checkLimit('test-key', config)
      );

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach(result => {
        expect(result.allowed).toBe(true);
      });

      expect(count).toBe(5);
    });
  });

  describe('key namespacing', () => {
    it('uses different keys for different users', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);

      const config: RateLimitConfig = {
        points: 10,
        duration: 60
      };

      await rateLimiter.checkLimit('user:123', config);
      await rateLimiter.checkLimit('user:456', config);

      expect(mockRedis.incr).toHaveBeenCalledWith('user:123');
      expect(mockRedis.incr).toHaveBeenCalledWith('user:456');
    });
  });

  describe('performance', () => {
    it('completes check in reasonable time', async () => {
      mockRedis.get.mockResolvedValue('5');
      mockRedis.incr.mockResolvedValue(6);

      const config: RateLimitConfig = {
        points: 10,
        duration: 60
      };

      const startTime = Date.now();
      await rateLimiter.checkLimit('test-key', config);
      const duration = Date.now() - startTime;

      // Should complete in < 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});

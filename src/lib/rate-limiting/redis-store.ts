import Redis from 'ioredis';

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RedisRateLimitStore {
  private redis: Redis;
  private prefix: string;

  constructor(redisUrl?: string, prefix: string = 'rate_limit') {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    this.prefix = prefix;
  }

  /**
   * Check if a request is allowed based on rate limits
   */
  async checkRateLimit(
    entityType: 'user' | 'organization' | 'global',
    entityId: string,
    endpointPattern?: string,
    windowType: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<RateLimitResult> {
    const key = this.buildKey(entityType, entityId, endpointPattern, windowType);
    const now = Date.now();
    
    // Get current count
    const currentCount = await this.redis.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;
    
    // Get rate limit configuration
    const config = await this.getRateLimitConfig(entityType, entityId, endpointPattern);
    const limit = this.getLimitForWindow(config, windowType);
    
    if (count >= limit) {
      const ttl = await this.redis.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + (ttl * 1000),
        retryAfter: ttl
      };
    }
    
    // Increment counter
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, this.getWindowTTL(windowType));
    await pipeline.exec();
    
    return {
      allowed: true,
      remaining: limit - count - 1,
      resetTime: now + (this.getWindowTTL(windowType) * 1000)
    };
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getRateLimitStatus(
    entityType: 'user' | 'organization' | 'global',
    entityId: string,
    endpointPattern?: string,
    windowType: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<RateLimitResult> {
    const key = this.buildKey(entityType, entityId, endpointPattern, windowType);
    const now = Date.now();
    
    const currentCount = await this.redis.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;
    
    const config = await this.getRateLimitConfig(entityType, entityId, endpointPattern);
    const limit = this.getLimitForWindow(config, windowType);
    
    const ttl = await this.redis.ttl(key);
    
    return {
      allowed: count < limit,
      remaining: Math.max(0, limit - count),
      resetTime: now + (ttl * 1000),
      retryAfter: count >= limit ? ttl : undefined
    };
  }

  /**
   * Reset rate limit for an entity
   */
  async resetRateLimit(
    entityType: 'user' | 'organization' | 'global',
    entityId: string,
    endpointPattern?: string
  ): Promise<void> {
    const patterns = [
      `${this.prefix}:${entityType}:${entityId}:${endpointPattern || '*'}:*`,
      `${this.prefix}:${entityType}:${entityId}:*`
    ];
    
    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStats(
    entityType: 'user' | 'organization' | 'global',
    entityId: string,
    endpointPattern?: string
  ): Promise<{
    minute: RateLimitResult;
    hour: RateLimitResult;
    day: RateLimitResult;
  }> {
    const [minute, hour, day] = await Promise.all([
      this.getRateLimitStatus(entityType, entityId, endpointPattern, 'minute'),
      this.getRateLimitStatus(entityType, entityId, endpointPattern, 'hour'),
      this.getRateLimitStatus(entityType, entityId, endpointPattern, 'day')
    ]);

    return { minute, hour, day };
  }

  /**
   * Clean up expired keys
   */
  async cleanup(): Promise<number> {
    const pattern = `${this.prefix}:*`;
    const keys = await this.redis.keys(pattern);
    let deletedCount = 0;
    
    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) {
        // Key exists but has no expiration, set a default TTL
        await this.redis.expire(key, 86400); // 24 hours
      } else if (ttl === -2) {
        // Key doesn't exist, skip
        continue;
      } else if (ttl < 0) {
        // Key is expired, delete it
        await this.redis.del(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  private buildKey(
    entityType: string,
    entityId: string,
    endpointPattern?: string,
    windowType?: string
  ): string {
    const parts = [this.prefix, entityType, entityId];
    
    if (endpointPattern) {
      parts.push(endpointPattern.replace(/[^a-zA-Z0-9_-]/g, '_'));
    }
    
    if (windowType) {
      parts.push(windowType);
    }
    
    return parts.join(':');
  }

  private async getRateLimitConfig(
    entityType: 'user' | 'organization' | 'global',
    entityId: string,
    endpointPattern?: string
  ): Promise<RateLimitConfig> {
    // Try to get from cache first
    const cacheKey = `config:${entityType}:${entityId}:${endpointPattern || 'default'}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Default configuration
    const defaultConfig: RateLimitConfig = {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstLimit: 200
    };
    
    // Cache the config for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(defaultConfig));
    
    return defaultConfig;
  }

  private getLimitForWindow(config: RateLimitConfig, windowType: 'minute' | 'hour' | 'day'): number {
    switch (windowType) {
      case 'minute':
        return config.requestsPerMinute;
      case 'hour':
        return config.requestsPerHour;
      case 'day':
        return config.requestsPerDay;
      default:
        return config.requestsPerHour;
    }
  }

  private getWindowTTL(windowType: 'minute' | 'hour' | 'day'): number {
    switch (windowType) {
      case 'minute':
        return 60; // 1 minute
      case 'hour':
        return 3600; // 1 hour
      case 'day':
        return 86400; // 24 hours
      default:
        return 3600;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// Singleton instance
let redisStore: RedisRateLimitStore | null = null;

export function getRedisStore(): RedisRateLimitStore {
  if (!redisStore) {
    redisStore = new RedisRateLimitStore();
  }
  return redisStore;
}

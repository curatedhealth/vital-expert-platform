import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Whether to compress the data
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  hitRate: number;
}

export class RedisCache {
  private redis: Redis;
  private stats: CacheStats;
  private keyPrefix: string;

  constructor(redisUrl?: string, keyPrefix: string = 'vital') {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    this.keyPrefix = keyPrefix;
    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
      memory: 0,
      hitRate: 0
    };
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key);
      const value = await this.redis.get(fullKey);
      
      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();
      
      return JSON.parse(value);
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const serializedValue = JSON.stringify(value);
      
      const ttl = options.ttl || 3600; // Default 1 hour
      
      if (options.tags && options.tags.length > 0) {
        // Store tags for this key
        await this.redis.sadd(`${this.keyPrefix}:tags:${key}`, ...options.tags);
        
        // Set expiration for tags
        await this.redis.expire(`${this.keyPrefix}:tags:${key}`, ttl);
      }

      const result = await this.redis.setex(fullKey, ttl, serializedValue);
      
      if (result === 'OK') {
        this.stats.keys++;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Redis cache set error:', error);
      return false;
    }
  }

  /**
   * Get or set a value with fallback function
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await fallback();
    await this.set(key, value, options);
    
    return value;
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const result = await this.redis.del(fullKey);
      
      // Also delete associated tags
      await this.redis.del(`${this.keyPrefix}:tags:${key}`);
      
      if (result > 0) {
        this.stats.keys = Math.max(0, this.stats.keys - 1);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Redis cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<number> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key));
      const result = await this.redis.del(...fullKeys);
      
      // Also delete associated tags
      for (const key of keys) {
        await this.redis.del(`${this.keyPrefix}:tags:${key}`);
      }
      
      this.stats.keys = Math.max(0, this.stats.keys - result);
      return result;
    } catch (error) {
      console.error('Redis cache deleteMany error:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let totalDeleted = 0;
      
      for (const tag of tags) {
        const pattern = `${this.keyPrefix}:tags:*`;
        const tagKeys = await this.redis.keys(pattern);
        
        for (const tagKey of tagKeys) {
          const key = tagKey.replace(`${this.keyPrefix}:tags:`, '');
          const keyTags = await this.redis.smembers(tagKey);
          
          if (keyTags.includes(tag)) {
            await this.delete(key);
            totalDeleted++;
          }
        }
      }
      
      return totalDeleted;
    } catch (error) {
      console.error('Redis cache invalidateByTags error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      const pattern = `${this.keyPrefix}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      this.stats.keys = 0;
      return true;
    } catch (error) {
      console.error('Redis cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      this.stats.memory = memoryMatch ? parseInt(memoryMatch[1]) : 0;
      
      return { ...this.stats };
    } catch (error) {
      console.error('Redis cache getStats error:', error);
      return { ...this.stats };
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Redis cache exists error:', error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async getTTL(key: string): Promise<number> {
    try {
      const fullKey = this.buildKey(key);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      console.error('Redis cache getTTL error:', error);
      return -1;
    }
  }

  /**
   * Set TTL for a key
   */
  async setTTL(key: string, ttl: number): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key);
      const result = await this.redis.expire(fullKey, ttl);
      return result === 1;
    } catch (error) {
      console.error('Redis cache setTTL error:', error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async getKeys(pattern: string): Promise<string[]> {
    try {
      const fullPattern = this.buildKey(pattern);
      const keys = await this.redis.keys(fullPattern);
      return keys.map(key => key.replace(`${this.keyPrefix}:`, ''));
    } catch (error) {
      console.error('Redis cache getKeys error:', error);
      return [];
    }
  }

  /**
   * Increment a counter
   */
  async increment(key: string, by: number = 1): Promise<number> {
    try {
      const fullKey = this.buildKey(key);
      return await this.redis.incrby(fullKey, by);
    } catch (error) {
      console.error('Redis cache increment error:', error);
      return 0;
    }
  }

  /**
   * Decrement a counter
   */
  async decrement(key: string, by: number = 1): Promise<number> {
    try {
      const fullKey = this.buildKey(key);
      return await this.redis.decrby(fullKey, by);
    } catch (error) {
      console.error('Redis cache decrement error:', error);
      return 0;
    }
  }

  /**
   * Set a value with expiration
   */
  async setex<T>(key: string, value: T, ttl: number): Promise<boolean> {
    return this.set(key, value, { ttl });
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Build full key with prefix
   */
  private buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// Singleton instance
let redisCache: RedisCache | null = null;

export function getRedisCache(): RedisCache {
  if (!redisCache) {
    redisCache = new RedisCache();
  }
  return redisCache;
}

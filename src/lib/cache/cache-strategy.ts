import { RedisCache } from './redis-cache';
import { MemoryCache } from './memory-cache';
import { createClient } from '@supabase/supabase-js';

export interface CacheStrategy {
  level: 'memory' | 'redis' | 'database';
  ttl: number;
  tags?: string[];
  fallback?: boolean;
}

export interface CacheKey {
  type: 'user' | 'organization' | 'query' | 'permission' | 'rate_limit';
  id: string;
  scope?: string;
}

export class CacheStrategyService {
  private redisCache: RedisCache;
  private memoryCache: MemoryCache;
  private supabase: any;

  constructor() {
    this.redisCache = new RedisCache();
    this.memoryCache = new MemoryCache();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Get cache strategy for a key type
   */
  private getStrategy(keyType: string): CacheStrategy {
    const strategies: Record<string, CacheStrategy> = {
      user: {
        level: 'memory',
        ttl: 300, // 5 minutes
        tags: ['users'],
        fallback: true
      },
      organization: {
        level: 'redis',
        ttl: 3600, // 1 hour
        tags: ['organizations'],
        fallback: true
      },
      query: {
        level: 'memory',
        ttl: 120, // 2 minutes
        tags: ['queries'],
        fallback: false
      },
      permission: {
        level: 'memory',
        ttl: 600, // 10 minutes
        tags: ['permissions'],
        fallback: true
      },
      rate_limit: {
        level: 'redis',
        ttl: 60, // 1 minute
        tags: ['rate_limits'],
        fallback: false
      }
    };

    return strategies[keyType] || {
      level: 'memory',
      ttl: 300,
      fallback: true
    };
  }

  /**
   * Build cache key
   */
  private buildKey(cacheKey: CacheKey): string {
    const { type, id, scope } = cacheKey;
    return scope ? `${type}:${id}:${scope}` : `${type}:${id}`;
  }

  /**
   * Get value from cache with strategy
   */
  async get<T>(cacheKey: CacheKey): Promise<T | null> {
    const key = this.buildKey(cacheKey);
    const strategy = this.getStrategy(cacheKey.type);

    try {
      // Try memory cache first
      if (strategy.level === 'memory') {
        const value = this.memoryCache.get<T>(key);
        if (value !== null) {
          return value;
        }
      }

      // Try Redis cache
      if (strategy.level === 'redis') {
        const value = await this.redisCache.get<T>(key);
        if (value !== null) {
          // Store in memory cache for faster access
          this.memoryCache.set(key, value, strategy.ttl * 1000);
          return value;
        }
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with strategy
   */
  async set<T>(cacheKey: CacheKey, value: T, ttl?: number): Promise<boolean> {
    const key = this.buildKey(cacheKey);
    const strategy = this.getStrategy(cacheKey.type);
    const cacheTTL = ttl || strategy.ttl;

    try {
      let success = true;

      // Set in memory cache
      if (strategy.level === 'memory') {
        success = this.memoryCache.set(key, value, cacheTTL * 1000) && success;
      }

      // Set in Redis cache
      if (strategy.level === 'redis') {
        success = await this.redisCache.set(key, value, { ttl: cacheTTL, tags: strategy.tags }) && success;
      }

      return success;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get or set value with fallback
   */
  async getOrSet<T>(
    cacheKey: CacheKey,
    fallback: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    const value = await fallback();
    await this.set(cacheKey, value, ttl);
    
    return value;
  }

  /**
   * Delete value from cache
   */
  async delete(cacheKey: CacheKey): Promise<boolean> {
    const key = this.buildKey(cacheKey);
    const strategy = this.getStrategy(cacheKey.type);

    try {
      let success = true;

      // Delete from memory cache
      if (strategy.level === 'memory') {
        success = this.memoryCache.delete(key) && success;
      }

      // Delete from Redis cache
      if (strategy.level === 'redis') {
        success = await this.redisCache.delete(key) && success;
      }

      return success;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let totalDeleted = 0;

      // Invalidate memory cache
      const memoryKeys = this.memoryCache.keys();
      for (const key of memoryKeys) {
        // Simple tag matching for memory cache
        if (tags.some(tag => key.includes(tag))) {
          this.memoryCache.delete(key);
          totalDeleted++;
        }
      }

      // Invalidate Redis cache
      const redisDeleted = await this.redisCache.invalidateByTags(tags);
      totalDeleted += redisDeleted;

      return totalDeleted;
    } catch (error) {
      console.error('Cache invalidateByTags error:', error);
      return 0;
    }
  }

  /**
   * Get user profile with caching
   */
  async getUserProfile(userId: string): Promise<any> {
    return this.getOrSet(
      { type: 'user', id: userId },
      async () => {
        const { data, error } = await this.supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          throw new Error(`Failed to fetch user profile: ${error.message}`);
        }

        return data;
      }
    );
  }

  /**
   * Get organization with caching
   */
  async getOrganization(organizationId: string): Promise<any> {
    return this.getOrSet(
      { type: 'organization', id: organizationId },
      async () => {
        const { data, error } = await this.supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single();

        if (error) {
          throw new Error(`Failed to fetch organization: ${error.message}`);
        }

        return data;
      }
    );
  }

  /**
   * Get user permissions with caching
   */
  async getUserPermissions(userId: string): Promise<any[]> {
    return this.getOrSet(
      { type: 'permission', id: userId },
      async () => {
        const { data, error } = await this.supabase
          .from('role_permissions')
          .select(`
            permission_scope,
            permission_action,
            user_profiles!inner(role)
          `)
          .eq('user_profiles.id', userId);

        if (error) {
          throw new Error(`Failed to fetch user permissions: ${error.message}`);
        }

        return data || [];
      }
    );
  }

  /**
   * Cache query result
   */
  async cacheQueryResult<T>(
    queryKey: string,
    result: T,
    ttl: number = 120
  ): Promise<void> {
    await this.set(
      { type: 'query', id: queryKey },
      result,
      ttl
    );
  }

  /**
   * Get cached query result
   */
  async getCachedQueryResult<T>(queryKey: string): Promise<T | null> {
    return this.get<T>({ type: 'query', id: queryKey });
  }

  /**
   * Invalidate user cache
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.delete({ type: 'user', id: userId });
    await this.delete({ type: 'permission', id: userId });
    await this.invalidateByTags(['users', 'permissions']);
  }

  /**
   * Invalidate organization cache
   */
  async invalidateOrganizationCache(organizationId: string): Promise<void> {
    await this.delete({ type: 'organization', id: organizationId });
    await this.invalidateByTags(['organizations']);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    memory: any;
    redis: any;
  }> {
    const [memoryStats, redisStats] = await Promise.all([
      Promise.resolve(this.memoryCache.getStats()),
      this.redisCache.getStats()
    ]);

    return {
      memory: memoryStats,
      redis: redisStats
    };
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.memoryCache.clear(),
      this.redisCache.clear()
    ]);
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.redisCache.close();
    this.memoryCache.destroy();
  }
}

// Singleton instance
let cacheStrategyService: CacheStrategyService | null = null;

export function getCacheStrategyService(): CacheStrategyService {
  if (!cacheStrategyService) {
    cacheStrategyService = new CacheStrategyService();
  }
  return cacheStrategyService;
}

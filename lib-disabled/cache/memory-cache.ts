export interface MemoryCacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  cleanupInterval?: number; // Cleanup interval in milliseconds
}

export interface MemoryCacheItem<T> {
  value: T;
  expires: number;
  accessCount: number;
  lastAccessed: number;
}

export interface MemoryCacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  evictions: number;
}

export class MemoryCache<T = any> {
  private cache: Map<string, MemoryCacheItem<T>>;
  private options: Required<MemoryCacheOptions>;
  private stats: MemoryCacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(options: MemoryCacheOptions = {}) {
    this.cache = new Map();
    this.options = {
      ttl: options.ttl || 300000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      cleanupInterval: options.cleanupInterval || 60000, // 1 minute
      ...options
    };
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
      evictions: 0
    };

    this.startCleanupTimer();
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size--;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    this.stats.hits++;
    this.updateHitRate();
    
    return item.value;
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: T, ttl?: number): boolean {
    try {
      // Check if we need to evict items
      if (this.cache.size >= this.options.maxSize) {
        this.evictLRU();
      }

      const expires = Date.now() + (ttl || this.options.ttl);
      const item: MemoryCacheItem<T> = {
        value,
        expires,
        accessCount: 0,
        lastAccessed: Date.now()
      };

      this.cache.set(key, item);
      this.stats.size = this.cache.size;
      
      return true;
    } catch (error) {
      console.error('Memory cache set error:', error);
      return false;
    }
  }

  /**
   * Get or set a value with fallback function
   */
  getOrSet(key: string, fallback: () => T | Promise<T>, ttl?: number): T | Promise<T> {
    const cached = this.get(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = fallback();
    
    // Handle both sync and async fallbacks
    if (value instanceof Promise) {
      return value.then(result => {
        this.set(key, result, ttl);
        return result;
      });
    } else {
      this.set(key, value, ttl);
      return value;
    }
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Delete multiple keys
   */
  deleteMany(keys: string[]): number {
    let deleted = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.size--;
      return false;
    }
    
    return true;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): MemoryCacheStats {
    return { ...this.stats };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(item => item.value);
  }

  /**
   * Get all entries
   */
  entries(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let lruKey = '';
    let lruTime = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      this.cache.delete(key);
    }
    
    this.stats.size = this.cache.size;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
  }

  /**
   * Stop cleanup timer
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Destroy the cache
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
  }
}

// Singleton instances for different cache types
const userCache = new MemoryCache({ ttl: 300000, maxSize: 500 }); // 5 minutes, 500 items
const orgCache = new MemoryCache({ ttl: 600000, maxSize: 100 }); // 10 minutes, 100 items
const queryCache = new MemoryCache({ ttl: 120000, maxSize: 200 }); // 2 minutes, 200 items

export { userCache, orgCache, queryCache };

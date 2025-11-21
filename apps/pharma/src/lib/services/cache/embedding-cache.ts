/**
 * Embedding Cache
 * 
 * Caches query embeddings to avoid redundant OpenAI API calls
 * Uses in-memory cache (development) or Redis (production)
 */

import { createLogger } from '../observability/structured-logger';
import crypto from 'crypto';

export interface CacheEntry {
  embedding: number[];
  cachedAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number; // Maximum cache size (default: 1000)
}

class EmbeddingCache {
  private cache: Map<string, CacheEntry> = new Map();
  private logger;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes
      maxSize: options.maxSize || 1000,
    };
    this.logger = createLogger();
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Generate cache key from query text
   */
  private generateKey(query: string): string {
    // Create consistent hash from query (case-insensitive, trimmed)
    const normalized = query.trim().toLowerCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Get cached embedding if available
   */
  get(query: string): number[] | null {
    const key = this.generateKey(query);
    const entry = this.cache.get(key);

    if (!entry) {
      this.logger.debug('embedding_cache_miss', {
        operation: 'get',
        queryPreview: query.substring(0, 50),
      });
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.cachedAt;
    if (age > this.options.ttl) {
      this.cache.delete(key);
      this.logger.debug('embedding_cache_expired', {
        operation: 'get',
        queryPreview: query.substring(0, 50),
        age,
      });
      return null;
    }

    this.logger.debug('embedding_cache_hit', {
      operation: 'get',
      queryPreview: query.substring(0, 50),
      age,
    });

    return entry.embedding;
  }

  /**
   * Store embedding in cache
   */
  set(query: string, embedding: number[]): void {
    const key = this.generateKey(query);

    // Check cache size and evict if needed
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      embedding,
      cachedAt: Date.now(),
    });

    this.logger.debug('embedding_cache_set', {
      operation: 'set',
      queryPreview: query.substring(0, 50),
      cacheSize: this.cache.size,
    });
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.cachedAt < oldestTime) {
        oldestTime = entry.cachedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.logger.debug('embedding_cache_evicted', {
        operation: 'evictLRU',
        evictedKey: oldestKey.substring(0, 16),
      });
    }
  }

  /**
   * Clear expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.cachedAt;
      if (age > this.options.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug('embedding_cache_cleanup', {
        operation: 'cleanup',
        cleaned,
        remaining: this.cache.size,
      });
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.info('embedding_cache_cleared', {
      operation: 'clear',
      cleared: size,
    });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const entry of this.cache.values()) {
      const age = now - entry.cachedAt;
      if (age > this.options.ttl) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      size: this.cache.size,
      valid,
      expired,
      maxSize: this.options.maxSize,
      hitRate: 0, // Would need to track hits/misses separately
    };
  }
}

// Export singleton instance
let cacheInstance: EmbeddingCache | null = null;

export function getEmbeddingCache(): EmbeddingCache {
  if (!cacheInstance) {
    cacheInstance = new EmbeddingCache({
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
    });
  }
  return cacheInstance;
}


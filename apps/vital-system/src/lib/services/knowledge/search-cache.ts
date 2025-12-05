/**
 * Search Cache Service
 *
 * Provides intelligent caching for knowledge search operations with:
 * - LRU (Least Recently Used) eviction strategy
 * - TTL (Time To Live) expiration
 * - Query normalization for better hit rates
 * - Cache statistics for monitoring
 * - Memory pressure management
 */

// Cache entry structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

// Cache configuration
interface CacheConfig {
  maxEntries: number;
  defaultTTL: number; // milliseconds
  maxMemoryMB: number;
  enableStats: boolean;
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  memoryUsedMB: number;
  hitRate: number;
  averageHitsPerEntry: number;
  oldestEntryAge: number;
}

// Search cache key components
interface SearchCacheKey {
  query: string;
  source: string;
  domain?: string;
  strategy?: string;
  maxResults?: number;
}

// Default configuration
const DEFAULT_CONFIG: CacheConfig = {
  maxEntries: 500,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxMemoryMB: 50,
  enableStats: true,
};

// TTL presets by source type (in milliseconds)
export const TTL_PRESETS = {
  internal: 5 * 60 * 1000,      // 5 minutes for internal RAG
  pubmed: 30 * 60 * 1000,       // 30 minutes for PubMed (stable data)
  clinicaltrials: 60 * 60 * 1000, // 1 hour for ClinicalTrials
  fda: 60 * 60 * 1000,          // 1 hour for FDA
  unified: 10 * 60 * 1000,      // 10 minutes for unified search
} as const;

class SearchCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      hits: 0,
      misses: 0,
      entries: 0,
      memoryUsedMB: 0,
      hitRate: 0,
      averageHitsPerEntry: 0,
      oldestEntryAge: 0,
    };
  }

  /**
   * Generate a normalized cache key from search parameters
   */
  private generateKey(keyComponents: SearchCacheKey): string {
    const normalized = {
      query: this.normalizeQuery(keyComponents.query),
      source: keyComponents.source?.toLowerCase() || 'all',
      domain: keyComponents.domain?.toLowerCase() || 'all',
      strategy: keyComponents.strategy?.toLowerCase() || 'hybrid',
      maxResults: keyComponents.maxResults || 10,
    };
    return JSON.stringify(normalized);
  }

  /**
   * Normalize query string for better cache hit rates
   * - Lowercase
   * - Remove extra whitespace
   * - Sort words alphabetically (for simple queries)
   * - Remove common stopwords
   */
  private normalizeQuery(query: string): string {
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are']);

    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => !stopwords.has(word) && word.length > 1)
      .sort()
      .join(' ');
  }

  /**
   * Estimate memory size of an object (rough approximation)
   */
  private estimateSize(obj: unknown): number {
    const str = JSON.stringify(obj);
    // Rough estimate: 2 bytes per character for UTF-16 strings in JS
    return (str.length * 2) / (1024 * 1024); // Returns MB
  }

  /**
   * Check if cache is approaching memory limit
   */
  private isMemoryPressure(): boolean {
    return this.stats.memoryUsedMB > this.config.maxMemoryMB * 0.9;
  }

  /**
   * Evict entries to free memory (LRU strategy)
   */
  private evictLRU(count: number = 1): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        lastAccessed: entry.timestamp + (entry.hits * 60000), // Factor in hit count
      }))
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    for (let i = 0; i < count && i < entries.length; i++) {
      const entry = this.cache.get(entries[i].key);
      if (entry) {
        this.stats.memoryUsedMB -= entry.size;
      }
      this.cache.delete(entries[i].key);
    }
    this.stats.entries = this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.stats.memoryUsedMB -= entry.size;
      }
      this.cache.delete(key);
    }
    this.stats.entries = this.cache.size;
  }

  /**
   * Get an entry from cache
   */
  get(keyComponents: SearchCacheKey): T | null {
    const key = this.generateKey(keyComponents);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.memoryUsedMB -= entry.size;
      this.stats.entries = this.cache.size;
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update stats and hit count
    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();

    return entry.data;
  }

  /**
   * Set an entry in cache
   */
  set(keyComponents: SearchCacheKey, data: T, ttl?: number): void {
    const key = this.generateKey(keyComponents);
    const size = this.estimateSize(data);
    const entryTTL = ttl || TTL_PRESETS[keyComponents.source as keyof typeof TTL_PRESETS] || this.config.defaultTTL;

    // Check memory pressure
    if (this.isMemoryPressure() || this.cache.size >= this.config.maxEntries) {
      this.cleanExpired();

      // If still at limit, evict LRU entries
      if (this.cache.size >= this.config.maxEntries) {
        this.evictLRU(Math.ceil(this.config.maxEntries * 0.1)); // Evict 10%
      }
    }

    // Check if single entry is too large
    if (size > this.config.maxMemoryMB * 0.2) {
      console.warn(`Cache entry too large (${size.toFixed(2)}MB), skipping cache`);
      return;
    }

    // Remove existing entry if present
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.stats.memoryUsedMB -= existingEntry.size;
    }

    // Add new entry
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: entryTTL,
      hits: 0,
      size,
    });

    this.stats.memoryUsedMB += size;
    this.stats.entries = this.cache.size;
  }

  /**
   * Delete a specific entry
   */
  delete(keyComponents: SearchCacheKey): boolean {
    const key = this.generateKey(keyComponents);
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.memoryUsedMB -= entry.size;
      this.cache.delete(key);
      this.stats.entries = this.cache.size;
      return true;
    }
    return false;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      entries: 0,
      memoryUsedMB: 0,
      hitRate: 0,
      averageHitsPerEntry: 0,
      oldestEntryAge: 0,
    };
  }

  /**
   * Clear entries for a specific source
   */
  clearSource(source: string): number {
    let cleared = 0;
    const keysToDelete: string[] = [];

    Array.from(this.cache.entries()).forEach(([key]) => {
      try {
        const parsed = JSON.parse(key);
        if (parsed.source === source.toLowerCase()) {
          keysToDelete.push(key);
        }
      } catch {
        // Skip invalid keys
      }
    });

    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.stats.memoryUsedMB -= entry.size;
      }
      this.cache.delete(key);
      cleared++;
    }

    this.stats.entries = this.cache.size;
    return cleared;
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;

    // Calculate average hits per entry
    let totalHits = 0;
    let oldestTimestamp = Date.now();
    Array.from(this.cache.values()).forEach((entry) => {
      totalHits += entry.hits;
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    });
    this.stats.averageHitsPerEntry = this.cache.size > 0 ? totalHits / this.cache.size : 0;
    this.stats.oldestEntryAge = Date.now() - oldestTimestamp;
  }

  /**
   * Get current cache statistics
   */
  getStats(): CacheStats {
    this.updateHitRate();
    return { ...this.stats };
  }

  /**
   * Get cache entries for debugging
   */
  getEntries(): Array<{ key: string; hits: number; age: number; size: number }> {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: now - entry.timestamp,
      size: entry.size,
    }));
  }

  /**
   * Prewarm cache with common queries
   */
  async prewarm(
    commonQueries: SearchCacheKey[],
    fetcher: (key: SearchCacheKey) => Promise<T>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const query of commonQueries) {
      try {
        const data = await fetcher(query);
        this.set(query, data);
        success++;
      } catch (error) {
        console.error('Cache prewarm failed for query:', query, error);
        failed++;
      }
    }

    return { success, failed };
  }
}

// Singleton instance for search results
export const searchCache = new SearchCache({
  maxEntries: 500,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxMemoryMB: 50,
  enableStats: true,
});

// Separate cache for external API results (longer TTL)
export const externalApiCache = new SearchCache({
  maxEntries: 200,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  maxMemoryMB: 30,
  enableStats: true,
});

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// Request deduplication for concurrent identical requests
const pendingRequests = new Map<string, Promise<unknown>>();

export async function deduplicatedFetch<T>(
  cacheKey: SearchCacheKey,
  fetcher: () => Promise<T>
): Promise<T> {
  const key = JSON.stringify(cacheKey);

  // Check if request is already in flight
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached !== null) {
    return cached as T;
  }

  // Create new request
  const promise = fetcher()
    .then((result) => {
      searchCache.set(cacheKey, result);
      return result;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
}

// Performance timing utility
export function measurePerformance<T>(
  operation: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  return operation().then((result) => ({
    result,
    duration: performance.now() - start,
  }));
}

export default SearchCache;

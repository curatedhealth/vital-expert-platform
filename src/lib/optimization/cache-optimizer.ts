/**
 * Cache Optimizer
 * Intelligent caching strategies and cache performance optimization
 */

export interface CacheStrategy {
  id: string;
  name: string;
  type: 'memory' | 'redis' | 'database' | 'cdn' | 'application';
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl';
  hitRate: number;
  missRate: number;
  memoryUsage: number;
  lastOptimized: Date;
}

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  size: number;
  priority: number;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  memoryUsage: number;
  averageAccessTime: number;
  totalRequests: number;
  cacheSize: number;
  timestamp: Date;
}

export interface CacheOptimization {
  id: string;
  strategyId: string;
  optimizationType: 'ttl_adjustment' | 'size_adjustment' | 'eviction_policy' | 'preloading' | 'invalidation';
  description: string;
  expectedImprovement: number;
  appliedAt: Date;
  status: 'pending' | 'applied' | 'failed';
  metrics: {
    beforeHitRate: number;
    afterHitRate: number;
    beforeMemoryUsage: number;
    afterMemoryUsage: number;
  };
}

export class CacheOptimizer {
  private strategies: Map<string, CacheStrategy> = new Map();
  private cacheEntries: Map<string, Map<string, CacheEntry>> = new Map();
  private metrics: Map<string, CacheMetrics> = new Map();
  private optimizations: Map<string, CacheOptimization> = new Map();
  private isOptimizing: boolean = false;

  constructor() {
    this.initializeDefaultStrategies();
    this.startOptimizationProcess();
  }

  /**
   * Initialize default cache strategies
   */
  private initializeDefaultStrategies(): void {
    const defaultStrategies: CacheStrategy[] = [
      {
        id: 'agent_selection_cache',
        name: 'Agent Selection Cache',
        type: 'memory',
        ttl: 3600, // 1 hour
        maxSize: 1000,
        evictionPolicy: 'lru',
        hitRate: 0,
        missRate: 0,
        memoryUsage: 0,
        lastOptimized: new Date()
      },
      {
        id: 'embedding_cache',
        name: 'Embedding Cache',
        type: 'redis',
        ttl: 7200, // 2 hours
        maxSize: 5000,
        evictionPolicy: 'lru',
        hitRate: 0,
        missRate: 0,
        memoryUsage: 0,
        lastOptimized: new Date()
      },
      {
        id: 'user_preferences_cache',
        name: 'User Preferences Cache',
        type: 'memory',
        ttl: 1800, // 30 minutes
        maxSize: 500,
        evictionPolicy: 'lfu',
        hitRate: 0,
        missRate: 0,
        memoryUsage: 0,
        lastOptimized: new Date()
      },
      {
        id: 'rag_results_cache',
        name: 'RAG Results Cache',
        type: 'redis',
        ttl: 1800, // 30 minutes
        maxSize: 2000,
        evictionPolicy: 'ttl',
        hitRate: 0,
        missRate: 0,
        memoryUsage: 0,
        lastOptimized: new Date()
      },
      {
        id: 'response_cache',
        name: 'Response Cache',
        type: 'memory',
        ttl: 300, // 5 minutes
        maxSize: 100,
        evictionPolicy: 'fifo',
        hitRate: 0,
        missRate: 0,
        memoryUsage: 0,
        lastOptimized: new Date()
      }
    ];

    defaultStrategies.forEach(strategy => {
      this.strategies.set(strategy.id, strategy);
      this.cacheEntries.set(strategy.id, new Map());
      this.metrics.set(strategy.id, {
        hitRate: 0,
        missRate: 0,
        evictionRate: 0,
        memoryUsage: 0,
        averageAccessTime: 0,
        totalRequests: 0,
        cacheSize: 0,
        timestamp: new Date()
      });
    });
  }

  /**
   * Start the optimization process
   */
  private startOptimizationProcess(): void {
    this.isOptimizing = true;

    // Monitor cache performance every 2 minutes
    setInterval(() => {
      this.monitorCachePerformance();
    }, 2 * 60 * 1000);

    // Optimize cache strategies every 10 minutes
    setInterval(() => {
      this.optimizeCacheStrategies();
    }, 10 * 60 * 1000);

    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);

    console.log('💾 Cache optimizer started');
  }

  /**
   * Monitor cache performance
   */
  private monitorCachePerformance(): void {
    for (const [strategyId, strategy] of this.strategies.entries()) {
      const metrics = this.calculateCacheMetrics(strategyId);
      this.metrics.set(strategyId, metrics);

      // Update strategy with current metrics
      strategy.hitRate = metrics.hitRate;
      strategy.missRate = metrics.missRate;
      strategy.memoryUsage = metrics.memoryUsage;
    }
  }

  /**
   * Calculate cache metrics for a strategy
   */
  private calculateCacheMetrics(strategyId: string): CacheMetrics {
    const entries = this.cacheEntries.get(strategyId) || new Map();
    const strategy = this.strategies.get(strategyId)!;

    let totalRequests = 0;
    let hits = 0;
    let misses = 0;
    const evictions = 0;
    const totalAccessTime = 0;
    let totalSize = 0;

    for (const [key, entry] of entries.entries()) {
      totalRequests += entry.accessCount;
      hits += entry.accessCount; // Simplified - in production, track actual hits/misses
      totalSize += entry.size;
    }

    misses = totalRequests - hits;
    const hitRate = totalRequests > 0 ? hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? misses / totalRequests : 0;
    const averageAccessTime = totalRequests > 0 ? totalAccessTime / totalRequests : 0;

    return {
      hitRate,
      missRate,
      evictionRate: evictions / Math.max(totalRequests, 1),
      memoryUsage: totalSize,
      averageAccessTime,
      totalRequests,
      cacheSize: entries.size,
      timestamp: new Date()
    };
  }

  /**
   * Optimize cache strategies
   */
  private optimizeCacheStrategies(): void {
    console.log('🔧 Optimizing cache strategies...');

    for (const [strategyId, strategy] of this.strategies.entries()) {
      const metrics = this.metrics.get(strategyId);
      if (!metrics) continue;

      // Check if optimization is needed
      if (this.needsOptimization(strategy, metrics)) {
        const optimization = this.generateOptimization(strategy, metrics);
        if (optimization) {
          this.optimizations.set(optimization.id, optimization);
          this.applyOptimization(optimization);
        }
      }
    }
  }

  /**
   * Check if cache strategy needs optimization
   */
  private needsOptimization(strategy: CacheStrategy, metrics: CacheMetrics): boolean {
    // Low hit rate
    if (metrics.hitRate < 0.7) return true;

    // High memory usage
    if (metrics.memoryUsage > strategy.maxSize * 0.9) return true;

    // High eviction rate
    if (metrics.evictionRate > 0.1) return true;

    // Large cache size
    if (metrics.cacheSize > strategy.maxSize * 0.8) return true;

    return false;
  }

  /**
   * Generate cache optimization
   */
  private generateOptimization(strategy: CacheStrategy, metrics: CacheMetrics): CacheOptimization | null {
    let optimizationType: 'ttl_adjustment' | 'size_adjustment' | 'eviction_policy' | 'preloading' | 'invalidation';
    let description = '';
    let expectedImprovement = 0;

    if (metrics.hitRate < 0.7) {
      optimizationType = 'ttl_adjustment';
      description = `Increase TTL for ${strategy.name} to improve hit rate`;
      expectedImprovement = 15;
    } else if (metrics.memoryUsage > strategy.maxSize * 0.9) {
      optimizationType = 'size_adjustment';
      description = `Increase cache size for ${strategy.name} to reduce evictions`;
      expectedImprovement = 20;
    } else if (metrics.evictionRate > 0.1) {
      optimizationType = 'eviction_policy';
      description = `Change eviction policy for ${strategy.name} to reduce evictions`;
      expectedImprovement = 10;
    } else {
      return null;
    }

    return {
      id: `cache_opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      strategyId: strategy.id,
      optimizationType,
      description,
      expectedImprovement,
      appliedAt: new Date(),
      status: 'pending',
      metrics: {
        beforeHitRate: metrics.hitRate,
        afterHitRate: 0, // Will be updated after application
        beforeMemoryUsage: metrics.memoryUsage,
        afterMemoryUsage: 0 // Will be updated after application
      }
    };
  }

  /**
   * Apply cache optimization
   */
  private applyOptimization(optimization: CacheOptimization): void {
    const strategy = this.strategies.get(optimization.strategyId);
    if (!strategy) return;

    try {
      switch (optimization.optimizationType) {
        case 'ttl_adjustment':
          this.adjustTTL(strategy, optimization);
          break;
        case 'size_adjustment':
          this.adjustCacheSize(strategy, optimization);
          break;
        case 'eviction_policy':
          this.adjustEvictionPolicy(strategy, optimization);
          break;
        case 'preloading':
          this.implementPreloading(strategy, optimization);
          break;
        case 'invalidation':
          this.implementInvalidation(strategy, optimization);
          break;
      }

      optimization.status = 'applied';
      strategy.lastOptimized = new Date();
      console.log(`✅ Applied cache optimization: ${optimization.description}`);

    } catch (error) {
      optimization.status = 'failed';
      console.error(`❌ Failed to apply cache optimization:`, error);
    }
  }

  /**
   * Adjust TTL for cache strategy
   */
  private adjustTTL(strategy: CacheStrategy, optimization: CacheOptimization): void {
    const currentTTL = strategy.ttl;
    const newTTL = Math.min(currentTTL * 1.5, 7200); // Increase by 50%, max 2 hours
    
    strategy.ttl = newTTL;
    console.log(`📈 Increased TTL for ${strategy.name} from ${currentTTL}s to ${newTTL}s`);
  }

  /**
   * Adjust cache size for strategy
   */
  private adjustCacheSize(strategy: CacheStrategy, optimization: CacheOptimization): void {
    const currentSize = strategy.maxSize;
    const newSize = Math.min(currentSize * 1.5, 10000); // Increase by 50%, max 10k entries
    
    strategy.maxSize = newSize;
    console.log(`📈 Increased cache size for ${strategy.name} from ${currentSize} to ${newSize}`);
  }

  /**
   * Adjust eviction policy for strategy
   */
  private adjustEvictionPolicy(strategy: CacheStrategy, optimization: CacheOptimization): void {
    const policies: ('lru' | 'lfu' | 'fifo' | 'ttl')[] = ['lru', 'lfu', 'fifo', 'ttl'];
    const currentPolicy = strategy.evictionPolicy;
    const currentIndex = policies.indexOf(currentPolicy);
    const newPolicy = policies[(currentIndex + 1) % policies.length];
    
    strategy.evictionPolicy = newPolicy;
    console.log(`🔄 Changed eviction policy for ${strategy.name} from ${currentPolicy} to ${newPolicy}`);
  }

  /**
   * Implement preloading for strategy
   */
  private implementPreloading(strategy: CacheStrategy, optimization: CacheOptimization): void {
    console.log(`🔄 Implementing preloading for ${strategy.name}`);
    // In production, this would implement actual preloading logic
  }

  /**
   * Implement invalidation for strategy
   */
  private implementInvalidation(strategy: CacheStrategy, optimization: CacheOptimization): void {
    console.log(`🔄 Implementing invalidation for ${strategy.name}`);
    // In production, this would implement actual invalidation logic
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let totalCleaned = 0;

    for (const [strategyId, entries] of this.cacheEntries.entries()) {
      const strategy = this.strategies.get(strategyId);
      if (!strategy) continue;

      const expiredKeys: string[] = [];
      
      for (const [key, entry] of entries.entries()) {
        const age = now - entry.createdAt.getTime();
        if (age > strategy.ttl * 1000) {
          expiredKeys.push(key);
        }
      }

      // Remove expired entries
      expiredKeys.forEach(key => {
        entries.delete(key);
        totalCleaned++;
      });
    }

    if (totalCleaned > 0) {
      console.log(`🧹 Cleaned up ${totalCleaned} expired cache entries`);
    }
  }

  /**
   * Get cache entry
   */
  getCacheEntry(strategyId: string, key: string): any | null {
    const entries = this.cacheEntries.get(strategyId);
    if (!entries) return null;

    const entry = entries.get(key);
    if (!entry) return null;

    // Check if expired
    const now = Date.now();
    const age = now - entry.createdAt.getTime();
    if (age > entry.ttl * 1000) {
      entries.delete(key);
      return null;
    }

    // Update access statistics
    entry.lastAccessed = new Date();
    entry.accessCount++;

    return entry.value;
  }

  /**
   * Set cache entry
   */
  setCacheEntry(strategyId: string, key: string, value: any, ttl?: number): void {
    const entries = this.cacheEntries.get(strategyId);
    if (!entries) return;

    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    // Check cache size limit
    if (entries.size >= strategy.maxSize) {
      this.evictEntry(strategyId, entries);
    }

    const entry: CacheEntry = {
      key,
      value,
      ttl: ttl || strategy.ttl,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      size: this.calculateEntrySize(value),
      priority: 1
    };

    entries.set(key, entry);
  }

  /**
   * Evict entry based on eviction policy
   */
  private evictEntry(strategyId: string, entries: Map<string, CacheEntry>): void {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    let keyToEvict: string | null = null;

    switch (strategy.evictionPolicy) {
      case 'lru':
        keyToEvict = this.findLRUEntry(entries);
        break;
      case 'lfu':
        keyToEvict = this.findLFUEntry(entries);
        break;
      case 'fifo':
        keyToEvict = this.findFIFOEntry(entries);
        break;
      case 'ttl':
        keyToEvict = this.findTTLEntry(entries);
        break;
    }

    if (keyToEvict) {
      entries.delete(keyToEvict);
    }
  }

  /**
   * Find least recently used entry
   */
  private findLRUEntry(entries: Map<string, CacheEntry>): string | null {
    let oldestTime = Date.now();
    let oldestKey: string | null = null;

    for (const [key, entry] of entries.entries()) {
      if (entry.lastAccessed.getTime() < oldestTime) {
        oldestTime = entry.lastAccessed.getTime();
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Find least frequently used entry
   */
  private findLFUEntry(entries: Map<string, CacheEntry>): string | null {
    let minAccessCount = Infinity;
    let lfuKey: string | null = null;

    for (const [key, entry] of entries.entries()) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        lfuKey = key;
      }
    }

    return lfuKey;
  }

  /**
   * Find first in, first out entry
   */
  private findFIFOEntry(entries: Map<string, CacheEntry>): string | null {
    let oldestTime = Date.now();
    let oldestKey: string | null = null;

    for (const [key, entry] of entries.entries()) {
      if (entry.createdAt.getTime() < oldestTime) {
        oldestTime = entry.createdAt.getTime();
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Find entry closest to TTL expiration
   */
  private findTTLEntry(entries: Map<string, CacheEntry>): string | null {
    const now = Date.now();
    let closestToExpiry = 0;
    let closestKey: string | null = null;

    for (const [key, entry] of entries.entries()) {
      const age = now - entry.createdAt.getTime();
      const timeToExpiry = (entry.ttl * 1000) - age;
      
      if (timeToExpiry < closestToExpiry || closestKey === null) {
        closestToExpiry = timeToExpiry;
        closestKey = key;
      }
    }

    return closestKey;
  }

  /**
   * Calculate entry size
   */
  private calculateEntrySize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 100; // Default size if serialization fails
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): {
    strategies: CacheStrategy[];
    metrics: CacheMetrics[];
    optimizations: CacheOptimization[];
    totalMemoryUsage: number;
    averageHitRate: number;
  } {
    const strategies = Array.from(this.strategies.values());
    const metrics = Array.from(this.metrics.values());
    const optimizations = Array.from(this.optimizations.values());

    const totalMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    const averageHitRate = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.hitRate, 0) / metrics.length 
      : 0;

    return {
      strategies,
      metrics,
      optimizations,
      totalMemoryUsage,
      averageHitRate
    };
  }

  /**
   * Clear cache for specific strategy
   */
  clearCache(strategyId: string): void {
    const entries = this.cacheEntries.get(strategyId);
    if (entries) {
      entries.clear();
      console.log(`🧹 Cleared cache for strategy: ${strategyId}`);
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    for (const [strategyId, entries] of this.cacheEntries.entries()) {
      entries.clear();
    }
    console.log('🧹 Cleared all caches');
  }
}

export const cacheOptimizer = new CacheOptimizer();

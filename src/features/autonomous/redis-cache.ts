import Redis from 'ioredis';
import { EventEmitter } from 'events';

/**
 * Advanced Redis Caching System for Autonomous Agents
 * Provides distributed caching, session management, and performance optimization
 */

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix: string;
  defaultTTL: number;
  maxRetries: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
  maxMemoryPolicy: 'noeviction' | 'allkeys-lru' | 'volatile-lru' | 'allkeys-random' | 'volatile-random' | 'volatile-ttl';
  cluster?: {
    enabled: boolean;
    nodes: Array<{ host: string; port: number }>;
  };
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
  serialize?: boolean;
  namespace?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
  connectedClients: number;
  uptime: number;
}

export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  namespace: string;
  compressed: boolean;
  serialized: boolean;
}

/**
 * Advanced Redis Cache Manager
 */
export class RedisCacheManager {
  private redis: Redis;
  private config: CacheConfig;
  private eventEmitter: EventEmitter;
  private stats: CacheStats;
  private isConnected: boolean = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'vital:autonomous:',
      defaultTTL: 3600, // 1 hour
      maxRetries: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxMemoryPolicy: 'allkeys-lru',
      ...config
    };

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalKeys: 0,
      memoryUsage: 0,
      connectedClients: 0,
      uptime: 0
    };

    this.eventEmitter = new EventEmitter();
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    if (this.config.cluster?.enabled) {
      this.redis = new Redis.Cluster(this.config.cluster.nodes, {
        redisOptions: {
          password: this.config.password,
          db: this.config.db,
          keyPrefix: this.config.keyPrefix,
          retryDelayOnFailover: this.config.retryDelayOnFailover,
          enableReadyCheck: this.config.enableReadyCheck,
          maxRetriesPerRequest: this.config.maxRetries
        }
      });
    } else {
      this.redis = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db,
        keyPrefix: this.config.keyPrefix,
        retryDelayOnFailover: this.config.retryDelayOnFailover,
        enableReadyCheck: this.config.enableReadyCheck,
        maxRetriesPerRequest: this.config.maxRetries,
        maxMemoryPolicy: this.config.maxMemoryPolicy
      });
    }

    this.setupEventHandlers();
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.isConnected = true;
      this.eventEmitter.emit('cache:connected');
      console.log('✅ [RedisCache] Connected to Redis');
    });

    this.redis.on('ready', () => {
      this.eventEmitter.emit('cache:ready');
      console.log('✅ [RedisCache] Redis ready for operations');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      this.eventEmitter.emit('cache:error', error);
      console.error('❌ [RedisCache] Redis error:', error);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      this.eventEmitter.emit('cache:disconnected');
      console.log('⚠️ [RedisCache] Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      this.eventEmitter.emit('cache:reconnecting');
      console.log('🔄 [RedisCache] Reconnecting to Redis...');
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options.namespace);
      const cached = await this.redis.get(fullKey);
      
      if (!cached) {
        this.stats.misses++;
        this.updateHitRate();
        this.eventEmitter.emit('cache:miss', { key, namespace: options.namespace });
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if entry is expired
      if (this.isExpired(entry)) {
        await this.del(key, options.namespace);
        this.stats.misses++;
        this.updateHitRate();
        this.eventEmitter.emit('cache:expired', { key, namespace: options.namespace });
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();
      this.eventEmitter.emit('cache:hit', { key, namespace: options.namespace });
      
      return this.deserializeValue(entry);
    } catch (error) {
      this.eventEmitter.emit('cache:error', { key, error });
      console.error('❌ [RedisCache] Get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string, 
    value: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.namespace);
      const ttl = options.ttl || this.config.defaultTTL;
      
      const entry: CacheEntry<T> = {
        value: this.serializeValue(value, options),
        timestamp: Date.now(),
        ttl: ttl * 1000, // Convert to milliseconds
        tags: options.tags || [],
        namespace: options.namespace || 'default',
        compressed: options.compress || false,
        serialized: options.serialize !== false
      };

      const serialized = JSON.stringify(entry);
      await this.redis.setex(fullKey, ttl, serialized);
      
      // Store tags for invalidation
      if (options.tags && options.tags.length > 0) {
        await this.addTagsToKey(fullKey, options.tags);
      }

      this.eventEmitter.emit('cache:set', { key, namespace: options.namespace, ttl });
      return true;
    } catch (error) {
      this.eventEmitter.emit('cache:error', { key, error });
      console.error('❌ [RedisCache] Set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string, namespace?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.redis.del(fullKey);
      
      // Clean up tags
      await this.removeTagsFromKey(fullKey);
      
      this.eventEmitter.emit('cache:del', { key, namespace });
      return result > 0;
    } catch (error) {
      this.eventEmitter.emit('cache:error', { key, error });
      console.error('❌ [RedisCache] Delete error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, namespace?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.eventEmitter.emit('cache:error', { key, error });
      console.error('❌ [RedisCache] Exists error:', error);
      return false;
    }
  }

  /**
   * Get multiple values
   */
  async mget<T>(keys: string[], namespace?: string): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key, namespace));
      const values = await this.redis.mget(...fullKeys);
      
      return values.map((value, index) => {
        if (!value) {
          this.stats.misses++;
          return null;
        }

        try {
          const entry: CacheEntry<T> = JSON.parse(value);
          
          if (this.isExpired(entry)) {
            this.stats.misses++;
            return null;
          }

          this.stats.hits++;
          return this.deserializeValue(entry);
        } catch {
          this.stats.misses++;
          return null;
        }
      });
    } catch (error) {
      this.eventEmitter.emit('cache:error', { keys, error });
      console.error('❌ [RedisCache] Mget error:', error);
      return keys.map(() => null);
    } finally {
      this.updateHitRate();
    }
  }

  /**
   * Set multiple values
   */
  async mset<T>(
    entries: Array<{ key: string; value: T; options?: CacheOptions }>,
    namespace?: string
  ): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const { key, value, options = {} } of entries) {
        const fullKey = this.buildKey(key, namespace);
        const ttl = options.ttl || this.config.defaultTTL;
        
        const entry: CacheEntry<T> = {
          value: this.serializeValue(value, options),
          timestamp: Date.now(),
          ttl: ttl * 1000,
          tags: options.tags || [],
          namespace: namespace || 'default',
          compressed: options.compress || false,
          serialized: options.serialize !== false
        };

        const serialized = JSON.stringify(entry);
        pipeline.setex(fullKey, ttl, serialized);
        
        if (options.tags && options.tags.length > 0) {
          pipeline.sadd(`tags:${fullKey}`, ...options.tags);
        }
      }
      
      await pipeline.exec();
      this.eventEmitter.emit('cache:mset', { count: entries.length, namespace });
      return true;
    } catch (error) {
      this.eventEmitter.emit('cache:error', { entries, error });
      console.error('❌ [RedisCache] Mset error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let totalDeleted = 0;
      
      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`);
        
        if (keys.length > 0) {
          const result = await this.redis.del(...keys);
          totalDeleted += result;
          
          // Clean up tag sets
          await this.redis.del(`tag:${tag}`);
        }
      }
      
      this.eventEmitter.emit('cache:invalidateByTags', { tags, deleted: totalDeleted });
      return totalDeleted;
    } catch (error) {
      this.eventEmitter.emit('cache:error', { tags, error });
      console.error('❌ [RedisCache] Invalidate by tags error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(namespace?: string): Promise<boolean> {
    try {
      const pattern = namespace ? `${this.config.keyPrefix}${namespace}:*` : `${this.config.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      this.eventEmitter.emit('cache:clear', { namespace, deleted: keys.length });
      return true;
    } catch (error) {
      this.eventEmitter.emit('cache:error', { namespace, error });
      console.error('❌ [RedisCache] Clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info('memory');
      const memoryUsage = this.parseMemoryUsage(info);
      
      const keyspace = await this.redis.info('keyspace');
      const totalKeys = this.parseTotalKeys(keyspace);
      
      const clients = await this.redis.info('clients');
      const connectedClients = this.parseConnectedClients(clients);
      
      const server = await this.redis.info('server');
      const uptime = this.parseUptime(server);
      
      this.stats.totalKeys = totalKeys;
      this.stats.memoryUsage = memoryUsage;
      this.stats.connectedClients = connectedClients;
      this.stats.uptime = uptime;
      
      return { ...this.stats };
    } catch (error) {
      console.error('❌ [RedisCache] Stats error:', error);
      return { ...this.stats };
    }
  }

  /**
   * Get or set with fallback
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      return cached;
    }
    
    const value = await fallback();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Build full key with namespace
   */
  private buildKey(key: string, namespace?: string): string {
    const ns = namespace || 'default';
    return `${ns}:${key}`;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Serialize value based on options
   */
  private serializeValue<T>(value: T, options: CacheOptions): T {
    if (options.serialize === false) {
      return value;
    }
    
    // Add compression logic here if needed
    if (options.compress) {
      // Implement compression
    }
    
    return value;
  }

  /**
   * Deserialize value based on entry metadata
   */
  private deserializeValue<T>(entry: CacheEntry<T>): T {
    // Add decompression logic here if needed
    if (entry.compressed) {
      // Implement decompression
    }
    
    return entry.value;
  }

  /**
   * Add tags to key
   */
  private async addTagsToKey(key: string, tags: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const tag of tags) {
      pipeline.sadd(`tag:${tag}`, key);
      pipeline.sadd(`tags:${key}`, tag);
    }
    
    await pipeline.exec();
  }

  /**
   * Remove tags from key
   */
  private async removeTagsFromKey(key: string): Promise<void> {
    const tags = await this.redis.smembers(`tags:${key}`);
    
    if (tags.length > 0) {
      const pipeline = this.redis.pipeline();
      
      for (const tag of tags) {
        pipeline.srem(`tag:${tag}`, key);
      }
      
      pipeline.del(`tags:${key}`);
      await pipeline.exec();
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Parse memory usage from Redis info
   */
  private parseMemoryUsage(info: string): number {
    const match = info.match(/used_memory:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Parse total keys from Redis info
   */
  private parseTotalKeys(info: string): number {
    const match = info.match(/keys=(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Parse connected clients from Redis info
   */
  private parseConnectedClients(info: string): number {
    const match = info.match(/connected_clients:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Parse uptime from Redis info
   */
  private parseUptime(info: string): number {
    const match = info.match(/uptime_in_seconds:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
    this.isConnected = false;
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

/**
 * Cache Manager for Autonomous Agents
 */
export class AutonomousCacheManager {
  private cache: RedisCacheManager;
  private eventEmitter: EventEmitter;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new RedisCacheManager(config);
    this.eventEmitter = new EventEmitter();
    
    // Forward cache events
    this.cache.on('cache:hit', (data) => this.eventEmitter.emit('cache:hit', data));
    this.cache.on('cache:miss', (data) => this.eventEmitter.emit('cache:miss', data));
    this.cache.on('cache:error', (data) => this.eventEmitter.emit('cache:error', data));
  }

  /**
   * Cache agent responses
   */
  async cacheAgentResponse(
    agentId: string,
    query: string,
    response: any,
    ttl: number = 3600
  ): Promise<boolean> {
    const key = `agent:${agentId}:${this.hashQuery(query)}`;
    return this.cache.set(key, response, {
      ttl,
      namespace: 'agent_responses',
      tags: ['agent', agentId, 'response']
    });
  }

  /**
   * Get cached agent response
   */
  async getCachedAgentResponse(agentId: string, query: string): Promise<any | null> {
    const key = `agent:${agentId}:${this.hashQuery(query)}`;
    return this.cache.get(key, { namespace: 'agent_responses' });
  }

  /**
   * Cache task results
   */
  async cacheTaskResult(
    taskId: string,
    result: any,
    ttl: number = 7200
  ): Promise<boolean> {
    return this.cache.set(`task:${taskId}`, result, {
      ttl,
      namespace: 'task_results',
      tags: ['task', 'result']
    });
  }

  /**
   * Get cached task result
   */
  async getCachedTaskResult(taskId: string): Promise<any | null> {
    return this.cache.get(`task:${taskId}`, { namespace: 'task_results' });
  }

  /**
   * Cache evidence
   */
  async cacheEvidence(
    evidenceId: string,
    evidence: any,
    ttl: number = 86400 // 24 hours
  ): Promise<boolean> {
    return this.cache.set(`evidence:${evidenceId}`, evidence, {
      ttl,
      namespace: 'evidence',
      tags: ['evidence', 'verification']
    });
  }

  /**
   * Get cached evidence
   */
  async getCachedEvidence(evidenceId: string): Promise<any | null> {
    return this.cache.get(`evidence:${evidenceId}`, { namespace: 'evidence' });
  }

  /**
   * Cache performance metrics
   */
  async cacheMetrics(
    executionId: string,
    metrics: any,
    ttl: number = 1800 // 30 minutes
  ): Promise<boolean> {
    return this.cache.set(`metrics:${executionId}`, metrics, {
      ttl,
      namespace: 'metrics',
      tags: ['metrics', 'performance']
    });
  }

  /**
   * Get cached metrics
   */
  async getCachedMetrics(executionId: string): Promise<any | null> {
    return this.cache.get(`metrics:${executionId}`, { namespace: 'metrics' });
  }

  /**
   * Invalidate agent cache
   */
  async invalidateAgentCache(agentId: string): Promise<number> {
    return this.cache.invalidateByTags(['agent', agentId]);
  }

  /**
   * Invalidate task cache
   */
  async invalidateTaskCache(): Promise<number> {
    return this.cache.invalidateByTags(['task']);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    return this.cache.getStats();
  }

  /**
   * Hash query for consistent key generation
   */
  private hashQuery(query: string): string {
    // Simple hash function - in production, use crypto.createHash
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

// Export singleton instance
export const autonomousCacheManager = new AutonomousCacheManager();

// Export default configuration
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  host: 'localhost',
  port: 6379,
  keyPrefix: 'vital:autonomous:',
  defaultTTL: 3600,
  maxRetries: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxMemoryPolicy: 'allkeys-lru'
};

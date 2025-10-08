/**
 * Redis Caching Service for RAG System
 * Implements semantic caching and query result caching for 70-80% cost reduction
 */

import Redis from 'ioredis';
import { createClient } from '@upstash/redis';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  enableSemanticCaching: boolean;
  similarityThreshold: number; // 0-1, similarity threshold for semantic cache hits
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
  hitCount: number;
  lastAccessed: number;
}

export interface SemanticCacheEntry extends CacheEntry {
  embedding: number[];
  query: string;
  similarity: number;
}

export class RedisCacheService {
  private redis: Redis | null = null;
  private upstash: any = null;
  private embeddings: OpenAIEmbeddings;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 3600, // 1 hour default
      maxSize: 10000,
      enableSemanticCaching: true,
      similarityThreshold: 0.85,
      ...config
    };

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-large',
    });

    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Try Upstash Redis first (serverless-friendly)
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.upstash = createClient({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('✅ Upstash Redis connected');
        return;
      }

      // Fallback to local Redis
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        console.log('✅ Local Redis connected');
        return;
      }

      console.warn('⚠️ No Redis configuration found. Caching disabled.');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
    }
  }

  /**
   * Cache RAG query results
   */
  async cacheRAGResult(
    query: string,
    result: any,
    strategy: string,
    ttl?: number
  ): Promise<void> {
    try {
      const key = this.generateRAGCacheKey(query, strategy);
      const entry: CacheEntry = {
        key,
        value: result,
        timestamp: Date.now(),
        ttl: ttl || this.config.ttl,
        hitCount: 0,
        lastAccessed: Date.now(),
      };

      await this.set(key, entry, ttl);
      console.log(`💾 Cached RAG result for query: ${query.substring(0, 50)}...`);
    } catch (error) {
      console.error('Failed to cache RAG result:', error);
    }
  }

  /**
   * Retrieve cached RAG result
   */
  async getCachedRAGResult(
    query: string,
    strategy: string
  ): Promise<any | null> {
    try {
      const key = this.generateRAGCacheKey(query, strategy);
      const entry = await this.get(key);
      
      if (entry) {
        // Update hit count and last accessed
        entry.hitCount++;
        entry.lastAccessed = Date.now();
        await this.set(key, entry, entry.ttl);
        
        console.log(`🎯 Cache hit for query: ${query.substring(0, 50)}...`);
        return entry.value;
      }

      return null;
    } catch (error) {
      console.error('Failed to get cached RAG result:', error);
      return null;
    }
  }

  /**
   * Semantic caching - find similar queries
   */
  async findSimilarQuery(
    query: string,
    strategy: string,
    threshold?: number
  ): Promise<{ result: any; similarity: number } | null> {
    if (!this.config.enableSemanticCaching) return null;

    try {
      const queryEmbedding = await this.embeddings.embedQuery(query);
      const semanticKey = this.generateSemanticCacheKey(strategy);
      
      // Get all semantic cache entries for this strategy
      const entries = await this.getSemanticCacheEntries(semanticKey);
      
      let bestMatch: { result: any; similarity: number } | null = null;
      let bestSimilarity = 0;

      for (const entry of entries) {
        const similarity = this.calculateCosineSimilarity(queryEmbedding, entry.embedding);
        
        if (similarity > (threshold || this.config.similarityThreshold) && similarity > bestSimilarity) {
          bestMatch = {
            result: entry.value,
            similarity
          };
          bestSimilarity = similarity;
        }
      }

      if (bestMatch) {
        console.log(`🔍 Semantic cache hit: ${bestSimilarity.toFixed(3)} similarity`);
        return bestMatch;
      }

      return null;
    } catch (error) {
      console.error('Failed to find similar query:', error);
      return null;
    }
  }

  /**
   * Cache with semantic similarity
   */
  async cacheWithSemanticSimilarity(
    query: string,
    result: any,
    strategy: string,
    ttl?: number
  ): Promise<void> {
    try {
      const queryEmbedding = await this.embeddings.embedQuery(query);
      const semanticKey = this.generateSemanticCacheKey(strategy);
      
      const entry: SemanticCacheEntry = {
        key: `${semanticKey}:${Date.now()}`,
        value: result,
        timestamp: Date.now(),
        ttl: ttl || this.config.ttl,
        hitCount: 0,
        lastAccessed: Date.now(),
        embedding: queryEmbedding,
        query,
        similarity: 1.0, // Self-similarity
      };

      // Store in semantic cache
      await this.addToSemanticCache(semanticKey, entry);
      
      // Also store in regular cache
      await this.cacheRAGResult(query, result, strategy, ttl);
      
      console.log(`💾 Cached with semantic similarity: ${query.substring(0, 50)}...`);
    } catch (error) {
      console.error('Failed to cache with semantic similarity:', error);
    }
  }

  /**
   * Cache document embeddings
   */
  async cacheDocumentEmbeddings(
    documents: Document[],
    strategy: string
  ): Promise<void> {
    try {
      const embeddings = await this.embeddings.embedDocuments(
        documents.map(doc => doc.pageContent)
      );

      const cacheKey = `embeddings:${strategy}:${this.hashDocuments(documents)}`;
      const entry = {
        documents: documents.map(doc => ({
          pageContent: doc.pageContent,
          metadata: doc.metadata
        })),
        embeddings,
        timestamp: Date.now(),
      };

      await this.set(cacheKey, entry, this.config.ttl);
      console.log(`💾 Cached ${documents.length} document embeddings`);
    } catch (error) {
      console.error('Failed to cache document embeddings:', error);
    }
  }

  /**
   * Get cached document embeddings
   */
  async getCachedDocumentEmbeddings(
    documents: Document[],
    strategy: string
  ): Promise<{ documents: Document[]; embeddings: number[][] } | null> {
    try {
      const cacheKey = `embeddings:${strategy}:${this.hashDocuments(documents)}`;
      const entry = await this.get(cacheKey);
      
      if (entry) {
        return {
          documents: entry.documents.map((doc: any) => new Document(doc)),
          embeddings: entry.embeddings
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get cached document embeddings:', error);
      return null;
    }
  }

  /**
   * Cache LLM responses
   */
  async cacheLLMResponse(
    prompt: string,
    response: string,
    model: string,
    ttl?: number
  ): Promise<void> {
    try {
      const key = `llm:${model}:${this.hashString(prompt)}`;
      const entry: CacheEntry = {
        key,
        value: response,
        timestamp: Date.now(),
        ttl: ttl || this.config.ttl,
        hitCount: 0,
        lastAccessed: Date.now(),
      };

      await this.set(key, entry, ttl);
      console.log(`💾 Cached LLM response for model: ${model}`);
    } catch (error) {
      console.error('Failed to cache LLM response:', error);
    }
  }

  /**
   * Get cached LLM response
   */
  async getCachedLLMResponse(
    prompt: string,
    model: string
  ): Promise<string | null> {
    try {
      const key = `llm:${model}:${this.hashString(prompt)}`;
      const entry = await this.get(key);
      
      if (entry) {
        entry.hitCount++;
        entry.lastAccessed = Date.now();
        await this.set(key, entry, entry.ttl);
        
        console.log(`🎯 LLM cache hit for model: ${model}`);
        return entry.value;
      }

      return null;
    } catch (error) {
      console.error('Failed to get cached LLM response:', error);
      return null;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    hitRate: number;
    memoryUsage: string;
    topKeys: Array<{ key: string; hitCount: number }>;
  }> {
    try {
      if (this.upstash) {
        const info = await this.upstash.info();
        return {
          totalKeys: info.db0?.keys || 0,
          hitRate: 0, // Upstash doesn't provide hit rate
          memoryUsage: info.memory?.used_memory_human || 'Unknown',
          topKeys: []
        };
      }

      if (this.redis) {
        const info = await this.redis.info('memory');
        const keys = await this.redis.keys('*');
        
        return {
          totalKeys: keys.length,
          hitRate: 0, // Would need to track this separately
          memoryUsage: info.match(/used_memory_human:(\S+)/)?.[1] || 'Unknown',
          topKeys: []
        };
      }

      return {
        totalKeys: 0,
        hitRate: 0,
        memoryUsage: 'No Redis connection',
        topKeys: []
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalKeys: 0,
        hitRate: 0,
        memoryUsage: 'Error',
        topKeys: []
      };
    }
  }

  /**
   * Clear cache
   */
  async clearCache(pattern?: string): Promise<void> {
    try {
      if (this.upstash) {
        if (pattern) {
          const keys = await this.upstash.keys(pattern);
          if (keys.length > 0) {
            await this.upstash.del(...keys);
          }
        } else {
          await this.upstash.flushdb();
        }
      }

      if (this.redis) {
        if (pattern) {
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        } else {
          await this.redis.flushdb();
        }
      }

      console.log(`🧹 Cache cleared${pattern ? ` (pattern: ${pattern})` : ''}`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Private helper methods
  private async set(key: string, value: any, ttl?: number): Promise<void> {
    if (this.upstash) {
      await this.upstash.setex(key, ttl || this.config.ttl, JSON.stringify(value));
    } else if (this.redis) {
      await this.redis.setex(key, ttl || this.config.ttl, JSON.stringify(value));
    }
  }

  private async get(key: string): Promise<any> {
    if (this.upstash) {
      const value = await this.upstash.get(key);
      return value ? JSON.parse(value) : null;
    } else if (this.redis) {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  }

  private generateRAGCacheKey(query: string, strategy: string): string {
    return `rag:${strategy}:${this.hashString(query)}`;
  }

  private generateSemanticCacheKey(strategy: string): string {
    return `semantic:${strategy}`;
  }

  private async getSemanticCacheEntries(semanticKey: string): Promise<SemanticCacheEntry[]> {
    try {
      if (this.upstash) {
        const keys = await this.upstash.keys(`${semanticKey}:*`);
        const entries = await Promise.all(
          keys.map(key => this.get(key))
        );
        return entries.filter(entry => entry !== null);
      }

      if (this.redis) {
        const keys = await this.redis.keys(`${semanticKey}:*`);
        const entries = await Promise.all(
          keys.map(key => this.get(key))
        );
        return entries.filter(entry => entry !== null);
      }

      return [];
    } catch (error) {
      console.error('Failed to get semantic cache entries:', error);
      return [];
    }
  }

  private async addToSemanticCache(semanticKey: string, entry: SemanticCacheEntry): Promise<void> {
    await this.set(entry.key, entry, entry.ttl);
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private hashDocuments(documents: Document[]): string {
    const content = documents.map(doc => doc.pageContent).join('|');
    return this.hashString(content);
  }
}

// Singleton instance
export const redisCacheService = new RedisCacheService({
  ttl: 3600, // 1 hour
  maxSize: 10000,
  enableSemanticCaching: true,
  similarityThreshold: 0.85,
});

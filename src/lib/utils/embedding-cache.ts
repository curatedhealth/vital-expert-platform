/**
 * Embedding Cache for Performance Optimization
 * Reduces API calls and improves response times
 */

import { OpenAIEmbeddings } from '@langchain/openai';

export interface CachedEmbedding {
  embedding: number[];
  timestamp: number;
  ttl: number;
}

export class EmbeddingCache {
  private static instance: EmbeddingCache;
  private cache = new Map<string, CachedEmbedding>();
  private embeddings: OpenAIEmbeddings;
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'text-embedding-3-large',
    });
  }

  static getInstance(): EmbeddingCache {
    if (!EmbeddingCache.instance) {
      EmbeddingCache.instance = new EmbeddingCache();
    }
    return EmbeddingCache.instance;
  }

  /**
   * Get embedding with caching
   */
  async getEmbedding(text: string, ttl?: number): Promise<number[]> {
    const key = this.generateKey(text);
    const cached = this.cache.get(key);
    
    // Check if cached and still valid
    if (cached && this.isValid(cached)) {
      console.log(`📋 Cache hit for embedding: ${text.substring(0, 50)}...`);
      return cached.embedding;
    }

    // Generate new embedding
    console.log(`🔄 Generating new embedding: ${text.substring(0, 50)}...`);
    const embedding = await this.embeddings.embedQuery(text);
    
    // Cache the result
    this.cache.set(key, {
      embedding,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });

    return embedding;
  }

  /**
   * Batch get embeddings with caching
   */
  async getEmbeddings(texts: string[], ttl?: number): Promise<number[][]> {
    const results: number[][] = [];
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const key = this.generateKey(text);
      const cached = this.cache.get(key);
      
      if (cached && this.isValid(cached)) {
        results[i] = cached.embedding;
      } else {
        results[i] = null as any; // Placeholder
        uncachedTexts.push(text);
        uncachedIndices.push(i);
      }
    }

    // Generate embeddings for uncached texts
    if (uncachedTexts.length > 0) {
      console.log(`🔄 Generating ${uncachedTexts.length} new embeddings...`);
      const newEmbeddings = await this.embeddings.embedDocuments(uncachedTexts);
      
      // Cache and store results
      for (let i = 0; i < uncachedTexts.length; i++) {
        const text = uncachedTexts[i];
        const embedding = newEmbeddings[i];
        const originalIndex = uncachedIndices[i];
        
        results[originalIndex] = embedding;
        
        // Cache the result
        const key = this.generateKey(text);
        this.cache.set(key, {
          embedding,
          timestamp: Date.now(),
          ttl: ttl || this.DEFAULT_TTL
        });
      }
    }

    return results;
  }

  /**
   * Generate cache key for text
   */
  private generateKey(text: string): string {
    // Normalize text for consistent keys
    const normalized = text.toLowerCase().trim();
    return `embedding:${normalized}`;
  }

  /**
   * Check if cached embedding is still valid
   */
  private isValid(cached: CachedEmbedding): boolean {
    const now = Date.now();
    return (now - cached.timestamp) < cached.ttl;
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, cached] of this.cache.entries()) {
      if (!this.isValid(cached)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired embeddings from cache`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const now = Date.now();
    let oldest = now;
    let newest = 0;
    
    for (const cached of this.cache.values()) {
      oldest = Math.min(oldest, cached.timestamp);
      newest = Math.max(newest, cached.timestamp);
    }
    
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      oldestEntry: oldest === now ? 0 : now - oldest,
      newestEntry: newest === 0 ? 0 : now - newest
    };
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🧹 Cleared all embeddings from cache');
  }
}

// Singleton instance
export const embeddingCache = EmbeddingCache.getInstance();

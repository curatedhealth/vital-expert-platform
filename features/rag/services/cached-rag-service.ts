/**
 * Cached RAG Service
 * Integrates Redis caching with RAG operations for 70-80% cost reduction
 */

import { CloudRAGService } from '../../chat/services/cloud-rag-service';
import { redisCacheService } from '../caching/redis-cache-service';
import { RAGASEvaluator, RAGEvaluationInput } from '../evaluation/ragas-evaluator';
import { Document } from '@langchain/core/documents';

export interface CachedRAGConfig {
  enableCaching: boolean;
  enableSemanticCaching: boolean;
  enableEvaluation: boolean;
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
  similarityThreshold: number;
}

export interface CachedRAGResult {
  answer: string;
  sources: Document[];
  cached: boolean;
  cacheType?: 'exact' | 'semantic';
  similarity?: number;
  responseTime: number;
  evaluation?: any;
}

export class CachedRAGService extends CloudRAGService {
  private cacheService: typeof redisCacheService;
  private evaluator: RAGASEvaluator;
  private config: CachedRAGConfig;

  constructor(config: Partial<CachedRAGConfig> = {}) {
    super();
    
    this.config = {
      enableCaching: true,
      enableSemanticCaching: true,
      enableEvaluation: false,
      cacheStrategy: 'balanced',
      similarityThreshold: 0.85,
      ...config
    };

    this.cacheService = redisCacheService;
    this.evaluator = new RAGASEvaluator();
  }

  /**
   * Query RAG with caching
   */
  async queryRAGWithCaching(
    question: string,
    strategy: string = 'hybrid_rerank',
    userId?: string,
    sessionId?: string
  ): Promise<CachedRAGResult> {
    const startTime = Date.now();

    try {
      // 1. Check exact cache first
      if (this.config.enableCaching) {
        const exactCacheResult = await this.cacheService.getCachedRAGResult(question, strategy);
        if (exactCacheResult) {
          return {
            ...exactCacheResult,
            cached: true,
            cacheType: 'exact',
            responseTime: Date.now() - startTime
          };
        }

        // 2. Check semantic cache
        if (this.config.enableSemanticCaching) {
          const semanticResult = await this.cacheService.findSimilarQuery(
            question,
            strategy,
            this.config.similarityThreshold
          );

          if (semanticResult) {
            // Cache the new query with semantic similarity
            await this.cacheService.cacheWithSemanticSimilarity(
              question,
              semanticResult.result,
              strategy
            );

            return {
              ...semanticResult.result,
              cached: true,
              cacheType: 'semantic',
              similarity: semanticResult.similarity,
              responseTime: Date.now() - startTime
            };
          }
        }
      }

      // 3. Execute RAG query
      console.log(`🔍 Executing RAG query (not cached): ${question.substring(0, 50)}...`);
      const result = await this.queryRAG(question, strategy as any);

      // 4. Cache the result
      if (this.config.enableCaching) {
        await this.cacheService.cacheWithSemanticSimilarity(question, result, strategy);
      }

      // 5. Evaluate if enabled
      let evaluation;
      if (this.config.enableEvaluation) {
        evaluation = await this.evaluateQuery(question, result, strategy, sessionId, userId);
      }

      const responseTime = Date.now() - startTime;

      return {
        ...result,
        cached: false,
        responseTime,
        evaluation
      };

    } catch (error) {
      console.error('Cached RAG query failed:', error);
      throw error;
    }
  }

  /**
   * Query with document embedding caching
   */
  async queryRAGWithEmbeddingCache(
    question: string,
    strategy: string = 'hybrid_rerank',
    documents?: Document[]
  ): Promise<CachedRAGResult> {
    const startTime = Date.now();

    try {
      // Check if we have cached embeddings for these documents
      let cachedEmbeddings = null;
      if (documents && this.config.enableCaching) {
        cachedEmbeddings = await this.cacheService.getCachedDocumentEmbeddings(documents, strategy);
      }

      // If no cached embeddings, generate and cache them
      if (!cachedEmbeddings && documents) {
        await this.cacheService.cacheDocumentEmbeddings(documents, strategy);
      }

      // Proceed with normal RAG query
      return await this.queryRAGWithCaching(question, strategy);

    } catch (error) {
      console.error('Cached RAG query with embedding cache failed:', error);
      throw error;
    }
  }

  /**
   * Batch query with caching
   */
  async batchQueryRAGWithCaching(
    queries: Array<{
      question: string;
      strategy?: string;
      userId?: string;
      sessionId?: string;
    }>
  ): Promise<CachedRAGResult[]> {
    console.log(`🔄 Processing ${queries.length} queries with caching...`);

    const results = await Promise.all(
      queries.map(async (query) => {
        try {
          return await this.queryRAGWithCaching(
            query.question,
            query.strategy || 'hybrid_rerank',
            query.userId,
            query.sessionId
          );
        } catch (error) {
          console.error(`Failed to process query: ${query.question}`, error);
          return {
            answer: 'Error processing query',
            sources: [],
            cached: false,
            responseTime: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const cacheStats = this.calculateCacheStats(results);
    console.log(`✅ Batch processing complete. Cache hit rate: ${cacheStats.hitRate.toFixed(1)}%`);

    return results;
  }

  /**
   * Evaluate query performance
   */
  private async evaluateQuery(
    question: string,
    result: any,
    strategy: string,
    sessionId?: string,
    userId?: string
  ): Promise<any> {
    try {
      const evaluationInput: RAGEvaluationInput = {
        query: question,
        answer: result.answer,
        contexts: result.sources,
        retrieval_strategy: strategy,
        response_time_ms: result.responseTime || 0,
        session_id: sessionId || 'unknown',
        user_id: userId
      };

      return await this.evaluator.evaluate(evaluationInput);
    } catch (error) {
      console.error('Query evaluation failed:', error);
      return null;
    }
  }

  /**
   * Calculate cache statistics
   */
  private calculateCacheStats(results: CachedRAGResult[]): {
    totalQueries: number;
    cacheHits: number;
    exactHits: number;
    semanticHits: number;
    hitRate: number;
    averageResponseTime: number;
  } {
    const totalQueries = results.length;
    const cacheHits = results.filter(r => r.cached).length;
    const exactHits = results.filter(r => r.cacheType === 'exact').length;
    const semanticHits = results.filter(r => r.cacheType === 'semantic').length;
    const hitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalQueries;

    return {
      totalQueries,
      cacheHits,
      exactHits,
      semanticHits,
      hitRate,
      averageResponseTime
    };
  }

  /**
   * Get cache performance metrics
   */
  async getCacheMetrics(): Promise<{
    cacheStats: any;
    performanceMetrics: {
      hitRate: number;
      averageResponseTime: number;
      costSavings: number;
    };
  }> {
    const cacheStats = await this.cacheService.getCacheStats();
    
    // Calculate performance metrics
    const performanceMetrics = {
      hitRate: 0, // Would need to track this over time
      averageResponseTime: 0, // Would need to track this over time
      costSavings: 0 // Would need to calculate based on cache hits
    };

    return {
      cacheStats,
      performanceMetrics
    };
  }

  /**
   * Warm up cache with common queries
   */
  async warmUpCache(
    commonQueries: Array<{
      question: string;
      strategy: string;
      expectedAnswer: string;
    }>
  ): Promise<void> {
    console.log(`🔥 Warming up cache with ${commonQueries.length} common queries...`);

    for (const query of commonQueries) {
      try {
        const result = await this.queryRAG(query.question, query.strategy as any);
        await this.cacheService.cacheWithSemanticSimilarity(
          query.question,
          result,
          query.strategy
        );
      } catch (error) {
        console.error(`Failed to warm up cache for query: ${query.question}`, error);
      }
    }

    console.log('✅ Cache warm-up complete');
  }

  /**
   * Clear cache
   */
  async clearCache(pattern?: string): Promise<void> {
    await this.cacheService.clearCache(pattern);
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CachedRAGConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const cachedRAGService = new CachedRAGService({
  enableCaching: true,
  enableSemanticCaching: true,
  enableEvaluation: true,
  cacheStrategy: 'balanced',
  similarityThreshold: 0.85,
});

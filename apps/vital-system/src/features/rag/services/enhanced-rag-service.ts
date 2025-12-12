/**
 * Enhanced RAG Service
 * Integrates RAGAs evaluation, Redis caching, semantic chunking, and A/B testing
 */

import { Document } from '@langchain/core/documents';

import { CloudRAGService } from '../../chat/services/cloud-rag-service';
import { semanticChunkingService } from '../chunking/semantic-chunking-service';
import { RAGASEvaluator, RAGEvaluationInput } from '../evaluation/ragas-evaluator';
import { abTestingFramework, ABTestConfig } from '../testing/ab-testing-framework';

import { CachedRAGService } from './cached-rag-service';

export interface EnhancedRAGConfig {
  enableEvaluation: boolean;
  enableCaching: boolean;
  enableSemanticChunking: boolean;
  enableABTesting: boolean;
  chunkingStrategy: 'recursive' | 'semantic' | 'adaptive' | 'medical';
  evaluationStrategy: 'automatic' | 'manual' | 'batch';
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
}

export interface EnhancedRAGResult {
  answer: string;
  sources: Document[];
  metadata: {
    strategy: string;
    responseTime: number;
    cached: boolean;
    cacheType?: 'exact' | 'semantic';
    similarity?: number;
    evaluation?: any;
    chunkingInfo?: any;
  };
}

export class EnhancedRAGService {
  private cloudRAGService: CloudRAGService;
  private cachedRAGService: CachedRAGService;
  private evaluator: RAGASEvaluator;
  private config: EnhancedRAGConfig;

  constructor(config: Partial<EnhancedRAGConfig> = {}) {
    this.config = {
      enableEvaluation: true,
      enableCaching: true,
      enableSemanticChunking: true,
      enableABTesting: false,
      chunkingStrategy: 'adaptive',
      evaluationStrategy: 'automatic',
      cacheStrategy: 'balanced',
      ...config
    };

    this.cloudRAGService = new CloudRAGService();
    this.cachedRAGService = new CachedRAGService({
      enableCaching: this.config.enableCaching,
      enableSemanticCaching: true,
      enableEvaluation: this.config.enableEvaluation,
      cacheStrategy: this.config.cacheStrategy,
    });
    this.evaluator = new RAGASEvaluator();
  }

  /**
   * Query with all enhancements
   */
  async queryEnhanced(
    question: string,
    strategy: string = 'hybrid_rerank',
    userId?: string,
    sessionId?: string,
    options?: {
      enableEvaluation?: boolean;
      enableCaching?: boolean;
      chunkingStrategy?: string;
    }
  ): Promise<EnhancedRAGResult> {
    const startTime = Date.now();

    try {
      console.log(`🚀 Enhanced RAG query: ${question.substring(0, 50)}...`);

      // Use cached RAG service for better performance
      const result = await this.cachedRAGService.queryRAGWithCaching(
        question,
        strategy,
        userId,
        sessionId
      );

      // Add chunking information if semantic chunking is enabled
      let chunkingInfo;
      if (this.config.enableSemanticChunking && result.sources) {
        chunkingInfo = await this.analyzeChunking(result.sources);
      }

      const responseTime = Date.now() - startTime;

      return {
        answer: result.answer,
        sources: result.sources,
        metadata: {
          strategy,
          responseTime,
          cached: result.cached,
          cacheType: result.cacheType,
          similarity: result.similarity,
          evaluation: result.evaluation,
          chunkingInfo,
        },
      };

    } catch (error) {
      console.error('Enhanced RAG query failed:', error);
      throw error;
    }
  }

  /**
   * Batch query with enhancements
   */
  async batchQueryEnhanced(
    queries: Array<{
      question: string;
      strategy?: string;
      userId?: string;
      sessionId?: string;
    }>
  ): Promise<EnhancedRAGResult[]> {
    console.log(`🔄 Processing ${queries.length} enhanced queries...`);

    const results = await Promise.all(
      queries.map(async (query) => {
        try {
          return await this.queryEnhanced(
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
            metadata: {
              strategy: query.strategy || 'hybrid_rerank',
              responseTime: 0,
              cached: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          };
        }
      })
    );

    // Calculate batch statistics
    const stats = this.calculateBatchStats(results);
    console.log(`✅ Batch processing complete. Average response time: ${stats.averageResponseTime}ms`);

    return results;
  }

  /**
   * Create A/B test
   */
  async createABTest(testConfig: ABTestConfig): Promise<string> {
    if (!this.config.enableABTesting) {
      throw new Error('A/B testing is disabled');
    }

    return await abTestingFramework.createABTest(testConfig);
  }

  /**
   * Get A/B test results
   */
  async getABTestResults(testId: string): Promise<any> {
    if (!this.config.enableABTesting) {
      throw new Error('A/B testing is disabled');
    }

    return await abTestingFramework.getTestResults(testId);
  }

  /**
   * List A/B tests
   */
  async listABTests(): Promise<any[]> {
    if (!this.config.enableABTesting) {
      throw new Error('A/B testing is disabled');
    }

    return await abTestingFramework.listTests();
  }

  /**
   * Evaluate query performance
   */
  async evaluateQuery(
    question: string,
    answer: string,
    sources: Document[],
    strategy: string,
    sessionId?: string,
    userId?: string
  ): Promise<any> {
    if (!this.config.enableEvaluation) {
      return null;
    }

    try {
      const evaluationInput: RAGEvaluationInput = {
        query: question,
        answer,
        contexts: sources,
        retrieval_strategy: strategy,
        response_time_ms: 0,
        session_id: sessionId || 'unknown',
        user_id: userId,
      };

      return await this.evaluator.evaluate(evaluationInput);
    } catch (error) {
      console.error('Query evaluation failed:', error);
      return null;
    }
  }

  /**
   * Chunk documents with semantic chunking
   */
  async chunkDocuments(
    documents: Document[],
    strategy?: string
  ): Promise<{
    chunks: Document[];
    metadata: any;
  }> {
    if (!this.config.enableSemanticChunking) {
      // Fallback to basic chunking
      const splitter = new (await import('@langchain/textsplitters')).RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 300,
      });

      const chunks: Document[] = [];
      for (const doc of documents) {
        const docChunks = await splitter.splitDocuments([doc]);
        chunks.push(...docChunks);
      }

      return {
        chunks,
        metadata: {
          strategy: 'recursive',
          totalChunks: chunks.length,
          averageChunkSize: chunks.reduce((sum, chunk) => sum + chunk.pageContent.length, 0) / chunks.length,
        }
      };
    }

    return await semanticChunkingService.chunkDocuments(documents, strategy);
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    cacheMetrics: any;
    evaluationMetrics: any;
    chunkingMetrics: any;
  }> {
    const cacheMetrics = await this.cachedRAGService.getCacheMetrics();
    const chunkingMetrics = semanticChunkingService.getChunkingStats();

    return {
      cacheMetrics,
      evaluationMetrics: {}, // Would need to implement
      chunkingMetrics,
    };
  }

  /**
   * Warm up cache
   */
  async warmUpCache(commonQueries: Array<{
    question: string;
    strategy: string;
    expectedAnswer: string;
  }>): Promise<void> {
    await this.cachedRAGService.warmUpCache(commonQueries);
  }

  /**
   * Clear cache
   */
  async clearCache(pattern?: string): Promise<void> {
    await this.cachedRAGService.clearCache(pattern);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<EnhancedRAGConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update cached RAG service config
    this.cachedRAGService.updateConfig({
      enableCaching: this.config.enableCaching,
      enableSemanticCaching: true,
      enableEvaluation: this.config.enableEvaluation,
      cacheStrategy: this.config.cacheStrategy,
    });

    // Update chunking service config
    semanticChunkingService.updateConfig({
      strategy: this.config.chunkingStrategy as any,
    });
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      rag: 'healthy' | 'degraded' | 'unhealthy';
      cache: 'healthy' | 'degraded' | 'unhealthy';
      evaluation: 'healthy' | 'degraded' | 'unhealthy';
      chunking: 'healthy' | 'degraded' | 'unhealthy';
    };
    metrics: any;
  }> {
    try {
      const metrics = await this.getPerformanceMetrics();
      
      const components = {
        rag: 'healthy' as const,
        cache: metrics.cacheMetrics.cacheStats.totalKeys > 0 ? 'healthy' : 'degraded' as const,
        evaluation: 'healthy' as const,
        chunking: 'healthy' as const,
      };

      const unhealthyComponents = Object.values(components).filter(status => status === 'unhealthy').length;
      const degradedComponents = Object.values(components).filter(status => status === 'degraded').length;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (unhealthyComponents > 0) {
        status = 'unhealthy';
      } else if (degradedComponents > 0) {
        status = 'degraded';
      } else {
        status = 'healthy';
      }

      return {
        status,
        components,
        metrics,
      };
    } catch (error) {
      console.error('Failed to get system status:', error);
      return {
        status: 'unhealthy',
        components: {
          rag: 'unhealthy',
          cache: 'unhealthy',
          evaluation: 'unhealthy',
          chunking: 'unhealthy',
        },
        metrics: {},
      };
    }
  }

  // Private helper methods
  private async analyzeChunking(sources: Document[]): Promise<any> {
    try {
      const totalChunks = sources.length;
      const averageChunkSize = sources.reduce((sum, source) => sum + source.pageContent.length, 0) / totalChunks;
      const chunkSizes = sources.map((source: any) => source.pageContent.length);
      const minChunkSize = Math.min(...chunkSizes);
      const maxChunkSize = Math.max(...chunkSizes);

      return {
        totalChunks,
        averageChunkSize: Math.round(averageChunkSize),
        minChunkSize,
        maxChunkSize,
        sizeDistribution: this.calculateSizeDistribution(chunkSizes),
      };
    } catch (error) {
      console.error('Failed to analyze chunking:', error);
      return null;
    }
  }

  private calculateSizeDistribution(chunkSizes: number[]): {
    small: number; // < 1000
    medium: number; // 1000-2000
    large: number; // > 2000
  } {
    const distribution = { small: 0, medium: 0, large: 0 };
    
    chunkSizes.forEach(size => {
      if (size < 1000) distribution.small++;
      else if (size <= 2000) distribution.medium++;
      else distribution.large++;
    });

    return distribution;
  }

  private calculateBatchStats(results: EnhancedRAGResult[]): {
    totalQueries: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  } {
    const totalQueries = results.length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.metadata.responseTime, 0) / totalQueries;
    const cacheHits = results.filter((r: any) => r.metadata.cached).length;
    const cacheHitRate = (cacheHits / totalQueries) * 100;
    const errors = results.filter((r: any) => r.metadata.error).length;
    const errorRate = (errors / totalQueries) * 100;

    return {
      totalQueries,
      averageResponseTime: Math.round(averageResponseTime),
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }
}

// Export singleton instance
export const enhancedRAGService = new EnhancedRAGService({
  enableEvaluation: true,
  enableCaching: true,
  enableSemanticChunking: true,
  enableABTesting: true,
  chunkingStrategy: 'adaptive',
  evaluationStrategy: 'automatic',
  cacheStrategy: 'balanced',
});

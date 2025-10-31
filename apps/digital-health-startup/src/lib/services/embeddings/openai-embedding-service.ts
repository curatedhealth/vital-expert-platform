/**
 * OpenAI Embedding Service
 * Production-ready service for generating embeddings via Python AI Engine through API Gateway
 * 
 * This service now calls Python AI Engine via API Gateway to comply with the Golden Rule:
 * All AI/ML services must be in Python and accessed via API Gateway.
 */

import { withRetry } from '../resilience/retry';
import { CircuitBreaker } from '../resilience/circuit-breaker';
import { createLogger } from '../observability/structured-logger';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  model: string;
  totalTokens: number;
}

export interface EmbeddingServiceConfig {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
  batchSize?: number;
}

export class OpenAIEmbeddingService {
  private apiGatewayUrl: string;
  private model: string;
  private batchSize: number;
  private cache: Map<string, EmbeddingResult>;
  private circuitBreaker: CircuitBreaker;
  private logger: ReturnType<typeof createLogger>;

  constructor(config: EmbeddingServiceConfig = {}) {
    // Get API Gateway URL from environment
    this.apiGatewayUrl = 
      process.env.API_GATEWAY_URL || 
      process.env.NEXT_PUBLIC_API_GATEWAY_URL || 
      'http://localhost:3001';

    this.model = config.model || 'text-embedding-3-large';
    this.batchSize = config.batchSize || 100;
    this.cache = new Map();

    // Initialize circuit breaker for API Gateway calls
    this.circuitBreaker = new CircuitBreaker('embedding-service', {
      timeout: config.timeout || 30000,
      errorThresholdPercentage: 50,
      resetTimeout: 60000,
    });

    this.logger = createLogger();

    console.log(`✅ OpenAI Embedding Service initialized (via API Gateway: ${this.apiGatewayUrl})`);
    console.log(`   Model: ${this.model}`);
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(
    text: string,
    options: {
      useCache?: boolean;
      dimensions?: number;
    } = {}
  ): Promise<EmbeddingResult> {
    const { useCache = true, dimensions } = options;

    // Validate input
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Check cache
    const cacheKey = this.getCacheKey(text, dimensions);
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      console.log('📦 Using cached embedding');
      return cached;
    }

    // Clean and truncate text if needed
    const cleanedText = this.cleanText(text);
    const truncatedText = this.truncateText(cleanedText, 8000); // OpenAI max tokens ~8191

    try {
      console.log(`🔄 Generating embedding via API Gateway (${truncatedText.length} chars)...`);

      // Generate request ID for tracing
      const requestId = `embedding_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Call Python AI Engine via API Gateway with retry and circuit breaker
      const embeddingResponse = await withRetry(
        () => this.circuitBreaker.execute(async () => {
          const response = await fetch(`${this.apiGatewayUrl}/api/embeddings/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-request-id': requestId,
            },
            body: JSON.stringify({
              text: truncatedText,
              model: this.model,
              provider: 'openai',
              dimensions: dimensions,
              normalize: true,
            }),
            signal: AbortSignal.timeout(30000), // 30 second timeout
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`API Gateway error: ${errorData.message || response.statusText} (status: ${response.status})`);
          }

          return await response.json();
        }),
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          maxDelayMs: 10000,
          retryable: (error) => {
            // Retry on network errors, timeouts, and 5xx errors
            const message = error.message.toLowerCase();
            return (
              message.includes('timeout') ||
              message.includes('econnrefused') ||
              message.includes('econnreset') ||
              message.includes('network') ||
              message.includes('503') ||
              message.includes('502') ||
              message.includes('500') ||
              message.includes('rate limit') ||
              message.includes('429')
            );
          },
          onRetry: (attempt, error) => {
            this.logger.warn('embedding_retry', {
              attempt,
              error: error.message,
              requestId,
            });
          },
        }
      );

      const result: EmbeddingResult = {
        embedding: embeddingResponse.embedding,
        model: embeddingResponse.model,
        usage: {
          prompt_tokens: embeddingResponse.usage?.prompt_tokens || Math.ceil(truncatedText.length / 4),
          total_tokens: embeddingResponse.usage?.total_tokens || Math.ceil(truncatedText.length / 4),
        },
      };

      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, result);
      }

      this.logger.info('embedding_generated', {
        requestId,
        dimensions: result.embedding.length,
        model: result.model,
        tokens: result.usage.total_tokens,
      });

      console.log(`✅ Embedding generated (${result.embedding.length} dimensions, ${result.usage.total_tokens} tokens)`);

      return result;

    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);

      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('circuit breaker')) {
          throw new Error('Embedding service temporarily unavailable. Please try again later.');
        }
      }

      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate embeddings for multiple texts in batches
   */
  async generateBatchEmbeddings(
    texts: string[],
    options: {
      useCache?: boolean;
      dimensions?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<BatchEmbeddingResult> {
    const { useCache = true, dimensions, onProgress } = options;

    if (!texts || texts.length === 0) {
      throw new Error('Texts array cannot be empty');
    }

    console.log(`🔄 Generating embeddings for ${texts.length} texts in batches of ${this.batchSize}...`);

    const allEmbeddings: number[][] = [];
    let totalTokens = 0;
    let completed = 0;

    // Process in batches
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const cleanedBatch = batch.map(text => this.truncateText(this.cleanText(text), 8000));

      try {
        // Generate request ID for tracing
        const requestId = `batch_embedding_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Call Python AI Engine via API Gateway
        const batchResponse = await withRetry(
          () => this.circuitBreaker.execute(async () => {
            const response = await fetch(`${this.apiGatewayUrl}/api/embeddings/generate/batch`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-request-id': requestId,
              },
              body: JSON.stringify({
                texts: cleanedBatch,
                model: this.model,
                provider: 'openai',
                normalize: true,
              }),
              signal: AbortSignal.timeout(60000), // 60 second timeout for batch
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: response.statusText }));
              throw new Error(`API Gateway error: ${errorData.message || response.statusText} (status: ${response.status})`);
            }

            return await response.json();
          }),
          {
            maxRetries: 3,
            initialDelayMs: 1000,
            maxDelayMs: 10000,
            retryable: (error) => {
              const message = error.message.toLowerCase();
              return (
                message.includes('timeout') ||
                message.includes('econnrefused') ||
                message.includes('503') ||
                message.includes('502') ||
                message.includes('500') ||
                message.includes('429')
              );
            },
          }
        );

        // Extract embeddings
        const batchEmbeddings = batchResponse.embeddings || [];

        allEmbeddings.push(...batchEmbeddings);
        totalTokens += batchResponse.usage?.total_tokens || cleanedBatch.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0);
        completed += batch.length;

        // Cache individual results if enabled
        if (useCache) {
          batch.forEach((text, idx) => {
            const cacheKey = this.getCacheKey(text, dimensions);
            this.cache.set(cacheKey, {
              embedding: batchEmbeddings[idx],
              model: batchResponse.model,
              usage: {
                prompt_tokens: Math.floor((batchResponse.usage?.prompt_tokens || cleanedBatch[idx].length / 4) / batch.length),
                total_tokens: Math.floor((batchResponse.usage?.total_tokens || cleanedBatch[idx].length / 4) / batch.length),
              },
            });
          });
        }

        // Report progress
        if (onProgress) {
          onProgress(completed, texts.length);
        }

        console.log(`  ✅ Batch ${Math.floor(i / this.batchSize) + 1} completed (${completed}/${texts.length})`);

        // Rate limiting: wait 1 second between batches
        if (i + this.batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`❌ Failed to process batch ${Math.floor(i / this.batchSize) + 1}:`, error);
        throw error;
      }
    }

    console.log(`✅ All embeddings generated (${totalTokens} total tokens)`);

    return {
      embeddings: allEmbeddings,
      model: this.model,
      totalTokens,
    };
  }

  /**
   * Generate embeddings for query (typically shorter than documents)
   */
  async generateQueryEmbedding(query: string, dimensions?: number): Promise<number[]> {
    const result = await this.generateEmbedding(query, { dimensions });
    return result.embedding;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Find most similar embeddings from a list
   */
  findMostSimilar(
    queryEmbedding: number[],
    candidateEmbeddings: Array<{ id: string; embedding: number[]; metadata?: any }>,
    topK: number = 5
  ): Array<{ id: string; similarity: number; metadata?: any }> {
    const similarities = candidateEmbeddings.map(candidate => ({
      id: candidate.id,
      similarity: this.calculateSimilarity(queryEmbedding, candidate.embedding),
      metadata: candidate.metadata,
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Embedding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()).slice(0, 10), // First 10 keys
    };
  }

  /**
   * Test connection to API Gateway and Python AI Engine
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generateEmbedding('test', { useCache: false });
      console.log('✅ Embedding service connection successful (via API Gateway)');
      return true;
    } catch (error) {
      console.error('❌ Embedding service connection failed:', error);
      return false;
    }
  }

  /**
   * Get supported models
   */
  getSupportedModels(): string[] {
    return [
      'text-embedding-3-large',  // 3072 dimensions, best quality
      'text-embedding-3-small',  // 1536 dimensions, faster
      'text-embedding-ada-002',  // 1536 dimensions, legacy
    ];
  }

  /**
   * Get current model info
   */
  getModelInfo(): {
    model: string;
    dimensions: number;
    maxTokens: number;
  } {
    const dimensionMap: Record<string, number> = {
      'text-embedding-3-large': 3072,
      'text-embedding-3-small': 1536,
      'text-embedding-ada-002': 1536,
    };

    return {
      model: this.model,
      dimensions: dimensionMap[this.model] || 1536,
      maxTokens: 8191,
    };
  }

  // Private helper methods

  private getCacheKey(text: string, dimensions?: number): string {
    const normalizedText = text.trim().toLowerCase().slice(0, 100);
    return `${normalizedText}-${dimensions || 'default'}`;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')  // Remove control characters
      .trim();
  }

  private truncateText(text: string, maxChars: number): string {
    if (text.length <= maxChars) {
      return text;
    }

    console.warn(`⚠️ Text truncated from ${text.length} to ${maxChars} characters`);
    return text.slice(0, maxChars) + '...';
  }

  /**
   * Estimate token count (approximate)
   */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Estimate cost for embedding generation
   */
  estimateCost(texts: string[]): {
    estimatedTokens: number;
    estimatedCost: number;
    currency: string;
  } {
    const totalChars = texts.reduce((sum, text) => sum + text.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4);

    // Pricing per 1M tokens (as of 2025)
    const pricePerMillion: Record<string, number> = {
      'text-embedding-3-large': 0.13,
      'text-embedding-3-small': 0.02,
      'text-embedding-ada-002': 0.10,
    };

    const pricePerToken = (pricePerMillion[this.model] || 0.10) / 1_000_000;
    const estimatedCost = estimatedTokens * pricePerToken;

    return {
      estimatedTokens,
      estimatedCost,
      currency: 'USD',
    };
  }
}

// Singleton instance
let embeddingServiceInstance: OpenAIEmbeddingService | null = null;

export function getEmbeddingService(config?: EmbeddingServiceConfig): OpenAIEmbeddingService {
  if (!embeddingServiceInstance) {
    embeddingServiceInstance = new OpenAIEmbeddingService(config);
  }
  return embeddingServiceInstance;
}

// Export singleton
export const embeddingService = getEmbeddingService();

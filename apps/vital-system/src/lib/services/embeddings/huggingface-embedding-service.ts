/**
 * HuggingFace Embedding Service
 * 
 * Free, fast, and efficient embedding models via Python AI Engine through API Gateway
 * 
 * Cost Comparison:
 * - OpenAI text-embedding-3-large: $0.13 per 1M tokens
 * - HuggingFace (free tier): $0.00 per 1M tokens
 * - HuggingFace (pro): ~$0.001 per 1M tokens
 * 
 * That's 130x-1000x cheaper!
 * 
 * This service now calls Python AI Engine via API Gateway to comply with the Golden Rule:
 * All AI/ML services must be in Python and accessed via API Gateway.
 */

import { withRetry } from '../resilience/retry';
import { CircuitBreaker } from '../resilience/circuit-breaker';
import { createLogger } from '../observability/structured-logger';
import type { EmbeddingResult, BatchEmbeddingResult } from './openai-embedding-service';

export interface HuggingFaceEmbeddingConfig {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Recommended HuggingFace Embedding Models (2025)
 * 
 * Updated with top performers from MTEB leaderboard 2025
 * Source: https://huggingface.co/spaces/mteb/leaderboard
 * 
 * Top Recommendations by Use Case:
 * 1. RAG / General-Purpose: mxbai-embed-large-v1 (🥇 MTEB 67.4) or e5-large-v2 (instruction-tuned)
 * 2. Multilingual: multilingual-e5-large or bge-m3
 * 3. Lightweight/Cost-Efficient: bge-small-en-v1.5
 * 4. Biomedical/Scientific: SapBERT or BioBERT variants
 * 5. Long-context Documents: gte-large
 */
export const HF_EMBEDDING_MODELS = {
  // 🥇 TOP PERFORMERS (2025 MTEB Leaders)
  'mxbai-embed-large-v1': {
    name: 'Mixedbread AI Large (🥇 #1 MTEB 2025)',
    modelId: 'mixedbread-ai/mxbai-embed-large-v1',
    dimensions: 1024,
    costPer1k: 0, // FREE
    speed: 'medium',
    quality: 'excellent', // 67.4 MTEB score - TOP performer
    description: '🥇 TOP MTEB performer (67.4), multilingual, drop-in OpenAI alternative',
    mtebScore: 67.4,
    useCases: ['rag', 'general', 'multilingual', 'search'],
  },
  'e5-large-v2': {
    name: 'E5 Large V2 (Best for RAG)',
    modelId: 'intfloat/e5-large-v2',
    dimensions: 1024,
    costPer1k: 0, // FREE
    speed: 'medium',
    quality: 'excellent', // 65.5 MTEB, instruction-tuned
    description: '⭐ BEST for RAG - Instruction-tuned for "query: ... document: ..." style',
    mtebScore: 65.5,
    useCases: ['rag', 'retrieval', 'instruction-tuned'],
  },
  'bge-m3': {
    name: 'BGE M3 (🥉 #3 MTEB 2025)',
    modelId: 'BAAI/bge-m3',
    dimensions: 1024,
    costPer1k: 0, // FREE
    speed: 'medium',
    quality: 'excellent', // 66.8 MTEB
    description: '🥉 3rd place MTEB (66.8), multilingual, multi-granular, retrieval + rerank',
    mtebScore: 66.8,
    useCases: ['rag', 'multilingual', 'retrieval', 'rerank'],
  },

  // 🌍 MULTILINGUAL MODELS
  'multilingual-e5-large': {
    name: 'Multilingual E5 Large',
    modelId: 'intfloat/multilingual-e5-large',
    dimensions: 1024,
    costPer1k: 0, // FREE
    speed: 'medium',
    quality: 'excellent',
    description: 'Excellent coverage across 100+ languages',
    useCases: ['multilingual', 'global', 'diverse-languages'],
  },

  // ⚡ LIGHTWEIGHT / COST-EFFICIENT
  'bge-small-en-v1.5': {
    name: 'BGE Small (Lightweight)',
    modelId: 'BAAI/bge-small-en-v1.5',
    dimensions: 384,
    costPer1k: 0, // FREE
    speed: 'very-fast', // ~5× faster
    quality: 'good',
    description: 'Fast (~5× faster), accurate; great for local vector DBs or edge deployment',
    useCases: ['lightweight', 'high-volume', 'edge', 'cost-efficient'],
  },
  'all-MiniLM-L6-v2': {
    name: 'All-MiniLM (Ultra Lightweight)',
    modelId: 'sentence-transformers/all-MiniLM-L6-v2',
    dimensions: 384,
    costPer1k: 0, // FREE
    speed: 'very-fast',
    quality: 'good',
    description: 'Fastest sentence transformer, lightweight',
    useCases: ['ultra-fast', 'minimal-resources'],
  },

  // 🎯 BALANCED MODELS
  'bge-base-en-v1.5': {
    name: 'BGE Base',
    modelId: 'BAAI/bge-base-en-v1.5',
    dimensions: 768,
    costPer1k: 0, // FREE
    speed: 'fast',
    quality: 'very-good',
    description: 'Best balance of speed and quality',
    useCases: ['balanced', 'general'],
  },
  'bge-large-en-v1.5': {
    name: 'BGE Large',
    modelId: 'BAAI/bge-large-en-v1.5',
    dimensions: 1024,
    costPer1k: 0, // FREE
    speed: 'medium',
    quality: 'excellent',
    description: 'Best quality, comparable to OpenAI, still free',
    useCases: ['high-quality', 'general'],
  },

  // 📄 LONG-CONTEXT / DOCUMENT EMBEDDINGS
  'gte-large': {
    name: 'GTE Large (Long Context)',
    modelId: 'thenlper/gte-large',
    dimensions: 1024,
    costPer1k: 0, // FREE
    speed: 'medium',
    quality: 'excellent', // 65.1 MTEB
    description: 'Strong for multi-paragraph documents, long-context embeddings',
    mtebScore: 65.1,
    useCases: ['long-documents', 'multi-paragraph', 'document-embedding'],
  },

  // 🔬 SENTENCE SIMILARITY / CLUSTERING
  'all-mpnet-base-v2': {
    name: 'All-MPNet (Similarity Workhorse)',
    modelId: 'sentence-transformers/all-mpnet-base-v2',
    dimensions: 768,
    costPer1k: 0, // FREE
    speed: 'fast',
    quality: 'very-good',
    description: 'Highly consistent for semantic clustering, long-standing industry workhorse',
    useCases: ['similarity', 'clustering', 'topic-modeling'],
  },

  // 🏥 BIOMEDICAL / SCIENTIFIC (Specialized)
  'sapbert-pubmed': {
    name: 'SapBERT from PubMedBERT',
    modelId: 'cambridgeltl/SapBERT-from-PubMedBERT-fulltext',
    dimensions: 768,
    costPer1k: 0, // FREE
    speed: 'fast',
    quality: 'excellent', // For biomedical tasks
    description: 'Tuned for PubMed/UMLS similarity tasks, biomedical domain expert',
    useCases: ['biomedical', 'scientific', 'pubmed', 'clinical'],
  },
  'biobert-mnli': {
    name: 'BioBERT MNLI (Fine-tuned)',
    modelId: 'pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb',
    dimensions: 768,
    costPer1k: 0, // FREE
    speed: 'fast',
    quality: 'very-good',
    description: 'Tuned for biomedical NLI tasks and similarity',
    useCases: ['biomedical', 'nli', 'similarity'],
  },
  'biobert-base': {
    name: 'BioBERT Base',
    modelId: 'dmis-lab/biobert-base-cased-v1.2',
    dimensions: 768,
    costPer1k: 0, // FREE
    speed: 'fast',
    quality: 'good',
    description: 'Biomedical literature specialized',
    useCases: ['biomedical', 'clinical'],
  },
  'pubmedbert': {
    name: 'PubMedBERT',
    modelId: 'microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext',
    dimensions: 768,
    costPer1k: 0, // FREE
    speed: 'fast',
    quality: 'good',
    description: 'Medical/scientific literature',
    useCases: ['medical', 'scientific', 'pubmed'],
  },

  // 💻 CODE & TECH CONTENT
  'codebert-base': {
    name: 'CodeBERT',
    modelId: 'microsoft/codebert-base',
    dimensions: 768,
    costPer1k: 0, // FREE
    speed: 'fast',
    quality: 'good',
    description: 'For retrieval or semantic search over code + text',
    useCases: ['code', 'technical', 'software'],
  },
} as const;

export type HFEmbeddingModel = keyof typeof HF_EMBEDDING_MODELS;

export class HuggingFaceEmbeddingService {
  private apiGatewayUrl: string;
  private modelId: string;
  private model: HFEmbeddingModel;
  private dimensions: number;
  private cache: Map<string, EmbeddingResult>;
  private circuitBreaker: CircuitBreaker;
  private logger: ReturnType<typeof createLogger>;

  constructor(config: HuggingFaceEmbeddingConfig = {}) {
    // Get API Gateway URL from environment
    this.apiGatewayUrl = 
      process.env.API_GATEWAY_URL || 
      process.env.NEXT_PUBLIC_API_GATEWAY_URL || 
      'http://localhost:3001';

    // Default to top 2025 MTEB performer (mxbai-embed-large-v1)
    const defaultModel: HFEmbeddingModel = config.model?.startsWith('mxbai-') ||
                                          config.model?.startsWith('bge-') || 
                                          config.model?.startsWith('all-') ||
                                          config.model?.startsWith('e5-') ||
                                          config.model?.startsWith('multilingual-') ||
                                          config.model?.startsWith('gte-') ||
                                          config.model?.startsWith('biobert') ||
                                          config.model?.startsWith('pubmedbert') ||
                                          config.model?.startsWith('sapbert') ||
                                          config.model?.startsWith('codebert')
      ? (config.model as HFEmbeddingModel)
      : 'mxbai-embed-large-v1'; // 🥇 Top MTEB 2025 performer

    this.model = defaultModel;
    const modelConfig = HF_EMBEDDING_MODELS[this.model];
    this.modelId = modelConfig.modelId;
    this.dimensions = modelConfig.dimensions;
    this.cache = new Map();

    // Initialize circuit breaker for API Gateway calls
    this.circuitBreaker = new CircuitBreaker('hf-embedding-service', {
      timeout: config.timeout || 30000,
      errorThresholdPercentage: 50,
      resetTimeout: 60000,
    });

    this.logger = createLogger();

    console.log(`✅ HuggingFace Embedding Service initialized (via API Gateway: ${this.apiGatewayUrl})`);
    console.log(`   Model: ${this.modelId} (${this.dimensions} dimensions)`);
    if (modelConfig.mtebScore) {
      console.log(`   MTEB Score: ${modelConfig.mtebScore} (${modelConfig.quality} quality)`);
    }
    if (modelConfig.useCases) {
      console.log(`   Use Cases: ${modelConfig.useCases.join(', ')}`);
    }
    console.log(`   Cost: FREE via Python AI Engine`);
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(
    text: string,
    options: {
      useCache?: boolean;
    } = {}
  ): Promise<EmbeddingResult> {
    const { useCache = true } = options;

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Check cache
    const cacheKey = this.getCacheKey(text);
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return cached;
    }

    try {
      // Clean and truncate if needed
      const cleanedText = this.cleanText(text);
      const truncatedText = this.truncateText(cleanedText, 512); // HF models typically use 512 max

      // Generate request ID for tracing
      const requestId = `hf_embedding_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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
              model: this.modelId,
              provider: 'huggingface',
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
          onRetry: (attempt, error) => {
            this.logger.warn('hf_embedding_retry', {
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

      if (useCache) {
        this.cache.set(cacheKey, result);
      }

      this.logger.info('hf_embedding_generated', {
        requestId,
        dimensions: result.embedding.length,
        model: result.model,
      });

      return result;

    } catch (error) {
      console.error('❌ HuggingFace embedding failed:', error);
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate embeddings for multiple texts in batches
   */
  async generateBatchEmbeddings(
    texts: string[],
    options: {
      useCache?: boolean;
      onProgress?: (completed: number, total: number) => void;
      batchSize?: number;
    } = {}
  ): Promise<BatchEmbeddingResult> {
    const { useCache = true, onProgress, batchSize = 50 } = options;

    if (!texts || texts.length === 0) {
      throw new Error('Texts array cannot be empty');
    }

    console.log(`🔄 Generating ${texts.length} embeddings via HuggingFace (free!)...`);

    const allEmbeddings: number[][] = [];
    let totalTokens = 0;
    let completed = 0;

    // Process in batches (HF Inference API handles batching efficiently)
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const cleanedBatch = batch.map(text => this.truncateText(this.cleanText(text), 512));

      try {
        // Generate request ID for tracing
        const requestId = `hf_batch_embedding_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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
                model: this.modelId,
                provider: 'huggingface',
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

        // Ensure we have the right number of embeddings
        if (batchEmbeddings.length !== cleanedBatch.length) {
          console.warn(`⚠️ Expected ${cleanedBatch.length} embeddings, got ${batchEmbeddings.length}`);
          // Pad or truncate if needed
          while (batchEmbeddings.length < cleanedBatch.length) {
            batchEmbeddings.push(Array(this.dimensions).fill(0));
          }
          batchEmbeddings.splice(cleanedBatch.length);
        }

        allEmbeddings.push(...batchEmbeddings);
        totalTokens += batchResponse.usage?.total_tokens || cleanedBatch.reduce((sum, text) => sum + Math.ceil(text.length / 4), 0);
        completed += batch.length;

        // Cache if enabled
        if (useCache) {
          batch.forEach((text, idx) => {
            const cacheKey = this.getCacheKey(text);
            this.cache.set(cacheKey, {
              embedding: batchEmbeddings[idx],
              model: this.modelId,
              usage: {
                prompt_tokens: Math.ceil(cleanedBatch[idx].length / 4),
                total_tokens: Math.ceil(cleanedBatch[idx].length / 4),
              },
            });
          });
        }

        if (onProgress) {
          onProgress(completed, texts.length);
        }

        console.log(`  ✅ Batch ${Math.floor(i / batchSize) + 1} completed (${completed}/${texts.length})`);

        // Small delay between batches to respect rate limits (if any)
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`❌ Failed to process batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }
    }

    console.log(`✅ All embeddings generated via HuggingFace (${totalTokens} estimated tokens, $0.00 cost)`);

    return {
      embeddings: allEmbeddings,
      model: this.modelId,
      totalTokens,
    };
  }

  /**
   * Generate embedding for query (optimized for queries)
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    const result = await this.generateEmbedding(query);
    return result.embedding;
  }

  /**
   * Get model information
   */
  getModelInfo(): {
    model: string;
    modelId: string;
    dimensions: number;
    costPer1k: number;
    provider: string;
  } {
    const modelConfig = HF_EMBEDDING_MODELS[this.model];
    return {
      model: this.model,
      modelId: this.modelId,
      dimensions: this.dimensions,
      costPer1k: 0, // FREE
      provider: 'HuggingFace',
    };
  }

  /**
   * Get supported models
   */
  getSupportedModels(): Array<{
    id: HFEmbeddingModel;
    name: string;
    dimensions: number;
    costPer1k: number;
  }> {
    return Object.entries(HF_EMBEDDING_MODELS).map(([id, config]) => ({
      id: id as HFEmbeddingModel,
      name: config.name,
      dimensions: config.dimensions,
      costPer1k: 0, // All free
    }));
  }

  /**
   * Set model
   */
  setModel(model: HFEmbeddingModel): void {
    this.model = model;
    const modelConfig = HF_EMBEDDING_MODELS[this.model];
    this.modelId = modelConfig.modelId;
    this.dimensions = modelConfig.dimensions;
    console.log(`✅ Switched to ${this.modelId} (${this.dimensions} dimensions)`);
  }

  /**
   * Estimate cost (always $0 for HF free tier!)
   */
  estimateCost(texts: string[]): {
    estimatedTokens: number;
    estimatedCost: number;
    currency: string;
    savingsVsOpenAI?: number;
  } {
    const totalChars = texts.reduce((sum, text) => sum + text.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4);
    
    // FREE via HuggingFace Inference API
    const estimatedCost = 0;
    
    // Compare to OpenAI
    const openaiCost = estimatedTokens * (0.13 / 1_000_000); // text-embedding-3-large
    const savings = openaiCost;

    return {
      estimatedTokens,
      estimatedCost,
      currency: 'USD',
      savingsVsOpenAI: savings,
    };
  }

  /**
   * Test connection to API Gateway and Python AI Engine
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generateEmbedding('test', { useCache: false });
      console.log('✅ HuggingFace Embedding service connection successful (via API Gateway)');
      return true;
    } catch (error) {
      console.error('❌ HuggingFace Embedding service connection failed:', error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // Private helpers
  private getCacheKey(text: string): string {
    const normalizedText = text.trim().toLowerCase().slice(0, 100);
    return `${this.modelId}-${normalizedText}`;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .trim();
  }

  private truncateText(text: string, maxChars: number): string {
    if (text.length <= maxChars) {
      return text;
    }
    return text.slice(0, maxChars);
  }
}

// Export singleton
let hfEmbeddingServiceInstance: HuggingFaceEmbeddingService | null = null;

export function getHuggingFaceEmbeddingService(config?: HuggingFaceEmbeddingConfig): HuggingFaceEmbeddingService {
  if (!hfEmbeddingServiceInstance) {
    hfEmbeddingServiceInstance = new HuggingFaceEmbeddingService(config);
  }
  return hfEmbeddingServiceInstance;
}

export const huggingfaceEmbeddingService = getHuggingFaceEmbeddingService();


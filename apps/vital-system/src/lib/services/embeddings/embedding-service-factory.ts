/**
 * Embedding Service Factory
 * 
 * Allows easy switching between OpenAI and HuggingFace embedding providers
 * 
 * Cost Comparison (for 1M tokens):
 * - OpenAI text-embedding-3-large: $0.13
 * - HuggingFace (free): $0.00
 * 
 * Savings: 100% (FREE!)
 */

import { OpenAIEmbeddingService, type EmbeddingResult, type BatchEmbeddingResult } from './openai-embedding-service';
import { HuggingFaceEmbeddingService, type HFEmbeddingModel } from './huggingface-embedding-service';
import { getEmbeddingModelForDomain } from './domain-embedding-selector';

export type EmbeddingProvider = 'openai' | 'huggingface';

export interface EmbeddingServiceConfig {
  provider?: EmbeddingProvider;
  model?: string;
  apiKey?: string;
  domain?: string; // Knowledge domain - will auto-select best model
}

export interface IEmbeddingService {
  generateEmbedding(text: string, options?: any): Promise<EmbeddingResult>;
  generateBatchEmbeddings(texts: string[], options?: any): Promise<BatchEmbeddingResult>;
  generateQueryEmbedding(query: string, dimensions?: number): Promise<number[]>;
  getModelInfo(): any;
  estimateCost(texts: string[]): any;
}

export class EmbeddingServiceFactory {
  /**
   * Create embedding service based on configuration
   * 
   * Default behavior:
   * - Uses OPENAI_API_KEY if available → OpenAI
   * - Uses HUGGINGFACE_API_KEY if available → HuggingFace
   * - Environment variable EMBEDDING_PROVIDER can override
   */
  static create(config: EmbeddingServiceConfig = {}): IEmbeddingService {
    const provider = config.provider || 
                    (process.env.EMBEDDING_PROVIDER as EmbeddingProvider) ||
                    this.detectProvider();

    switch (provider) {
      case 'huggingface':
        // Auto-select best model for domain if not specified
        let model = config.model as HFEmbeddingModel | undefined;
        if (!model && config.domain) {
          model = getEmbeddingModelForDomain(config.domain);
          console.log(`🎯 Auto-selected model "${model}" for domain "${config.domain}"`);
        }
        
        console.log('✅ Using HuggingFace embeddings (FREE!)');
        return new HuggingFaceEmbeddingService({
          apiKey: config.apiKey,
          model: model,
        });

      case 'openai':
      default:
        console.log('✅ Using OpenAI embeddings');
        return new OpenAIEmbeddingService({
          apiKey: config.apiKey,
          model: config.model,
        });
    }
  }

  /**
   * Detect which provider to use based on available API keys
   */
  private static detectProvider(): EmbeddingProvider {
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key';
    const hasHuggingFace = process.env.HUGGINGFACE_API_KEY;

    // Prefer HuggingFace if available (it's FREE!)
    if (hasHuggingFace) {
      return 'huggingface';
    }

    if (hasOpenAI) {
      return 'openai';
    }

    // Default fallback
    console.warn('⚠️ No embedding API keys found, defaulting to HuggingFace (free tier might work)');
    return 'huggingface';
  }

  /**
   * Get cost comparison
   */
  static getCostComparison() {
    return {
      openai: {
        model: 'text-embedding-3-large',
        costPer1M: 0.13,
        dimensions: 3072,
        speed: 'fast',
      },
      huggingface: {
        model: 'bge-base-en-v1.5',
        costPer1M: 0.00, // FREE
        dimensions: 768,
        speed: 'very-fast',
        savings: '100%',
      },
    };
  }
}

// Export default service instance
let defaultService: IEmbeddingService | null = null;

export function getEmbeddingService(config?: EmbeddingServiceConfig): IEmbeddingService {
  if (!defaultService) {
    defaultService = EmbeddingServiceFactory.create(config);
  }
  return defaultService;
}

export const embeddingService = getEmbeddingService();


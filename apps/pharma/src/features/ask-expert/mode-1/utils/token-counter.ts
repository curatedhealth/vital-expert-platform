/**
 * Token Counter Utility
 * 
 * Provides accurate token counting for different LLM models
 * Supports OpenAI (tiktoken) and Anthropic tokenizers
 * Includes Redis caching for fast repeated calculations
 */

import { get, set, createKey, TTL } from '../../../../lib/cache/redis';
import * as crypto from 'crypto';

export interface TokenCountResult {
  promptTokens: number;
  completionTokens?: number;
  totalTokens: number;
}

export interface ModelConfig {
  maxTokens: number;
  modelType: 'openai' | 'anthropic' | 'generic';
}

/**
 * Default token limits by model
 */
export const MODEL_TOKEN_LIMITS: Record<string, ModelConfig> = {
  // OpenAI models
  'gpt-4-turbo-preview': { maxTokens: 128000, modelType: 'openai' },
  'gpt-4': { maxTokens: 8192, modelType: 'openai' },
  'gpt-4-32k': { maxTokens: 32768, modelType: 'openai' },
  'gpt-3.5-turbo': { maxTokens: 16385, modelType: 'openai' },
  'gpt-3.5-turbo-16k': { maxTokens: 16385, modelType: 'openai' },
  
  // Anthropic models
  'claude-3-opus': { maxTokens: 200000, modelType: 'anthropic' },
  'claude-3-sonnet': { maxTokens: 200000, modelType: 'anthropic' },
  'claude-3-haiku': { maxTokens: 200000, modelType: 'anthropic' },
  'claude-2': { maxTokens: 100000, modelType: 'anthropic' },
  'claude-2.1': { maxTokens: 200000, modelType: 'anthropic' },
  
  // Default fallback
  'default': { maxTokens: 8000, modelType: 'generic' },
};

/**
 * Token Counter Class
 */
export class TokenCounter {
  private modelConfig: ModelConfig;
  private model: string;

  constructor(model?: string) {
    this.model = model || 'default';
    this.modelConfig = MODEL_TOKEN_LIMITS[this.model] || MODEL_TOKEN_LIMITS['default'];
  }

  /**
   * Generate cache key for token count
   */
  private generateCacheKey(text: string): string {
    // Create hash of text + model (same text + model = same token count)
    const textHash = crypto
      .createHash('sha256')
      .update(`${this.model}:${text}`)
      .digest('hex')
      .substring(0, 16);
    
    return createKey('tokens', `${this.model}:${textHash}`);
  }

  /**
   * Count tokens in text with caching
   * Uses accurate tokenization when available, falls back to estimation
   */
  async countTokens(text: string): Promise<number> {
    if (!text || text.length === 0) {
      return 0;
    }

    // Check cache first (24 hour TTL - token counts are stable)
    const cacheKey = this.generateCacheKey(text);
    const cached = await get<number>(cacheKey);
    
    if (cached !== null && typeof cached === 'number') {
      return cached;
    }

    let tokenCount: number;

    try {
      // Try to use accurate tokenizer based on model type
      if (this.modelConfig.modelType === 'openai') {
        tokenCount = await this.countTokensOpenAI(text);
      } else if (this.modelConfig.modelType === 'anthropic') {
        tokenCount = await this.countTokensAnthropic(text);
      } else {
        // Fallback to estimation
        tokenCount = this.estimateTokens(text);
      }
    } catch (error) {
      console.warn(`[TokenCounter] Failed to use accurate tokenizer, falling back to estimation:`, error);
      // Fallback to estimation
      tokenCount = this.estimateTokens(text);
    }

    // Cache result for 24 hours (token counts don't change)
    // Note: Cache failures are non-blocking - we still return the result
    set(cacheKey, tokenCount, TTL.DAY).catch((error) => {
      console.warn(`[TokenCounter] Failed to cache token count:`, error);
    });

    return tokenCount;
  }

  /**
   * Count tokens using OpenAI's tiktoken (when available)
   */
  private async countTokensOpenAI(text: string): Promise<number> {
    // Note: tiktoken is optional dependency
    // Falls back to estimation if not installed (safe for build)
    try {
      // Dynamic import with runtime check to avoid build-time analysis
      if (typeof window === 'undefined') {
        const tiktokenModule = await import('tiktoken').catch(() => null);
        if (tiktokenModule && typeof tiktokenModule.encoding_for_model === 'function') {
          const encoding = tiktokenModule.encoding_for_model(
            this.modelConfig.modelType === 'openai' ? 'gpt-3.5-turbo' : 'gpt-4'
          );
          return encoding.encode(text).length;
        }
      }
    } catch {
      // tiktoken not available, use estimation
    }
    // Fallback to estimation
    return this.estimateTokens(text);
  }

  /**
   * Count tokens using Anthropic tokenizer (when available)
   */
  private async countTokensAnthropic(text: string): Promise<number> {
    // Note: @anthropic-ai/tokenizer is optional dependency
    // Falls back to estimation if not installed (safe for build)
    try {
      // Dynamic import with runtime check to avoid build-time analysis
      if (typeof window === 'undefined') {
        const tokenizerModule = await import('@anthropic-ai/tokenizer').catch(() => null);
        if (tokenizerModule && typeof tokenizerModule.countTokens === 'function') {
          return tokenizerModule.countTokens(text);
        }
      }
    } catch {
      // Anthropic tokenizer not available, use estimation
    }
    // Fallback to estimation
    return this.estimateTokens(text);
  }

  /**
   * Estimate tokens using character-based approximation
   * Rough estimate: ~4 characters per token for English text
   */
  private estimateTokens(text: string): number {
    // More accurate estimation considering:
    // - Punctuation and special chars: ~1 token per char
    // - Spaces: ~0.25 tokens
    // - Words: ~0.75 tokens per word
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const nonWordChars = (text.match(/[^\w\s]/g) || []).length;
    const spaces = text.split(/\s+/).length - 1;
    
    // Better estimation
    const wordTokens = words.length * 0.75;
    const charTokens = nonWordChars * 1;
    const spaceTokens = spaces * 0.25;
    
    return Math.ceil(wordTokens + charTokens + spaceTokens);
  }

  /**
   * Get max tokens for current model
   */
  getMaxTokens(): number {
    return this.modelConfig.maxTokens;
  }

  /**
   * Get recommended context limit (75% of max for headroom)
   */
  getContextLimit(): number {
    return Math.floor(this.modelConfig.maxTokens * 0.75);
  }

  /**
   * Check if text exceeds limit
   */
  async exceedsLimit(text: string): Promise<boolean> {
    const tokens = await this.countTokens(text);
    return tokens > this.getContextLimit();
  }

  /**
   * Count tokens for multiple texts
   */
  async countMultiple(texts: string[]): Promise<number> {
    const counts = await Promise.all(texts.map(text => this.countTokens(text)));
    return counts.reduce((sum, count) => sum + count, 0);
  }
}

/**
 * Convenience function to count tokens
 */
export async function countTokens(text: string, model?: string): Promise<number> {
  const counter = new TokenCounter(model);
  return counter.countTokens(text);
}

/**
 * Convenience function to get max tokens for a model
 */
export function getMaxTokens(model?: string): number {
  const counter = new TokenCounter(model);
  return counter.getMaxTokens();
}

/**
 * Convenience function to get context limit for a model
 */
export function getContextLimit(model?: string): number {
  const counter = new TokenCounter(model);
  return counter.getContextLimit();
}


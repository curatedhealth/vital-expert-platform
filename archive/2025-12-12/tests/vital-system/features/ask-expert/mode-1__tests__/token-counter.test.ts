/**
 * Token Counter Tests
 * 
 * Tests token counting for different LLM models with fallback estimation
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  TokenCounter,
  MODEL_TOKEN_LIMITS,
  getContextLimit,
  getMaxTokens,
  countTokens as countTokensFn,
} from '../utils/token-counter';

describe('TokenCounter', () => {
  describe('Constructor', () => {
    it('should use default config when no model specified', () => {
      const counter = new TokenCounter();
      expect(counter.getMaxTokens()).toBe(MODEL_TOKEN_LIMITS.default.maxTokens);
    });

    it('should use model-specific config when model specified', () => {
      const counter = new TokenCounter('gpt-4');
      expect(counter.getMaxTokens()).toBe(MODEL_TOKEN_LIMITS['gpt-4'].maxTokens);
    });

    it('should fallback to default for unknown model', () => {
      const counter = new TokenCounter('unknown-model-xyz');
      expect(counter.getMaxTokens()).toBe(MODEL_TOKEN_LIMITS.default.maxTokens);
    });
  });

  describe('countTokens', () => {
    it('should return 0 for empty string', async () => {
      const counter = new TokenCounter();
      const count = await counter.countTokens('');
      expect(count).toBe(0);
    });

    it('should return 0 for null/undefined', async () => {
      const counter = new TokenCounter();
      // @ts-expect-error - Testing edge case
      const count1 = await counter.countTokens(null);
      expect(count1).toBe(0);
    });

    it('should estimate tokens for OpenAI model', async () => {
      const counter = new TokenCounter('gpt-4');
      const text = 'This is a test string with multiple words.';
      const count = await counter.countTokens(text);
      
      // Estimation: ~1 token per 4 characters for English
      // "This is a test string with multiple words." = ~40 chars = ~10 tokens
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(text.length);
    });

    it('should estimate tokens for Anthropic model', async () => {
      const counter = new TokenCounter('claude-3-opus');
      const text = 'This is a test string for Claude.';
      const count = await counter.countTokens(text);
      
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(text.length);
    });

    it('should estimate tokens for generic model', async () => {
      const counter = new TokenCounter('unknown-model');
      const text = 'This is a test.';
      const count = await counter.countTokens(text);
      
      expect(count).toBeGreaterThan(0);
    });

    it('should handle long text correctly', async () => {
      const counter = new TokenCounter();
      const longText = 'word '.repeat(1000); // ~5000 characters
      const count = await counter.countTokens(longText);
      
      expect(count).toBeGreaterThan(100);
      expect(count).toBeLessThan(2000);
    });

    it('should handle text with special characters', async () => {
      const counter = new TokenCounter();
      const text = 'Hello! How are you? I\'m fine. #hashtag @mention $currency';
      const count = await counter.countTokens(text);
      
      expect(count).toBeGreaterThan(0);
    });

    it('should handle multiline text', async () => {
      const counter = new TokenCounter();
      const text = `Line 1
Line 2
Line 3
Multiple lines of text.`;
      const count = await counter.countTokens(text);
      
      expect(count).toBeGreaterThan(0);
    });

    it('should fallback to estimation when tokenizer unavailable', async () => {
      // Mock missing tokenizer (default behavior)
      const counter = new TokenCounter('gpt-4');
      const text = 'Test text';
      const count = await counter.countTokens(text);
      
      // Should use estimation fallback
      expect(count).toBeGreaterThan(0);
      expect(typeof count).toBe('number');
    });
  });

  describe('estimateTokens (via countTokens)', () => {
    it('should estimate tokens for English text', async () => {
      const counter = new TokenCounter();
      const text = 'This is a simple sentence.';
      const count = await counter.countTokens(text);
      
      // Rough estimation: ~1 token per word
      expect(count).toBeGreaterThanOrEqual(text.split(' ').length - 2);
      expect(count).toBeLessThanOrEqual(text.split(' ').length + 5);
    });

    it('should estimate more tokens for longer text', async () => {
      const counter = new TokenCounter();
      const short = 'Short text.';
      const long = 'word '.repeat(100);
      
      const shortCount = await counter.countTokens(short);
      const longCount = await counter.countTokens(long);
      
      expect(longCount).toBeGreaterThan(shortCount);
    });

    it('should handle punctuation correctly', async () => {
      const counter = new TokenCounter();
      const text = 'Hello, world! How are you?';
      const count = await counter.countTokens(text);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getContextLimit', () => {
    it('should return 75% of max tokens', () => {
      const counter = new TokenCounter('gpt-4');
      const contextLimit = counter.getContextLimit();
      const maxTokens = counter.getMaxTokens();
      
      expect(contextLimit).toBe(Math.floor(maxTokens * 0.75));
      expect(contextLimit).toBeLessThan(maxTokens);
    });

    it('should return different limits for different models', () => {
      const gpt4Counter = new TokenCounter('gpt-4');
      const claudeCounter = new TokenCounter('claude-3-opus');
      
      expect(claudeCounter.getContextLimit()).toBeGreaterThan(gpt4Counter.getContextLimit());
    });
  });

  describe('exceedsLimit', () => {
    it('should return false for short text', async () => {
      const counter = new TokenCounter('gpt-4');
      const result = await counter.exceedsLimit('Short text');
      expect(result).toBe(false);
    });

    it('should return true for text exceeding limit', async () => {
      const counter = new TokenCounter('gpt-4'); // 8192 max, ~6144 context limit
      const veryLongText = 'word '.repeat(10000); // Way over limit
      const result = await counter.exceedsLimit(veryLongText);
      expect(result).toBe(true);
    });
  });

  describe('countMultiple', () => {
    it('should count tokens for multiple texts', async () => {
      const counter = new TokenCounter();
      const texts = ['First text', 'Second text', 'Third text'];
      const total = await counter.countMultiple(texts);
      
      expect(total).toBeGreaterThan(0);
      
      // Should be sum of individual counts
      const individual = await Promise.all(texts.map(t => counter.countTokens(t)));
      const sum = individual.reduce((a, b) => a + b, 0);
      expect(total).toBe(sum);
    });

    it('should handle empty array', async () => {
      const counter = new TokenCounter();
      const total = await counter.countMultiple([]);
      expect(total).toBe(0);
    });

    it('should handle single text array', async () => {
      const counter = new TokenCounter();
      const total = await counter.countMultiple(['Single text']);
      expect(total).toBeGreaterThan(0);
    });
  });

  describe('Convenience Functions', () => {
    it('countTokens function should work', async () => {
      const count = await countTokensFn('Test text');
      expect(count).toBeGreaterThan(0);
    });

    it('getMaxTokens function should work', () => {
      const max = getMaxTokens('gpt-4');
      expect(max).toBe(8192);
    });

    it('getContextLimit function should work', () => {
      const limit = getContextLimit('gpt-4');
      expect(limit).toBe(Math.floor(8192 * 0.75));
    });
  });

  describe('getContextLimit (utility function)', () => {
    it('should return 75% of max tokens for known OpenAI model', () => {
      const limit = getContextLimit('gpt-4-turbo-preview');
      const maxTokens = MODEL_TOKEN_LIMITS['gpt-4-turbo-preview'].maxTokens;
      expect(limit).toBe(Math.floor(maxTokens * 0.75));
    });

    it('should return 75% of max tokens for known Anthropic model', () => {
      const limit = getContextLimit('claude-3-opus');
      const maxTokens = MODEL_TOKEN_LIMITS['claude-3-opus'].maxTokens;
      expect(limit).toBe(Math.floor(maxTokens * 0.75));
    });

    it('should return 75% of default limit for unknown model', () => {
      const limit = getContextLimit('unknown-model');
      const maxTokens = MODEL_TOKEN_LIMITS.default.maxTokens;
      expect(limit).toBe(Math.floor(maxTokens * 0.75));
    });

    it('should return 75% of default limit when model is undefined', () => {
      const limit = getContextLimit();
      const maxTokens = MODEL_TOKEN_LIMITS.default.maxTokens;
      expect(limit).toBe(Math.floor(maxTokens * 0.75));
    });
  });

  describe('getMaxTokens', () => {
    it('should return max tokens for configured model', () => {
      const counter = new TokenCounter('gpt-4');
      expect(counter.getMaxTokens()).toBe(8192);
    });

    it('should return max tokens for default', () => {
      const counter = new TokenCounter();
      expect(counter.getMaxTokens()).toBe(MODEL_TOKEN_LIMITS.default.maxTokens);
    });
  });

  describe('Model Token Limits', () => {
    it('should have defined limits for all known models', () => {
      expect(MODEL_TOKEN_LIMITS['gpt-4-turbo-preview'].maxTokens).toBe(128000);
      expect(MODEL_TOKEN_LIMITS['gpt-4'].maxTokens).toBe(8192);
      expect(MODEL_TOKEN_LIMITS['claude-3-opus'].maxTokens).toBe(200000);
      expect(MODEL_TOKEN_LIMITS['claude-3-sonnet'].maxTokens).toBe(200000);
    });

    it('should have correct model types', () => {
      expect(MODEL_TOKEN_LIMITS['gpt-4'].modelType).toBe('openai');
      expect(MODEL_TOKEN_LIMITS['claude-3-opus'].modelType).toBe('anthropic');
      expect(MODEL_TOKEN_LIMITS.default.modelType).toBe('generic');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long strings', async () => {
      const counter = new TokenCounter();
      const veryLongText = 'a '.repeat(100000); // 200k characters
      const count = await counter.countTokens(veryLongText);
      
      expect(count).toBeGreaterThan(0);
      expect(Number.isFinite(count)).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const counter = new TokenCounter();
      const text = 'Hello 世界 مرحبا Здравствуй';
      const count = await counter.countTokens(text);
      
      expect(count).toBeGreaterThan(0);
    });

    it('should handle mixed content', async () => {
      const counter = new TokenCounter();
      const text = 'Text with numbers: 12345 and symbols: @#$%';
      const count = await counter.countTokens(text);
      
      expect(count).toBeGreaterThan(0);
    });
  });
});


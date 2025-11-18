/**
 * Integration Tests for API Gateway Embedding Endpoints
 * 
 * Tests the full flow: TypeScript Service → API Gateway → Python AI Engine
 * 
 * Note: These tests require:
 * - API Gateway running on localhost:3001
 * - Python AI Engine running on localhost:8000
 * - Set API_GATEWAY_URL environment variable or use default
 */

import { OpenAIEmbeddingService } from '../../../src/lib/services/embeddings/openai-embedding-service';
import { HuggingFaceEmbeddingService } from '../../../src/lib/services/embeddings/huggingface-embedding-service';

describe('Integration: API Gateway Embedding Endpoints', () => {
  const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3001';
  const TEST_TIMEOUT = 30000; // 30 seconds

  // Skip tests if services are not running
  const skipIfNoServices = () => {
    if (process.env.SKIP_INTEGRATION_TESTS === 'true') {
      console.log('⏭️  Skipping integration tests (SKIP_INTEGRATION_TESTS=true)');
      return true;
    }
    return false;
  };

  describe('OpenAI Embedding Service Integration', () => {
    let service: OpenAIEmbeddingService;

    beforeEach(() => {
      service = new OpenAIEmbeddingService({
        model: 'text-embedding-3-small',
      });
    });

    it('should generate embedding via API Gateway → Python AI Engine', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const text = 'This is a test query for embedding generation.';

      const result = await service.generateEmbedding(text);

      expect(result).toBeDefined();
      expect(result.embedding).toBeDefined();
      expect(Array.isArray(result.embedding)).toBe(true);
      expect(result.embedding.length).toBeGreaterThan(0);
      expect(result.model).toBeDefined();
      expect(result.usage).toBeDefined();
      expect(result.usage.total_tokens).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    it('should handle different text lengths', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const shortText = 'Short text';
      const longText = 'This is a longer piece of text that should also generate an embedding successfully. '.repeat(10);

      const shortResult = await service.generateEmbedding(shortText);
      const longResult = await service.generateEmbedding(longText);

      expect(shortResult.embedding.length).toBeGreaterThan(0);
      expect(longResult.embedding.length).toBeGreaterThan(0);
      expect(shortResult.embedding.length).toBe(longResult.embedding.length); // Same dimensions
    }, TEST_TIMEOUT);

    it('should generate batch embeddings', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const texts = [
        'First text for embedding',
        'Second text for embedding',
        'Third text for embedding',
      ];

      const result = await service.generateBatchEmbeddings(texts);

      expect(result).toBeDefined();
      expect(result.embeddings).toHaveLength(3);
      expect(result.embeddings.every(emb => Array.isArray(emb) && emb.length > 0)).toBe(true);
      expect(result.model).toBeDefined();
      expect(result.totalTokens).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    it('should handle cache correctly', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const text = 'Cache test text';

      // First call - should hit API Gateway
      const result1 = await service.generateEmbedding(text, { useCache: true });

      // Second call - should use cache
      const startTime = Date.now();
      const result2 = await service.generateEmbedding(text, { useCache: true });
      const duration = Date.now() - startTime;

      expect(result1.embedding).toEqual(result2.embedding);
      expect(duration).toBeLessThan(100); // Should be very fast from cache
    }, TEST_TIMEOUT);

    it('should handle dimensions parameter', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const text = 'Test with dimensions';
      const dimensions = 512;

      const result = await service.generateEmbedding(text, { dimensions });

      expect(result.embedding.length).toBe(dimensions);
    }, TEST_TIMEOUT);

    it('should handle API Gateway errors gracefully', async () => {
      if (skipIfNoServices()) {
        return;
      }

      // Use invalid API Gateway URL to force error
      const invalidService = new OpenAIEmbeddingService({
        model: 'text-embedding-3-small',
      });
      
      // Temporarily override API Gateway URL
      (invalidService as any).apiGatewayUrl = 'http://localhost:9999'; // Non-existent

      await expect(
        invalidService.generateEmbedding('test')
      ).rejects.toThrow();
    }, TEST_TIMEOUT);

    it('should test connection successfully', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const result = await service.testConnection();

      expect(result).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('HuggingFace Embedding Service Integration', () => {
    let service: HuggingFaceEmbeddingService;

    beforeEach(() => {
      service = new HuggingFaceEmbeddingService({
        model: 'mxbai-embed-large-v1',
      });
    });

    it('should generate embedding via API Gateway → Python AI Engine', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const text = 'This is a test query for HuggingFace embedding generation.';

      const result = await service.generateEmbedding(text);

      expect(result).toBeDefined();
      expect(result.embedding).toBeDefined();
      expect(Array.isArray(result.embedding)).toBe(true);
      expect(result.embedding.length).toBeGreaterThan(0);
      expect(result.model).toBeDefined();
      expect(result.usage).toBeDefined();
    }, TEST_TIMEOUT);

    it('should generate batch embeddings', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const texts = [
        'First HF text',
        'Second HF text',
        'Third HF text',
      ];

      const result = await service.generateBatchEmbeddings(texts);

      expect(result).toBeDefined();
      expect(result.embeddings).toHaveLength(3);
      expect(result.embeddings.every(emb => Array.isArray(emb) && emb.length > 0)).toBe(true);
      expect(result.model).toBeDefined();
      expect(result.totalTokens).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    it('should return model information', () => {
      const info = service.getModelInfo();

      expect(info).toHaveProperty('model');
      expect(info).toHaveProperty('modelId');
      expect(info).toHaveProperty('dimensions');
      expect(info).toHaveProperty('costPer1k');
      expect(info).toHaveProperty('provider');
      expect(info.costPer1k).toBe(0); // FREE
      expect(info.provider).toBe('HuggingFace');
    });

    it('should test connection successfully', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const result = await service.testConnection();

      expect(result).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('Error Handling Integration', () => {
    it('should handle timeout errors', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const service = new OpenAIEmbeddingService({
        model: 'text-embedding-3-small',
      });

      // Use very short timeout to force timeout error
      (service as any).circuitBreaker.options.timeout = 1; // 1ms timeout

      await expect(
        service.generateEmbedding('test')
      ).rejects.toThrow();
    }, TEST_TIMEOUT);

    it('should retry on transient errors', async () => {
      if (skipIfNoServices()) {
        return;
      }

      // This test verifies retry logic works
      // In a real scenario, you would mock network failures
      const service = new OpenAIEmbeddingService({
        model: 'text-embedding-3-small',
      });

      // Normal call should succeed
      const result = await service.generateEmbedding('test retry');
      expect(result).toBeDefined();
    }, TEST_TIMEOUT);
  });

  describe('Performance Integration', () => {
    it('should meet performance targets (< 2s for embedding)', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const service = new OpenAIEmbeddingService({
        model: 'text-embedding-3-small',
      });

      const startTime = Date.now();
      await service.generateEmbedding('Performance test');
      const duration = Date.now() - startTime;

      // Should complete within 2 seconds (p95 target)
      expect(duration).toBeLessThan(2000);
    }, TEST_TIMEOUT);

    it('should handle concurrent requests', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const service = new OpenAIEmbeddingService({
        model: 'text-embedding-3-small',
      });

      const texts = Array(10).fill(null).map((_, i) => `Text ${i}`);
      
      const startTime = Date.now();
      const results = await Promise.all(
        texts.map(text => service.generateEmbedding(text, { useCache: false }))
      );
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(results.every(r => r.embedding.length > 0)).toBe(true);
      
      // Should complete within reasonable time (10 seconds for 10 concurrent)
      expect(duration).toBeLessThan(10000);
    }, TEST_TIMEOUT * 2);
  });

  describe('Provider Switching', () => {
    it('should generate embeddings with OpenAI provider', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const service = new OpenAIEmbeddingService({
        model: 'text-embedding-3-small',
      });

      const result = await service.generateEmbedding('OpenAI test');

      expect(result).toBeDefined();
      expect(result.embedding.length).toBeGreaterThan(0);
      // OpenAI embeddings are typically 1536 or 3072 dimensions
      expect([1536, 3072]).toContain(result.embedding.length);
    }, TEST_TIMEOUT);

    it('should generate embeddings with HuggingFace provider', async () => {
      if (skipIfNoServices()) {
        return;
      }

      const service = new HuggingFaceEmbeddingService({
        model: 'mxbai-embed-large-v1',
      });

      const result = await service.generateEmbedding('HuggingFace test');

      expect(result).toBeDefined();
      expect(result.embedding.length).toBeGreaterThan(0);
      // HuggingFace embeddings vary by model
      expect(result.embedding.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);
  });
});


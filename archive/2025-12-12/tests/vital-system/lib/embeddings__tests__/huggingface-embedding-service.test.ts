/**
 * Unit Tests for HuggingFace Embedding Service
 * 
 * Tests the migrated service that calls Python AI Engine via API Gateway
 */

import { HuggingFaceEmbeddingService } from '../huggingface-embedding-service';
import { withRetry } from '../../resilience/retry';
import { CircuitBreaker } from '../../resilience/circuit-breaker';

// Mock dependencies
jest.mock('../../resilience/retry');
jest.mock('../../resilience/circuit-breaker');
jest.mock('../../observability/structured-logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('HuggingFaceEmbeddingService', () => {
  let service: HuggingFaceEmbeddingService;
  let mockCircuitBreaker: jest.Mocked<CircuitBreaker>;
  const mockApiGatewayUrl = 'http://localhost:3001';
  const mockEmbedding = Array(1024).fill(0).map((_, i) => i * 0.001);
  const mockResponse = {
    embedding: mockEmbedding,
    model: 'mixedbread-ai/mxbai-embed-large-v1',
    dimensions: 1024,
    provider: 'huggingface',
    usage: {
      prompt_tokens: 10,
      total_tokens: 10,
    },
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup environment
    process.env.API_GATEWAY_URL = mockApiGatewayUrl;

    // Mock circuit breaker
    mockCircuitBreaker = {
      execute: jest.fn(),
      getState: jest.fn(),
      reset: jest.fn(),
      getStats: jest.fn(),
    } as any;

    // Mock CircuitBreaker constructor
    (CircuitBreaker as jest.MockedClass<typeof CircuitBreaker>).mockImplementation(() => {
      return mockCircuitBreaker;
    });

    // Mock withRetry to pass through the function
    (withRetry as jest.Mock).mockImplementation(async (fn, options) => {
      // Execute the function passed to withRetry
      const circuitBreakerFn = await fn();
      return circuitBreakerFn;
    });

    // Mock circuit breaker execute to pass through
    mockCircuitBreaker.execute.mockImplementation(async (fn) => {
      return await fn();
    });

    // Create service
    service = new HuggingFaceEmbeddingService({
      model: 'mxbai-embed-large-v1',
    });

    // Default successful fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
  });

  afterEach(() => {
    delete process.env.API_GATEWAY_URL;
  });

  describe('generateEmbedding', () => {
    it('should generate embedding via API Gateway successfully', async () => {
      const text = 'test text';
      
      const result = await service.generateEmbedding(text);

      expect(result).toBeDefined();
      expect(result.embedding).toEqual(mockEmbedding);
      expect(result.model).toBe('mixedbread-ai/mxbai-embed-large-v1');
      expect(result.usage.total_tokens).toBe(10);

      // Verify API Gateway call
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiGatewayUrl}/api/embeddings/generate`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            text: 'test text',
            model: 'mixedbread-ai/mxbai-embed-large-v1',
            provider: 'huggingface',
            normalize: true,
          }),
        })
      );

      // Verify circuit breaker was used
      expect(mockCircuitBreaker.execute).toHaveBeenCalled();
      expect(withRetry).toHaveBeenCalled();
    });

    it('should use cache if available', async () => {
      const text = 'cached text';
      
      // First call
      await service.generateEmbedding(text, { useCache: true });
      
      // Second call should use cache
      const result = await service.generateEmbedding(text, { useCache: true });

      expect(result).toBeDefined();
      expect(result.embedding).toEqual(mockEmbedding);
      
      // Should only call API Gateway once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error on empty text', async () => {
      await expect(service.generateEmbedding('')).rejects.toThrow('Text cannot be empty');
      await expect(service.generateEmbedding('   ')).rejects.toThrow('Text cannot be empty');
    });

    it('should handle API Gateway errors', async () => {
      const text = 'test text';
      
      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'AI Engine error' }),
      });

      await expect(service.generateEmbedding(text)).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should truncate text if too long', async () => {
      const longText = 'a'.repeat(1000);
      
      await service.generateEmbedding(longText);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.text.length).toBeLessThanOrEqual(512);
    });

    it('should clean text before sending', async () => {
      const textWithControlChars = 'test\x00text\x1Fwith\x7Fchars';
      
      await service.generateEmbedding(textWithControlChars);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body.text).not.toContain('\x00');
      expect(body.text).not.toContain('\x1F');
      expect(body.text).not.toContain('\x7F');
    });
  });

  describe('generateBatchEmbeddings', () => {
    const mockBatchResponse = {
      embeddings: [
        Array(1024).fill(0).map((_, i) => i * 0.001),
        Array(1024).fill(0).map((_, i) => i * 0.002),
      ],
      model: 'mixedbread-ai/mxbai-embed-large-v1',
      dimensions: 1024,
      provider: 'huggingface',
      usage: {
        prompt_tokens: 20,
        total_tokens: 20,
      },
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBatchResponse,
      });
    });

    it('should generate batch embeddings via API Gateway', async () => {
      const texts = ['text 1', 'text 2'];
      
      const result = await service.generateBatchEmbeddings(texts);

      expect(result).toBeDefined();
      expect(result.embeddings).toHaveLength(2);
      expect(result.model).toBe('mixedbread-ai/mxbai-embed-large-v1');
      expect(result.totalTokens).toBe(20);

      // Verify API Gateway call
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiGatewayUrl}/api/embeddings/generate/batch`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            texts: ['text 1', 'text 2'],
            model: 'mixedbread-ai/mxbai-embed-large-v1',
            provider: 'huggingface',
            normalize: true,
          }),
        })
      );
    });

    it('should handle empty texts array', async () => {
      await expect(service.generateBatchEmbeddings([])).rejects.toThrow(
        'Texts array cannot be empty'
      );
    });

    it('should process large batches in chunks', async () => {
      // Set batch size to 2
      service = new HuggingFaceEmbeddingService({
        model: 'mxbai-embed-large-v1',
        batchSize: 2,
      });
      mockCircuitBreaker.execute.mockImplementation(async (fn) => await fn());

      const texts = ['text 1', 'text 2', 'text 3', 'text 4', 'text 5'];
      
      await service.generateBatchEmbeddings(texts, { batchSize: 2 });

      // Should make 3 batch calls (2, 2, 1)
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle mismatched embedding count', async () => {
      const mismatchedResponse = {
        embeddings: [
          Array(1024).fill(0).map((_, i) => i * 0.001),
          // Missing second embedding
        ],
        model: 'mixedbread-ai/mxbai-embed-large-v1',
        dimensions: 1024,
        provider: 'huggingface',
        usage: {
          prompt_tokens: 20,
          total_tokens: 20,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mismatchedResponse,
      });

      const texts = ['text 1', 'text 2'];
      
      const result = await service.generateBatchEmbeddings(texts);

      // Should pad with zeros
      expect(result.embeddings).toHaveLength(2);
      expect(result.embeddings[1]).toEqual(Array(1024).fill(0));
    });
  });

  describe('generateQueryEmbedding', () => {
    it('should generate query embedding', async () => {
      const query = 'test query';
      
      const result = await service.generateQueryEmbedding(query);

      expect(result).toBeDefined();
      expect(result).toEqual(mockEmbedding);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getModelInfo', () => {
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
  });

  describe('getSupportedModels', () => {
    it('should return list of supported models', () => {
      const models = service.getSupportedModels();
      
      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toHaveProperty('id');
      expect(models[0]).toHaveProperty('name');
      expect(models[0]).toHaveProperty('dimensions');
      expect(models[0]).toHaveProperty('costPer1k');
      expect(models[0].costPer1k).toBe(0); // All free
    });
  });

  describe('setModel', () => {
    it('should change model', () => {
      const originalModel = service.getModelInfo().model;
      
      service.setModel('e5-large-v2');
      const newModel = service.getModelInfo();
      
      expect(newModel.model).not.toBe(originalModel);
      expect(newModel.model).toBe('e5-large-v2');
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost (always free)', () => {
      const texts = ['text 1', 'text 2'];
      const cost = service.estimateCost(texts);
      
      expect(cost).toHaveProperty('estimatedTokens');
      expect(cost).toHaveProperty('estimatedCost');
      expect(cost).toHaveProperty('currency');
      expect(cost).toHaveProperty('savingsVsOpenAI');
      expect(cost.estimatedCost).toBe(0);
      expect(cost.currency).toBe('USD');
      expect(cost.savingsVsOpenAI).toBeGreaterThan(0);
    });
  });

  describe('testConnection', () => {
    it('should return true on successful connection', async () => {
      const result = await service.testConnection();
      
      expect(result).toBe(true);
    });

    it('should return false on connection failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Error' }),
      });

      const result = await service.testConnection();
      
      expect(result).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear cache', async () => {
      await service.generateEmbedding('test', { useCache: true });
      
      service.clearCache();
      
      // Cache should be empty
      await service.generateEmbedding('test', { useCache: true });
      
      // Should call API Gateway twice (once before clear, once after)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('model selection', () => {
    it('should default to mxbai-embed-large-v1', () => {
      const service = new HuggingFaceEmbeddingService();
      const info = service.getModelInfo();
      
      expect(info.modelId).toContain('mxbai-embed-large-v1');
    });

    it('should accept custom model', () => {
      const service = new HuggingFaceEmbeddingService({
        model: 'bge-base-en-v1.5',
      });
      const info = service.getModelInfo();
      
      expect(info.modelId).toContain('bge-base-en-v1.5');
    });
  });
});


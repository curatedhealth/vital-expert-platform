/**
 * Unit Tests for OpenAI Embedding Service
 * 
 * Tests the migrated service that calls Python AI Engine via API Gateway
 */

import { OpenAIEmbeddingService } from '../openai-embedding-service';
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

describe('OpenAIEmbeddingService', () => {
  let service: OpenAIEmbeddingService;
  let mockCircuitBreaker: jest.Mocked<CircuitBreaker>;
  const mockApiGatewayUrl = 'http://localhost:3001';
  const mockEmbedding = Array(1536).fill(0).map((_, i) => i * 0.001);
  const mockResponse = {
    embedding: mockEmbedding,
    model: 'text-embedding-3-small',
    dimensions: 1536,
    provider: 'openai',
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
    service = new OpenAIEmbeddingService({
      model: 'text-embedding-3-small',
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
      expect(result.model).toBe('text-embedding-3-small');
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
            model: 'text-embedding-3-small',
            provider: 'openai',
            dimensions: undefined,
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

    it('should bypass cache when useCache is false', async () => {
      const text = 'no cache text';
      
      // First call
      await service.generateEmbedding(text, { useCache: false });
      
      // Second call should also call API Gateway
      await service.generateEmbedding(text, { useCache: false });

      // Should call API Gateway twice
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle dimensions parameter', async () => {
      const text = 'test text';
      const dimensions = 512;
      
      await service.generateEmbedding(text, { dimensions });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            text: 'test text',
            model: 'text-embedding-3-small',
            provider: 'openai',
            dimensions: 512,
            normalize: true,
          }),
        })
      );
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

    it('should handle network errors with retry', async () => {
      const text = 'test text';
      
      // Reset fetch mock
      (global.fetch as jest.Mock).mockClear();
      
      // Mock network error that will be retried
      const networkError = new Error('ECONNREFUSED');
      let attemptCount = 0;
      
      (global.fetch as jest.Mock).mockImplementation(async () => {
        attemptCount++;
        if (attemptCount === 1) {
          // First attempt fails
          throw networkError;
        }
        // Second attempt succeeds (simulating successful retry)
        return {
          ok: true,
          json: async () => mockResponse,
        };
      });

      // Mock retry to handle failures and retry
      let retryAttempts = 0;
      (withRetry as jest.Mock).mockImplementation(async (fn, options) => {
        try {
          retryAttempts++;
          return await fn();
        } catch (error: any) {
          // If it's a retryable error and we haven't exceeded max retries
          if (error.message.includes('ECONNREFUSED') && retryAttempts < 3) {
            // Retry
            return await fn();
          }
          throw error;
        }
      });

      const result = await service.generateEmbedding(text);

      expect(result).toBeDefined();
      expect(result.embedding).toEqual(mockEmbedding);
      // Should have retried (attemptCount should be 2)
      expect(attemptCount).toBeGreaterThan(1);
    });

    it('should handle rate limit errors', async () => {
      const text = 'test text';
      
      // Mock rate limit response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ message: 'Rate limit exceeded' }),
      });

      await expect(service.generateEmbedding(text)).rejects.toThrow('Rate limit exceeded');

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle circuit breaker open state', async () => {
      const text = 'test text';
      
      // Mock circuit breaker to throw
      mockCircuitBreaker.execute.mockRejectedValue(
        new Error('Circuit breaker embedding-service is OPEN')
      );

      // Should throw an error when circuit breaker is open
      await expect(service.generateEmbedding(text)).rejects.toThrow();
    });

    it('should truncate text if too long', async () => {
      const longText = 'a'.repeat(10000);
      
      await service.generateEmbedding(longText);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      // Text should be truncated to ~8000 chars (with '...' added)
      expect(body.text.length).toBeLessThanOrEqual(8003); // 8000 + '...'
      expect(body.text).toContain('...');
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
        Array(1536).fill(0).map((_, i) => i * 0.001),
        Array(1536).fill(0).map((_, i) => i * 0.002),
      ],
      model: 'text-embedding-3-small',
      dimensions: 1536,
      provider: 'openai',
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
      expect(result.model).toBe('text-embedding-3-small');
      expect(result.totalTokens).toBe(20);

      // Verify API Gateway call
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiGatewayUrl}/api/embeddings/generate/batch`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            texts: ['text 1', 'text 2'],
            model: 'text-embedding-3-small',
            provider: 'openai',
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
      service = new OpenAIEmbeddingService({
        model: 'text-embedding-3-small',
        batchSize: 2,
      });
      mockCircuitBreaker.execute.mockImplementation(async (fn) => await fn());

      const texts = ['text 1', 'text 2', 'text 3', 'text 4', 'text 5'];
      
      await service.generateBatchEmbeddings(texts);

      // Should make 3 batch calls (2, 2, 1)
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should call onProgress callback', async () => {
      const texts = ['text 1', 'text 2'];
      const onProgress = jest.fn();
      
      await service.generateBatchEmbeddings(texts, { onProgress });

      expect(onProgress).toHaveBeenCalledWith(2, 2);
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

  describe('calculateSimilarity', () => {
    it('should calculate cosine similarity', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [1, 0, 0];
      
      const similarity = service.calculateSimilarity(embedding1, embedding2);

      expect(similarity).toBe(1.0);
    });

    it('should calculate orthogonal vectors as 0', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [0, 1, 0];
      
      const similarity = service.calculateSimilarity(embedding1, embedding2);

      expect(similarity).toBe(0);
    });

    it('should throw error on mismatched dimensions', () => {
      const embedding1 = [1, 2];
      const embedding2 = [1, 2, 3];
      
      expect(() => service.calculateSimilarity(embedding1, embedding2)).toThrow(
        'Embeddings must have the same dimensions'
      );
    });
  });

  describe('findMostSimilar', () => {
    it('should find most similar embeddings', () => {
      const queryEmbedding = [1, 0, 0];
      const candidates = [
        { id: '1', embedding: [1, 0, 0] },
        { id: '2', embedding: [0, 1, 0] },
        { id: '3', embedding: [0.5, 0.5, 0] },
      ];
      
      const result = service.findMostSimilar(queryEmbedding, candidates, 2);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].similarity).toBe(1.0);
      expect(result[1].id).toBe('3');
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      service.clearCache();
      const stats = service.getCacheStats();
      
      expect(stats.size).toBe(0);
    });

    it('should return cache statistics', async () => {
      await service.generateEmbedding('test', { useCache: true });
      const stats = service.getCacheStats();
      
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.keys).toBeDefined();
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

  describe('getSupportedModels', () => {
    it('should return list of supported models', () => {
      const models = service.getSupportedModels();
      
      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);
      expect(models).toContain('text-embedding-3-large');
      expect(models).toContain('text-embedding-3-small');
    });
  });

  describe('getModelInfo', () => {
    it('should return model information', () => {
      const info = service.getModelInfo();
      
      expect(info).toHaveProperty('model');
      expect(info).toHaveProperty('dimensions');
      expect(info).toHaveProperty('maxTokens');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate token count', () => {
      const text = 'This is a test.';
      const tokens = service.estimateTokens(text);
      
      expect(tokens).toBeGreaterThan(0);
      // Token estimation is approximate (4 chars per token)
      const expected = Math.ceil(text.length / 4);
      expect(Math.ceil(tokens)).toBeGreaterThanOrEqual(expected - 1);
      expect(Math.ceil(tokens)).toBeLessThanOrEqual(expected + 1);
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for embeddings', () => {
      const texts = ['text 1', 'text 2'];
      const cost = service.estimateCost(texts);
      
      expect(cost).toHaveProperty('estimatedTokens');
      expect(cost).toHaveProperty('estimatedCost');
      expect(cost).toHaveProperty('currency');
      expect(cost.currency).toBe('USD');
    });
  });
});


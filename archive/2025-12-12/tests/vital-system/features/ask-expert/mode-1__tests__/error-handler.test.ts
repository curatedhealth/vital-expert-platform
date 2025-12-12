/**
 * Mode 1 Error Handler Tests
 */

import { describe, it, expect, vi } from '@jest/globals';
import {
  Mode1ErrorHandler,
  Mode1ErrorCode,
  withRetry,
} from '../utils/error-handler';

describe('Mode1ErrorHandler', () => {
  describe('createError', () => {
    it('should create Mode1Error from regular Error', () => {
      const error = new Error('Test error');
      const mode1Error = Mode1ErrorHandler.createError(error, {
        agentId: 'test-agent',
        operation: 'test',
      });

      expect(mode1Error).toBeInstanceOf(Error);
      expect(mode1Error.code).toBeDefined();
      expect(mode1Error.retryable).toBeDefined();
      expect(mode1Error.userMessage).toBeDefined();
    });

    it('should detect timeout errors', () => {
      const error = new Error('Request timed out after 30 seconds');
      const mode1Error = Mode1ErrorHandler.createError(error, {
        operation: 'llm_call',
      });

      expect(mode1Error.code).toBe(Mode1ErrorCode.LLM_TIMEOUT);
      expect(mode1Error.retryable).toBe(true);
    });

    it('should detect rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      const mode1Error = Mode1ErrorHandler.createError(error);

      expect(mode1Error.code).toBe(Mode1ErrorCode.LLM_RATE_LIMIT);
      expect(mode1Error.retryable).toBe(true);
    });

    it('should detect network errors', () => {
      const error = new Error('Network request failed');
      const mode1Error = Mode1ErrorHandler.createError(error);

      expect(mode1Error.code).toBe(Mode1ErrorCode.NETWORK_ERROR);
      expect(mode1Error.retryable).toBe(true);
    });

    it('should detect agent not found errors', () => {
      const error = new Error('Agent not found');
      const mode1Error = Mode1ErrorHandler.createError(error, {
        agentId: 'missing-agent',
      });

      expect(mode1Error.code).toBe(Mode1ErrorCode.AGENT_NOT_FOUND);
      expect(mode1Error.retryable).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(
          Mode1ErrorHandler.createError(new Error('Network error'))
        )
        .mockResolvedValue('success');

      const result = await withRetry(operation, {
        maxRetries: 3,
        retryableErrors: [Mode1ErrorCode.NETWORK_ERROR],
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const error = Mode1ErrorHandler.createError(
        new Error('Agent not found'),
        { agentId: 'missing' }
      );
      error.retryable = false;

      const operation = vi.fn().mockRejectedValue(error);

      await expect(
        withRetry(operation, {
          maxRetries: 3,
        })
      ).rejects.toBe(error);

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should respect max retries', async () => {
      const error = Mode1ErrorHandler.createError(new Error('Network error'));
      const operation = vi.fn().mockRejectedValue(error);

      await expect(
        withRetry(operation, {
          maxRetries: 2,
        })
      ).rejects.toBe(error);

      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});


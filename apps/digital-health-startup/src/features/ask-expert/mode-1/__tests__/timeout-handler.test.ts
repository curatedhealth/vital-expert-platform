/**
 * Timeout Handler Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  withTimeout,
  withTimeoutGenerator,
  MODE1_TIMEOUTS,
  TimeoutError,
} from '../utils/timeout-handler';

describe('Timeout Handler', () => {
  describe('withTimeout', () => {
    it('should resolve if promise completes before timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(
        promise,
        MODE1_TIMEOUTS.LLM_CALL,
        'Timeout message'
      );

      expect(result).toBe('success');
    });

    it('should throw TimeoutError if promise exceeds timeout', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('success'), 2000);
      });

      await expect(
        withTimeout(promise, 500, 'Operation timed out')
      ).rejects.toThrow(TimeoutError);
    });

    it('should use custom error message', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('success'), 2000);
      });

      await expect(
        withTimeout(promise, 500, 'Custom timeout message')
      ).rejects.toThrow('Custom timeout message');
    });
  });

  describe('withTimeoutGenerator', () => {
    it('should yield all values from generator', async () => {
      async function* generateValues() {
        yield 'value1';
        yield 'value2';
        yield 'value3';
      }

      const generator = withTimeoutGenerator(
        generateValues(),
        MODE1_TIMEOUTS.LLM_CALL,
        'Timeout message'
      );

      const values: string[] = [];
      for await (const value of generator) {
        values.push(value);
      }

      expect(values).toEqual(['value1', 'value2', 'value3']);
    });

    it('should throw TimeoutError if generator exceeds timeout', async () => {
      async function* slowGenerator() {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        yield 'value';
      }

      const generator = withTimeoutGenerator(
        slowGenerator(),
        500,
        'Generator timed out'
      );

      await expect(async () => {
        for await (const _ of generator) {
          // Consume generator
        }
      }).rejects.toThrow(TimeoutError);
    });
  });

  describe('Timeout Constants', () => {
    it('should have defined timeout values', () => {
      expect(MODE1_TIMEOUTS.LLM_CALL).toBeGreaterThan(0);
      expect(MODE1_TIMEOUTS.RAG_RETRIEVAL).toBeGreaterThan(0);
      expect(MODE1_TIMEOUTS.TOOL_EXECUTION).toBeGreaterThan(0);
      expect(MODE1_TIMEOUTS.FULL_REQUEST).toBeGreaterThan(0);
    });

    it('should have reasonable timeout values', () => {
      expect(MODE1_TIMEOUTS.LLM_CALL).toBeLessThanOrEqual(30000); // 30s max
      expect(MODE1_TIMEOUTS.RAG_RETRIEVAL).toBeLessThanOrEqual(10000); // 10s max
      expect(MODE1_TIMEOUTS.FULL_REQUEST).toBeGreaterThan(MODE1_TIMEOUTS.LLM_CALL);
    });
  });
});


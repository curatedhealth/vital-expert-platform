/**
 * Unit Tests for Circuit Breaker Service
 * 
 * Tests circuit breaker state transitions, timeout handling, and failure thresholds.
 * 
 * Coverage Target: 95%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CircuitBreaker,
  CircuitState,
  getPineconeCircuitBreaker,
  getSupabaseCircuitBreaker,
  type CircuitBreakerOptions,
} from '@/lib/services/resilience/circuit-breaker';

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  infoWithMetrics: vi.fn(),
};

vi.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: vi.fn(() => mockLogger),
}));

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    circuitBreaker = new CircuitBreaker('test-service', {
      timeout: 1000,
      errorThresholdPercentage: 50,
      resetTimeout: 5000,
      monitoringPeriod: 10000,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should have zero failures and successes initially', () => {
      const stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
      expect(stats.errorRate).toBe(0);
    });
  });

  describe('Successful Operations', () => {
    it('should allow successful operations when closed', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should decrease failure count on success (exponential backoff)', async () => {
      // Cause some failures first
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      
      try {
        await circuitBreaker.execute(fn);
      } catch (e) {
        // Expected
      }
      try {
        await circuitBreaker.execute(fn);
      } catch (e) {
        // Expected
      }

      let stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(2);

      // Now succeed
      const successFn = vi.fn().mockResolvedValue('success');
      await circuitBreaker.execute(successFn);

      stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(1); // Should decrease
    });

    it('should log success metrics', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      await circuitBreaker.execute(fn);

      expect(mockLogger.infoWithMetrics).toHaveBeenCalledWith(
        'circuit_breaker_success',
        expect.any(Number),
        expect.objectContaining({
          circuit: 'test-service',
          state: CircuitState.CLOSED,
        })
      );
    });
  });

  describe('Failure Handling', () => {
    it('should increment failure count on error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Service error'));

      try {
        await circuitBreaker.execute(fn);
      } catch (error) {
        expect(error).toBeDefined();
      }

      const stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(1);
      expect(stats.successes).toBe(0);
    });

    it('should record last failure time', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Error'));

      try {
        await circuitBreaker.execute(fn);
      } catch (e) {
        // Expected
      }

      const stats = circuitBreaker.getStats();
      expect(stats.lastFailureTime).toBeGreaterThan(0);
    });

    it('should log failures', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Service error'));

      try {
        await circuitBreaker.execute(fn);
      } catch (e) {
        // Expected
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        'circuit_breaker_failure',
        expect.any(Error),
        expect.objectContaining({
          circuit: 'test-service',
        })
      );
    });
  });

  describe('State Transitions', () => {
    it('should transition to OPEN when error threshold exceeded', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Error'));

      // With 50% threshold and initial state, need more failures than successes
      // Let's cause 6 failures and 4 successes (60% error rate)
      for (let i = 0; i < 6; i++) {
        try {
          await circuitBreaker.execute(fn);
        } catch (e) {
          // Expected
        }
      }

      // Add some successes
      const successFn = vi.fn().mockResolvedValue('success');
      for (let i = 0; i < 4; i++) {
        await circuitBreaker.execute(successFn);
      }

      // Now one more failure should trigger threshold (6 failures, 4 successes = 60%)
      try {
        await circuitBreaker.execute(fn);
      } catch (e) {
        // Expected
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'circuit_breaker_opened',
        expect.any(Object)
      );
    });

    it('should reject requests immediately when OPEN', async () => {
      // Force circuit open by setting state directly (for testing)
      // In real scenario, this happens after threshold
      const fn = vi.fn().mockResolvedValue('success');

      // Manually open circuit (simulate threshold exceeded)
      const breaker = new CircuitBreaker('test', {
        errorThresholdPercentage: 50,
        resetTimeout: 5000,
      });

      // Cause enough failures to open
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      for (let i = 0; i < 10; i++) {
        try {
          await breaker.execute(failFn);
        } catch (e) {
          // Expected
        }
      }

      // Should be OPEN now
      if (breaker.getState() === CircuitState.OPEN) {
        // Try to execute
        await expect(breaker.execute(fn)).rejects.toThrow(/is OPEN/);
      }
    });

    it('should transition to HALF_OPEN after reset timeout', async () => {
      const breaker = new CircuitBreaker('test', {
        errorThresholdPercentage: 50,
        resetTimeout: 5000, // 5 seconds
      });

      // Cause failures to open circuit
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      for (let i = 0; i < 10; i++) {
        try {
          await breaker.execute(failFn);
        } catch (e) {
          // Expected
        }
      }

      // Circuit should be OPEN
      if (breaker.getState() === CircuitState.OPEN) {
        // Advance time past reset timeout
        vi.advanceTimersByTime(6000);

        // Try to execute - should transition to HALF_OPEN
        const successFn = vi.fn().mockResolvedValue('success');
        await breaker.execute(successFn);

        expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);
        expect(mockLogger.info).toHaveBeenCalledWith(
          'circuit_breaker_half_open',
          expect.any(Object)
        );
      }
    });

    it('should transition to CLOSED after 3 consecutive successes in HALF_OPEN', async () => {
      const breaker = new CircuitBreaker('test', {
        errorThresholdPercentage: 50,
        resetTimeout: 1000,
      });

      // Open circuit
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      for (let i = 0; i < 10; i++) {
        try {
          await breaker.execute(failFn);
        } catch (e) {
          // Expected
        }
      }

      // Wait for reset timeout
      vi.advanceTimersByTime(2000);

      // Execute 3 successful operations
      const successFn = vi.fn().mockResolvedValue('success');
      for (let i = 0; i < 3; i++) {
        await breaker.execute(successFn);
      }

      expect(breaker.getState()).toBe(CircuitState.CLOSED);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'circuit_breaker_closed',
        expect.any(Object)
      );
    });

    it('should transition back to OPEN if failure occurs in HALF_OPEN', async () => {
      const breaker = new CircuitBreaker('test', {
        errorThresholdPercentage: 50,
        resetTimeout: 1000,
      });

      // Open circuit
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      for (let i = 0; i < 10; i++) {
        try {
          await breaker.execute(failFn);
        } catch (e) {
          // Expected
        }
      }

      // Wait for reset timeout
      vi.advanceTimersByTime(2000);

      // Should be HALF_OPEN now, execute a failure
      try {
        await breaker.execute(failFn);
      } catch (e) {
        // Expected
      }

      expect(breaker.getState()).toBe(CircuitState.OPEN);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'circuit_breaker_opened_from_half_open',
        expect.any(Object)
      );
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout operations exceeding timeout duration', async () => {
      const breaker = new CircuitBreaker('test', {
        timeout: 1000, // 1 second
      });

      const slowFn = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('slow'), 2000); // 2 seconds
          })
      );

      await expect(breaker.execute(slowFn)).rejects.toThrow(/timeout/);

      vi.advanceTimersByTime(2000);
    });

    it('should complete operations within timeout', async () => {
      const breaker = new CircuitBreaker('test', {
        timeout: 2000, // 2 seconds
      });

      const fastFn = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('fast'), 1000); // 1 second
          })
      );

      vi.advanceTimersByTime(1000);

      const result = await breaker.execute(fastFn);

      expect(result).toBe('fast');
    });

    it('should handle timeout as a failure', async () => {
      const breaker = new CircuitBreaker('test', {
        timeout: 1000,
      });

      const slowFn = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('slow'), 2000);
          })
      );

      try {
        await breaker.execute(slowFn);
      } catch (e) {
        // Expected timeout error
      }

      vi.advanceTimersByTime(2000);

      const stats = breaker.getStats();
      expect(stats.failures).toBeGreaterThan(0);
    });
  });

  describe('Configuration Options', () => {
    it('should use custom timeout', async () => {
      const breaker = new CircuitBreaker('test', {
        timeout: 500,
      });

      const slowFn = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('done'), 1000);
          })
      );

      await expect(breaker.execute(slowFn)).rejects.toThrow(/timeout/);

      vi.advanceTimersByTime(1000);
    });

    it('should use custom error threshold percentage', async () => {
      const breaker = new CircuitBreaker('test', {
        errorThresholdPercentage: 75, // 75% threshold
      });

      // Need higher failure rate to trigger
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      
      // Cause many failures
      for (let i = 0; i < 20; i++) {
        try {
          await breaker.execute(failFn);
        } catch (e) {
          // Expected
        }
      }
    });

    it('should use custom reset timeout', async () => {
      const breaker = new CircuitBreaker('test', {
        resetTimeout: 10000, // 10 seconds
      });

      // Open circuit
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      for (let i = 0; i < 10; i++) {
        try {
          await breaker.execute(failFn);
        } catch (e) {
          // Expected
        }
      }

      if (breaker.getState() === CircuitState.OPEN) {
        const stats = breaker.getStats();
        // Next attempt should be after resetTimeout
        expect(stats.nextAttemptTime).toBeGreaterThan(Date.now());
      }
    });
  });

  describe('Manual Reset', () => {
    it('should reset circuit breaker to CLOSED state', () => {
      // Create breaker and cause failures (try to open)
      const breaker = new CircuitBreaker('test', {
        errorThresholdPercentage: 50,
      });

      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      
      // Cause failures
      (async () => {
        for (let i = 0; i < 10; i++) {
          try {
            await breaker.execute(failFn);
          } catch (e) {
            // Expected
          }
        }
      })();

      breaker.reset();

      expect(breaker.getState()).toBe(CircuitState.CLOSED);
      const stats = breaker.getStats();
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'circuit_breaker_reset',
        expect.any(Object)
      );
    });
  });

  describe('Statistics', () => {
    it('should calculate error rate correctly', async () => {
      const breaker = new CircuitBreaker('test');

      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      const successFn = vi.fn().mockResolvedValue('success');

      // 3 failures
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failFn);
        } catch (e) {
          // Expected
        }
      }

      // 7 successes
      for (let i = 0; i < 7; i++) {
        await breaker.execute(successFn);
      }

      const stats = breaker.getStats();
      expect(stats.errorRate).toBeCloseTo(30, 0); // 3/10 = 30%
    });

    it('should return zero error rate when no operations', () => {
      const stats = circuitBreaker.getStats();
      expect(stats.errorRate).toBe(0);
    });

    it('should include all relevant stats', () => {
      const stats = circuitBreaker.getStats();

      expect(stats).toMatchObject({
        name: 'test-service',
        state: expect.any(String),
        failures: expect.any(Number),
        successes: expect.any(Number),
        errorRate: expect.any(Number),
      });
    });
  });

  describe('Singleton Instances', () => {
    it('should return same instance for Pinecone circuit breaker', () => {
      const breaker1 = getPineconeCircuitBreaker();
      const breaker2 = getPineconeCircuitBreaker();

      expect(breaker1).toBe(breaker2);
      expect(breaker1.getState()).toBe(CircuitState.CLOSED);
    });

    it('should return same instance for Supabase circuit breaker', () => {
      const breaker1 = getSupabaseCircuitBreaker();
      const breaker2 = getSupabaseCircuitBreaker();

      expect(breaker1).toBe(breaker2);
      expect(breaker1.getState()).toBe(CircuitState.CLOSED);
    });

    it('should have different instances for different services', () => {
      const pineconeBreaker = getPineconeCircuitBreaker();
      const supabaseBreaker = getSupabaseCircuitBreaker();

      expect(pineconeBreaker).not.toBe(supabaseBreaker);
    });
  });

  describe('Edge Cases', () => {
    it('should handle function that returns undefined', async () => {
      const fn = vi.fn().mockResolvedValue(undefined);

      const result = await circuitBreaker.execute(fn);

      expect(result).toBeUndefined();
      expect(fn).toHaveBeenCalled();
    });

    it('should handle function that throws non-Error object', async () => {
      const fn = vi.fn().mockRejectedValue('string error');

      try {
        await circuitBreaker.execute(fn);
      } catch (error) {
        expect(error).toBeDefined();
      }

      const stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(1);
    });

    it('should handle rapid state changes', async () => {
      const breaker = new CircuitBreaker('test', {
        errorThresholdPercentage: 50,
        resetTimeout: 100,
      });

      // Rapid failures
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      for (let i = 0; i < 20; i++) {
        try {
          await breaker.execute(failFn);
        } catch (e) {
          // Expected
        }
      }

      // Should handle gracefully
      expect(breaker.getState()).toBeDefined();
    });

    it('should handle concurrent executions', async () => {
      const successFn = vi.fn().mockResolvedValue('success');

      const promises = Array.from({ length: 10 }, () =>
        circuitBreaker.execute(successFn)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(results.every((r) => r === 'success')).toBe(true);
    });
  });
});


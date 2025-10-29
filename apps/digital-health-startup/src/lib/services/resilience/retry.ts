/**
 * Retry Utility with Exponential Backoff
 * 
 * Enterprise-grade retry logic with:
 * - Exponential backoff with jitter
 * - Configurable retry conditions
 * - Max retry attempts
 * - Retry only on transient errors
 * - Structured logging
 */

import { createLogger } from '../observability/structured-logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryable?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryable' | 'onRetry'>> & { retryable: (error: Error) => boolean } = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitter: true,
  retryable: (error: Error) => {
    // Retry on network errors, timeouts, and 5xx errors
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('econnrefused') ||
      message.includes('503') ||
      message.includes('502') ||
      message.includes('500') ||
      message.includes('rate limit') ||
      message.includes('too many requests')
    );
  },
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Add jitter to delay to prevent thundering herd
 */
function addJitter(delay: number): number {
  const jitter = Math.random() * 0.3 * delay; // Up to 30% jitter
  return delay + jitter;
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const logger = createLogger();
  const operationId = `retry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let lastError: Error;
  let delay = opts.initialDelayMs;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const result = await operation();
      
      if (attempt > 0) {
        logger.info('retry_success', {
          operationId,
          attempt,
          totalAttempts: attempt + 1,
        });
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const isRetryable = opts.retryable(lastError);
      
      // Don't retry if error is not retryable or we've exhausted retries
      if (!isRetryable || attempt === opts.maxRetries) {
        if (!isRetryable) {
          logger.warn('retry_non_retryable_error', {
            operationId,
            attempt,
            error: lastError.message,
          });
        } else {
          logger.error('retry_exhausted', lastError, {
            operationId,
            attempts: attempt + 1,
          });
        }
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const calculatedDelay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelayMs
      );
      delay = opts.jitter ? addJitter(calculatedDelay) : calculatedDelay;

      // Call onRetry callback
      if (opts.onRetry) {
        opts.onRetry(attempt + 1, lastError, delay);
      }

      logger.warn('retry_attempt', {
        operationId,
        attempt: attempt + 1,
        maxRetries: opts.maxRetries,
        delayMs: delay,
        error: lastError.message,
      });

      // Wait before retry
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Retry decorator for class methods
 */
export function retry(options?: RetryOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(
        () => originalMethod.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}


/**
 * Timeout Handler Utilities
 * 
 * Provides timeout wrappers for async operations to prevent
 * indefinite hangs and ensure graceful failure handling.
 */

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds
 * @param errorMessage Custom error message
 * @returns Promise that rejects with TimeoutError if timeout is exceeded
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new TimeoutError(
          errorMessage || `Operation timed out after ${timeoutMs}ms`,
          timeoutMs
        )
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Default timeout configurations for Mode 1 operations
 */
export const MODE1_TIMEOUTS = {
  LLM_CALL: 30000, // 30 seconds for LLM API calls
  RAG_RETRIEVAL: 10000, // 10 seconds for RAG retrieval
  TOOL_EXECUTION: 15000, // 15 seconds for tool execution
  FULL_REQUEST: 60000, // 60 seconds for entire request
} as const;

/**
 * Wraps an async generator with a timeout
 * Useful for streaming operations
 */
export async function* withTimeoutGenerator<T>(
  generator: AsyncGenerator<T>,
  timeoutMs: number,
  errorMessage?: string
): AsyncGenerator<T> {
  const startTime = Date.now();

  try {
    while (true) {
      // Check if we've exceeded the timeout
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeoutMs) {
        throw new TimeoutError(
          errorMessage || `Streaming operation timed out after ${timeoutMs}ms`,
          timeoutMs
        );
      }

      // Race between generator next() and remaining timeout
      const remainingTimeout = timeoutMs - elapsed;
      const result = await withTimeout(
        generator.next(),
        remainingTimeout,
        errorMessage
      );

      if (result.done) {
        break;
      }

      yield result.value;
    }
  } catch (error) {
    if (error instanceof TimeoutError) {
      throw error;
    }
    throw error;
  }
}


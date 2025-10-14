export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
}

export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if this is the last attempt
      if (attempt === maxAttempts - 1) {
        throw lastError;
      }
      
      // Don't retry if error is not retryable
      if (!shouldRetry(lastError)) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      
      console.log(`⚠️ Retry attempt ${attempt + 1}/${maxAttempts} after ${delay}ms`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Helper to determine if error is retryable
export function isRetryableError(error: Error): boolean {
  // Retry on network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // Retry on timeout errors
  if (error.message.includes('timeout')) {
    return true;
  }
  
  // Retry on 5xx errors
  if (error.message.match(/5\d\d/)) {
    return true;
  }
  
  // Don't retry on AbortError
  if (error.name === 'AbortError') {
    return false;
  }
  
  // Don't retry on validation errors (4xx)
  if (error.message.match(/4\d\d/)) {
    return false;
  }
  
  return false;
}

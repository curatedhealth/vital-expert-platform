/**
 * Circuit Breaker Pattern for Mode 1
 * 
 * Prevents cascading failures by monitoring service health
 * and temporarily stopping requests when services are down
 */

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitoringWindow?: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failures detected, requests blocked
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: number;
  private successCount = 0;

  constructor(
    private name: string,
    private options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      resetTimeout: options.resetTimeout ?? 60000, // 60 seconds
      monitoringWindow: options.monitoringWindow ?? 60000, // 60 seconds
    };
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        console.log(`🔄 [Circuit Breaker: ${this.name}] Attempting reset (HALF_OPEN)`);
      } else {
        console.warn(`⚠️  [Circuit Breaker: ${this.name}] Circuit OPEN - using fallback`);
        if (fallback) {
          return fallback();
        }
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      // Use fallback if available
      if (fallback) {
        console.warn(`⚠️  [Circuit Breaker: ${this.name}] Operation failed, using fallback`);
        return fallback();
      }
      
      throw error;
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      // If we have enough successes, close the circuit
      if (this.successCount >= 2) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        console.log(`✅ [Circuit Breaker: ${this.name}] Circuit CLOSED - service recovered`);
      }
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    // Open circuit if threshold exceeded
    if (
      this.failureCount >= this.options.failureThreshold! &&
      this.state !== CircuitState.OPEN
    ) {
      this.state = CircuitState.OPEN;
      console.error(
        `🚨 [Circuit Breaker: ${this.name}] Circuit OPENED after ${this.failureCount} failures`
      );
    }
  }

  /**
   * Check if circuit should attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    return timeSinceLastFailure >= this.options.resetTimeout!;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    console.log(`🔄 [Circuit Breaker: ${this.name}] Manually reset`);
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Export circuit breaker instances for common services
export const llmCircuitBreaker = new CircuitBreaker('LLM', {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
});

export const ragCircuitBreaker = new CircuitBreaker('RAG', {
  failureThreshold: 3,
  resetTimeout: 60000, // 60 seconds
});

export const toolCircuitBreaker = new CircuitBreaker('Tools', {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
});


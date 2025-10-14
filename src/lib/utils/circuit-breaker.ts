/**
 * Circuit Breaker Pattern for External API Calls
 * Prevents cascading failures and provides graceful degradation
 */

export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

export class CircuitBreaker {
  private options: CircuitBreakerOptions;
  private state: CircuitBreakerState;
  private onStateChange?: (state: CircuitBreakerState) => void;

  constructor(
    options: Partial<CircuitBreakerOptions> = {},
    onStateChange?: (state: CircuitBreakerState) => void
  ) {
    this.options = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      ...options
    };
    
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0
    };
    
    this.onStateChange = onStateChange;
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() < this.state.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      } else {
        this.setState('HALF_OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    if (this.state.state === 'HALF_OPEN') {
      this.setState('CLOSED');
    }
    this.state.failureCount = 0;
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.options.failureThreshold) {
      this.setState('OPEN');
      this.state.nextAttemptTime = Date.now() + this.options.recoveryTimeout;
    }
  }

  /**
   * Update circuit breaker state
   */
  private setState(newState: 'CLOSED' | 'OPEN' | 'HALF_OPEN'): void {
    if (this.state.state !== newState) {
      this.state.state = newState;
      this.onStateChange?.(this.state);
      
      console.log(`🔌 Circuit breaker state changed to: ${newState}`);
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.setState('CLOSED');
    this.state.failureCount = 0;
    this.state.lastFailureTime = 0;
    this.state.nextAttemptTime = 0;
  }
}

/**
 * Circuit breaker instances for different services
 */
export const circuitBreakers = {
  openai: new CircuitBreaker({
    failureThreshold: 3,
    recoveryTimeout: 30000
  }),
  
  tavily: new CircuitBreaker({
    failureThreshold: 5,
    recoveryTimeout: 60000
  }),
  
  supabase: new CircuitBreaker({
    failureThreshold: 10,
    recoveryTimeout: 30000
  })
};

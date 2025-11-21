/**
 * Circuit Breaker Pattern
 * 
 * Implements circuit breaker for resilient service calls
 * Prevents cascading failures and provides graceful degradation
 */

import { createLogger } from '../observability/structured-logger';

export interface CircuitBreakerOptions {
  timeout?: number; // Timeout in ms
  errorThresholdPercentage?: number; // Percentage of failures to open circuit
  resetTimeout?: number; // Time to wait before half-open state
  monitoringPeriod?: number; // Period for error rate calculation
}

export enum CircuitState {
  CLOSED = 'closed', // Normal operation
  OPEN = 'open', // Failing, rejecting requests
  HALF_OPEN = 'half_open', // Testing if service recovered
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number = 0;
  
  private options: Required<CircuitBreakerOptions>;
  private logger;

  constructor(
    private name: string,
    options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      timeout: options.timeout || 5000,
      errorThresholdPercentage: options.errorThresholdPercentage || 50,
      resetTimeout: options.resetTimeout || 30000,
      monitoringPeriod: options.monitoringPeriod || 60000,
    };
    this.logger = createLogger({ requestId: `circuit-breaker-${name}` });
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (now < this.nextAttemptTime) {
        // Still in open state - reject immediately
        this.logger.warn('circuit_breaker_open', {
          circuit: this.name,
          nextAttempt: new Date(this.nextAttemptTime).toISOString(),
        });
        throw new Error(`Circuit breaker ${this.name} is OPEN. Retry after ${new Date(this.nextAttemptTime).toISOString()}`);
      } else {
        // Time to try half-open
        this.state = CircuitState.HALF_OPEN;
        this.failures = 0;
        this.successes = 0;
        this.logger.info('circuit_breaker_half_open', {
          circuit: this.name,
        });
      }
    }

    // Execute with timeout
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Circuit breaker ${this.name} timeout after ${this.options.timeout}ms`)),
            this.options.timeout
          )
        ),
      ]);

      // Success
      this.handleSuccess();
      const duration = Date.now() - startTime;
      
      this.logger.infoWithMetrics('circuit_breaker_success', duration, {
        circuit: this.name,
        state: this.state,
      });

      return result;
    } catch (error) {
      // Failure
      this.handleFailure();
      
      this.logger.error(
        'circuit_breaker_failure',
        error instanceof Error ? error : new Error(String(error)),
        {
          circuit: this.name,
          state: this.state,
        }
      );

      throw error;
    }
  }

  private handleSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= 3) {
        // 3 consecutive successes - close circuit
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        this.logger.info('circuit_breaker_closed', {
          circuit: this.name,
        });
      }
    } else {
      // Closed state - reset failure count
      this.failures = Math.max(0, this.failures - 1);
    }
  }

  private handleFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed in half-open - open circuit
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.options.resetTimeout;
      this.successes = 0;
      this.logger.warn('circuit_breaker_opened_from_half_open', {
        circuit: this.name,
      });
    } else {
      // Calculate error rate
      const totalRequests = this.failures + this.successes;
      if (totalRequests > 0) {
        const errorRate = (this.failures / totalRequests) * 100;
        
        if (errorRate >= this.options.errorThresholdPercentage) {
          // Open circuit
          this.state = CircuitState.OPEN;
          this.nextAttemptTime = Date.now() + this.options.resetTimeout;
          this.logger.warn('circuit_breaker_opened', {
            circuit: this.name,
            errorRate: errorRate.toFixed(2),
            failures: this.failures,
            totalRequests,
          });
        }
      }
    }
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
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = 0;
    this.logger.info('circuit_breaker_reset', {
      circuit: this.name,
    });
  }

  /**
   * Get circuit breaker statistics
   */
  getStats() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      errorRate: this.failures + this.successes > 0
        ? (this.failures / (this.failures + this.successes)) * 100
        : 0,
    };
  }
}

// Export singleton instances for common services
let pineconeCircuitBreaker: CircuitBreaker | null = null;
let supabaseCircuitBreaker: CircuitBreaker | null = null;

export function getPineconeCircuitBreaker(): CircuitBreaker {
  if (!pineconeCircuitBreaker) {
    pineconeCircuitBreaker = new CircuitBreaker('pinecone', {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    });
  }
  return pineconeCircuitBreaker;
}

export function getSupabaseCircuitBreaker(): CircuitBreaker {
  if (!supabaseCircuitBreaker) {
    supabaseCircuitBreaker = new CircuitBreaker('supabase', {
      timeout: 10000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    });
  }
  return supabaseCircuitBreaker;
}


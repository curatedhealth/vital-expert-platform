/**
 * Circuit Breaker Pattern
 * Prevents cascading failures by stopping requests to failing services
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, reject requests immediately
 * - HALF_OPEN: Testing if service recovered, allow limited requests
 *
 * Industry Standard: Netflix Hystrix pattern
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Milliseconds before attempting to close circuit
  monitoringPeriodMs: number; // Time window for tracking failures
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastFailureTime?: string;
  lastSuccessTime?: string;
  totalRequests: number;
  rejectedRequests: number;
  stateChangeHistory: Array<{
    from: CircuitState;
    to: CircuitState;
    timestamp: string;
    reason: string;
  }>;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private consecutiveFailures: number = 0;
  private consecutiveSuccesses: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttemptTime?: Date;
  private totalRequests: number = 0;
  private rejectedRequests: number = 0;
  private stateChangeHistory: CircuitBreakerStats['stateChangeHistory'] = [];

  constructor(
    private readonly serviceName: string,
    private readonly config: CircuitBreakerConfig = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000, // 1 minute
      monitoringPeriodMs: 120000, // 2 minutes
    }
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      // Check if timeout has passed to attempt half-open
      if (this.nextAttemptTime && new Date() >= this.nextAttemptTime) {
        this.transitionTo(CircuitState.HALF_OPEN, 'Timeout expired, attempting recovery');
      } else {
        this.rejectedRequests++;
        const error = new CircuitBreakerError(
          `Circuit breaker is OPEN for ${this.serviceName}`,
          this.serviceName
        );

        if (fallback) {
          console.warn(
            `⚡ Circuit breaker OPEN for ${this.serviceName}, using fallback`
          );
          return fallback();
        }

        throw error;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();

      if (fallback) {
        console.warn(
          `⚡ Request failed for ${this.serviceName}, using fallback`,
          error
        );
        return fallback();
      }

      throw error;
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.successes++;
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;
    this.lastSuccessTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.consecutiveSuccesses >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED, 'Service recovered');
        this.resetCounters();
      }
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.failures++;
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = new Date();

    // Clean old failures outside monitoring period
    this.cleanOldFailures();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open state reopens the circuit
      this.transitionTo(CircuitState.OPEN, 'Failure during recovery attempt');
      this.nextAttemptTime = new Date(Date.now() + this.config.timeout);
    } else if (this.state === CircuitState.CLOSED) {
      if (this.consecutiveFailures >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN, 'Failure threshold exceeded');
        this.nextAttemptTime = new Date(Date.now() + this.config.timeout);
      }
    }
  }

  /**
   * Transition circuit breaker state
   */
  private transitionTo(newState: CircuitState, reason: string): void {
    const oldState = this.state;
    this.state = newState;

    this.stateChangeHistory.push({
      from: oldState,
      to: newState,
      timestamp: new Date().toISOString(),
      reason,
    });

    // Keep only last 100 state changes
    if (this.stateChangeHistory.length > 100) {
      this.stateChangeHistory = this.stateChangeHistory.slice(-100);
    }

    console.log(
      `⚡ Circuit breaker for ${this.serviceName}: ${oldState} → ${newState} (${reason})`
    );
  }

  /**
   * Clean failures outside monitoring period
   */
  private cleanOldFailures(): void {
    if (!this.lastFailureTime) return;

    const monitoringCutoff = new Date(
      Date.now() - this.config.monitoringPeriodMs
    );

    if (this.lastFailureTime < monitoringCutoff) {
      // Reset consecutive failures if last failure is old
      this.consecutiveFailures = 1; // Current failure
    }
  }

  /**
   * Reset all counters
   */
  private resetCounters(): void {
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      lastFailureTime: this.lastFailureTime?.toISOString(),
      lastSuccessTime: this.lastSuccessTime?.toISOString(),
      totalRequests: this.totalRequests,
      rejectedRequests: this.rejectedRequests,
      stateChangeHistory: [...this.stateChangeHistory],
    };
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.transitionTo(CircuitState.CLOSED, 'Manual reset');
    this.failures = 0;
    this.successes = 0;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttemptTime = undefined;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Check if circuit is healthy
   */
  isHealthy(): boolean {
    return this.state === CircuitState.CLOSED;
  }
}

/**
 * Circuit Breaker Error
 */
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly serviceName: string
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Circuit Breaker Manager
 * Manages multiple circuit breakers for different services
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create circuit breaker for a service
   */
  getBreaker(
    serviceName: string,
    config?: Partial<CircuitBreakerConfig>
  ): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      const defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000,
        monitoringPeriodMs: 120000,
      };

      this.breakers.set(
        serviceName,
        new CircuitBreaker(serviceName, { ...defaultConfig, ...config })
      );
    }

    return this.breakers.get(serviceName)!;
  }

  /**
   * Get all circuit breaker statistics
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};

    for (const [name, breaker] of this.breakers.entries()) {
      stats[name] = breaker.getStats();
    }

    return stats;
  }

  /**
   * Get unhealthy services
   */
  getUnhealthyServices(): string[] {
    const unhealthy: string[] = [];

    for (const [name, breaker] of this.breakers.entries()) {
      if (!breaker.isHealthy()) {
        unhealthy.push(name);
      }
    }

    return unhealthy;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Reset specific circuit breaker
   */
  reset(serviceName: string): void {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      breaker.reset();
    }
  }
}

// Singleton instance
export const circuitBreakerManager = new CircuitBreakerManager();

/**
 * Pre-configured circuit breakers for RAG services
 */
export const RAG_CIRCUIT_BREAKERS = {
  openai: circuitBreakerManager.getBreaker('openai', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
    monitoringPeriodMs: 120000, // 2 minutes
  }),
  pinecone: circuitBreakerManager.getBreaker('pinecone', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
    monitoringPeriodMs: 120000,
  }),
  cohere: circuitBreakerManager.getBreaker('cohere', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    monitoringPeriodMs: 120000,
  }),
  supabase: circuitBreakerManager.getBreaker('supabase', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,
    monitoringPeriodMs: 120000,
  }),
  redis: circuitBreakerManager.getBreaker('redis', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,
    monitoringPeriodMs: 120000,
  }),
  google: circuitBreakerManager.getBreaker('google', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    monitoringPeriodMs: 120000,
  }),
};

import { EventEmitter } from 'events';

/**
 * Advanced Retry Logic with Exponential Backoff and Circuit Breaker Pattern
 * Provides robust error handling and recovery mechanisms for autonomous agents
 */

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: string[];
  nonRetryableErrors: string[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringWindow: number;
  minimumRequests: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
  circuitBreakerOpen?: boolean;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
  successCount: number;
  totalRequests: number;
}

/**
 * Exponential Backoff Retry Logic
 */
export class ExponentialBackoffRetry {
  private config: RetryConfig;
  private eventEmitter: EventEmitter;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: ['TIMEOUT', 'NETWORK_ERROR', 'RATE_LIMIT', 'TEMPORARY_FAILURE'],
      nonRetryableErrors: ['AUTHENTICATION_ERROR', 'PERMISSION_DENIED', 'INVALID_INPUT', 'NOT_FOUND'],
      ...config
    };
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Execute function with exponential backoff retry
   */
  async execute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: Error | undefined;
    let attempts = 0;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      attempts = attempt;
      
      try {
        this.eventEmitter.emit('retry:attempt', { attempt, context });
        
        const result = await fn();
        const totalDuration = Date.now() - startTime;
        
        this.eventEmitter.emit('retry:success', { 
          attempt, 
          totalDuration, 
          context 
        });
        
        return {
          success: true,
          data: result,
          attempts,
          totalDuration
        };
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable
        if (!this.isRetryableError(error as Error)) {
          this.eventEmitter.emit('retry:nonRetryableError', { 
            error, 
            attempt, 
            context 
          });
          
          return {
            success: false,
            error: lastError,
            attempts,
            totalDuration: Date.now() - startTime
          };
        }

        // Check if we've reached max attempts
        if (attempt === this.config.maxAttempts) {
          this.eventEmitter.emit('retry:maxAttemptsReached', { 
            error, 
            attempts, 
            context 
          });
          
          return {
            success: false,
            error: lastError,
            attempts,
            totalDuration: Date.now() - startTime
          };
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt);
        
        this.eventEmitter.emit('retry:retrying', { 
          error, 
          attempt, 
          nextDelay: delay, 
          context 
        });
        
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts,
      totalDuration: Date.now() - startTime
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const errorMessage = error.message.toUpperCase();
    
    // Check non-retryable errors first
    for (const nonRetryableError of this.config.nonRetryableErrors) {
      if (errorMessage.includes(nonRetryableError.toUpperCase())) {
        return false;
      }
    }
    
    // Check retryable errors
    for (const retryableError of this.config.retryableErrors) {
      if (errorMessage.includes(retryableError.toUpperCase())) {
        return true;
      }
    }
    
    // Default to retryable for unknown errors
    return true;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number): number {
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay limit
    delay = Math.min(delay, this.config.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      delay += (Math.random() - 0.5) * 2 * jitterAmount;
    }
    
    return Math.max(0, Math.floor(delay));
  }

  /**
   * Sleep for specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

/**
 * Circuit Breaker Pattern Implementation
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private eventEmitter: EventEmitter;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringWindow: 300000, // 5 minutes
      minimumRequests: 10,
      ...config
    };
    
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successCount: 0,
      totalRequests: 0
    };
    
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    
    // Check circuit breaker state
    if (this.state.state === 'OPEN') {
      if (Date.now() < this.state.nextAttemptTime) {
        this.eventEmitter.emit('circuit:open', { context });
        return {
          success: false,
          error: new Error('Circuit breaker is OPEN'),
          attempts: 0,
          totalDuration: Date.now() - startTime,
          circuitBreakerOpen: true
        };
      } else {
        // Transition to HALF_OPEN
        this.state.state = 'HALF_OPEN';
        this.state.successCount = 0;
        this.eventEmitter.emit('circuit:halfOpen', { context });
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      
      this.eventEmitter.emit('circuit:success', { 
        context, 
        state: this.state.state 
      });
      
      return {
        success: true,
        data: result,
        attempts: 1,
        totalDuration: Date.now() - startTime
      };
    } catch (error) {
      this.onFailure();
      
      this.eventEmitter.emit('circuit:failure', { 
        error, 
        context, 
        state: this.state.state 
      });
      
      return {
        success: false,
        error: error as Error,
        attempts: 1,
        totalDuration: Date.now() - startTime,
        circuitBreakerOpen: this.state.state === 'OPEN'
      };
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.state.successCount++;
    this.state.totalRequests++;
    
    if (this.state.state === 'HALF_OPEN') {
      // Check if we should close the circuit
      if (this.state.successCount >= this.config.minimumRequests) {
        this.state.state = 'CLOSED';
        this.state.failureCount = 0;
        this.eventEmitter.emit('circuit:closed', { 
          successCount: this.state.successCount 
        });
      }
    } else if (this.state.state === 'CLOSED') {
      // Reset failure count on success
      this.state.failureCount = Math.max(0, this.state.failureCount - 1);
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.state.failureCount++;
    this.state.totalRequests++;
    this.state.lastFailureTime = Date.now();
    
    if (this.state.state === 'HALF_OPEN') {
      // Transition back to OPEN
      this.state.state = 'OPEN';
      this.state.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
      this.eventEmitter.emit('circuit:opened', { 
        failureCount: this.state.failureCount 
      });
    } else if (this.state.state === 'CLOSED') {
      // Check if we should open the circuit
      if (this.state.failureCount >= this.config.failureThreshold) {
        this.state.state = 'OPEN';
        this.state.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
        this.eventEmitter.emit('circuit:opened', { 
          failureCount: this.state.failureCount 
        });
      }
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0,
      successCount: 0,
      totalRequests: 0
    };
    this.eventEmitter.emit('circuit:reset');
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

/**
 * Combined Retry Logic with Circuit Breaker
 */
export class AdvancedRetryLogic {
  private retry: ExponentialBackoffRetry;
  private circuitBreaker: CircuitBreaker;
  private eventEmitter: EventEmitter;

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    circuitBreakerConfig: Partial<CircuitBreakerConfig> = {}
  ) {
    this.retry = new ExponentialBackoffRetry(retryConfig);
    this.circuitBreaker = new CircuitBreaker(circuitBreakerConfig);
    this.eventEmitter = new EventEmitter();
    
    // Forward events
    this.retry.on('retry:attempt', (data) => this.eventEmitter.emit('retry:attempt', data));
    this.retry.on('retry:success', (data) => this.eventEmitter.emit('retry:success', data));
    this.retry.on('retry:retrying', (data) => this.eventEmitter.emit('retry:retrying', data));
    this.retry.on('retry:maxAttemptsReached', (data) => this.eventEmitter.emit('retry:maxAttemptsReached', data));
    
    this.circuitBreaker.on('circuit:open', (data) => this.eventEmitter.emit('circuit:open', data));
    this.circuitBreaker.on('circuit:closed', (data) => this.eventEmitter.emit('circuit:closed', data));
    this.circuitBreaker.on('circuit:halfOpen', (data) => this.eventEmitter.emit('circuit:halfOpen', data));
    this.circuitBreaker.on('circuit:opened', (data) => this.eventEmitter.emit('circuit:opened', data));
  }

  /**
   * Execute function with both retry logic and circuit breaker
   */
  async execute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<RetryResult<T>> {
    // First check circuit breaker
    const circuitResult = await this.circuitBreaker.execute(fn, context);
    
    if (circuitResult.circuitBreakerOpen) {
      return circuitResult;
    }
    
    if (circuitResult.success) {
      return circuitResult;
    }
    
    // If circuit breaker allows and we failed, try with retry logic
    return this.retry.execute(fn, context);
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(): CircuitBreakerState {
    return this.circuitBreaker.getState();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

/**
 * Retry Logic Manager for Autonomous Agents
 */
export class RetryLogicManager {
  private retryInstances: Map<string, AdvancedRetryLogic> = new Map();
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Get or create retry logic for a specific context
   */
  getRetryLogic(
    context: string,
    retryConfig?: Partial<RetryConfig>,
    circuitBreakerConfig?: Partial<CircuitBreakerConfig>
  ): AdvancedRetryLogic {
    if (!this.retryInstances.has(context)) {
      const retryLogic = new AdvancedRetryLogic(retryConfig, circuitBreakerConfig);
      
      // Forward events with context
      retryLogic.on('retry:attempt', (data) => 
        this.eventEmitter.emit('retry:attempt', { ...data, context })
      );
      retryLogic.on('retry:success', (data) => 
        this.eventEmitter.emit('retry:success', { ...data, context })
      );
      retryLogic.on('retry:retrying', (data) => 
        this.eventEmitter.emit('retry:retrying', { ...data, context })
      );
      retryLogic.on('retry:maxAttemptsReached', (data) => 
        this.eventEmitter.emit('retry:maxAttemptsReached', { ...data, context })
      );
      retryLogic.on('circuit:open', (data) => 
        this.eventEmitter.emit('circuit:open', { ...data, context })
      );
      retryLogic.on('circuit:closed', (data) => 
        this.eventEmitter.emit('circuit:closed', { ...data, context })
      );
      
      this.retryInstances.set(context, retryLogic);
    }
    
    return this.retryInstances.get(context)!;
  }

  /**
   * Execute with retry logic for specific context
   */
  async execute<T>(
    context: string,
    fn: () => Promise<T>,
    retryConfig?: Partial<RetryConfig>,
    circuitBreakerConfig?: Partial<CircuitBreakerConfig>
  ): Promise<RetryResult<T>> {
    const retryLogic = this.getRetryLogic(context, retryConfig, circuitBreakerConfig);
    return retryLogic.execute(fn, context);
  }

  /**
   * Get all circuit breaker states
   */
  getAllCircuitBreakerStates(): Record<string, CircuitBreakerState> {
    const states: Record<string, CircuitBreakerState> = {};
    
    for (const [context, retryLogic] of this.retryInstances) {
      states[context] = retryLogic.getCircuitBreakerState();
    }
    
    return states;
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    for (const retryLogic of this.retryInstances.values()) {
      retryLogic.resetCircuitBreaker();
    }
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

// Export singleton instance
export const retryLogicManager = new RetryLogicManager();

// Export default configurations
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: ['TIMEOUT', 'NETWORK_ERROR', 'RATE_LIMIT', 'TEMPORARY_FAILURE'],
  nonRetryableErrors: ['AUTHENTICATION_ERROR', 'PERMISSION_DENIED', 'INVALID_INPUT', 'NOT_FOUND']
};

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 60000,
  monitoringWindow: 300000,
  minimumRequests: 10
};

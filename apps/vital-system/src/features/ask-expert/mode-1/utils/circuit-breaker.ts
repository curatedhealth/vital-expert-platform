/**
 * Circuit Breaker Pattern for Mode 1
 * 
 * Prevents cascading failures by monitoring service health
 * and temporarily stopping requests when services are down
 */

import { CIRCUIT_BREAKER_CONFIG } from './circuit-breaker-config';
import { logger } from '@vital/utils';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  successThreshold?: number;
  resetTimeout?: number;
  monitoringWindow?: number;
  halfOpenMaxAttempts?: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failures detected, requests blocked
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export type CircuitBreakerStateChangeEvent = {
  circuitName: string;
  fromState: CircuitState;
  toState: CircuitState;
  timestamp: number;
  failureCount: number;
  successCount: number;
  reason?: string;
};

type StateChangeCallback = (event: CircuitBreakerStateChangeEvent) => void;

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: number;
  private successCount = 0;
  private stateChangeCallbacks: StateChangeCallback[] = [];

  constructor(
    private name: string,
    private options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 2,
      resetTimeout: options.resetTimeout ?? 60000, // 60 seconds
      monitoringWindow: options.monitoringWindow ?? 60000, // 60 seconds
      halfOpenMaxAttempts: options.halfOpenMaxAttempts ?? 2,
    };
  }

  /**
   * Subscribe to state change events for metrics tracking
   */
  onStateChange(callback: StateChangeCallback): () => void {
    this.stateChangeCallbacks.push(callback);
    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Emit state change event to all subscribers
   */
  private emitStateChange(
    fromState: CircuitState,
    toState: CircuitState,
    reason?: string
  ): void {
    const event: CircuitBreakerStateChangeEvent = {
      circuitName: this.name,
      fromState,
      toState,
      timestamp: Date.now(),
      failureCount: this.failureCount,
      successCount: this.successCount,
      reason,
    };
    
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        logger.error(`[Circuit Breaker: ${this.name}] Error in state change callback`, { error });
      }
    });
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
        const previousState = this.state;
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        logger.info('Circuit breaker attempting reset (HALF_OPEN)', { circuitName: this.name });
        this.emitStateChange(previousState, CircuitState.HALF_OPEN, 'Reset timeout reached, attempting recovery');
      } else {
        logger.warn('Circuit breaker OPEN - using fallback', { circuitName: this.name });
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
        logger.warn('Circuit breaker operation failed, using fallback', { circuitName: this.name, error });
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
      const successThreshold = this.options.successThreshold ?? 2;
      if (this.successCount >= successThreshold) {
        const previousState = this.state;
        const successCountAtTransition = this.successCount;
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        logger.info('Circuit breaker CLOSED - service recovered', {
          circuitName: this.name,
          successCount: successCountAtTransition,
        });
        this.emitStateChange(previousState, CircuitState.CLOSED, `Recovered after ${successCountAtTransition} successful attempts`);
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
      const previousState = this.state;
      this.state = CircuitState.OPEN;
      logger.error('Circuit breaker OPENED', { circuitName: this.name, failureCount: this.failureCount });
      this.emitStateChange(previousState, CircuitState.OPEN, `Threshold exceeded: ${this.failureCount} failures`);
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
    logger.info('Circuit breaker manually reset', { circuitName: this.name });
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
// Using centralized configuration constants
export const llmCircuitBreaker = new CircuitBreaker('LLM', CIRCUIT_BREAKER_CONFIG.LLM);

export const ragCircuitBreaker = new CircuitBreaker('RAG', CIRCUIT_BREAKER_CONFIG.RAG);

export const toolCircuitBreaker = new CircuitBreaker('Tools', CIRCUIT_BREAKER_CONFIG.TOOL);

// Metrics integration is lazy-loaded to avoid build-time analysis
// This prevents Next.js from analyzing the metrics import at build time
const setupMetricsTracking = () => {
  if (typeof window !== 'undefined') return; // Client-side, skip
  
  // Lazy load metrics service only when needed
  Promise.resolve().then(async () => {
    try {
      const { mode1MetricsService } = await import('../../ask-expert/mode-1/services/mode1-metrics');
      [llmCircuitBreaker, ragCircuitBreaker, toolCircuitBreaker].forEach(circuitBreaker => {
        circuitBreaker.onStateChange((event) => {
          // Track circuit breaker state changes in metrics
          mode1MetricsService.trackCircuitBreakerStateChange({
            circuitName: event.circuitName,
            state: event.toState,
            timestamp: event.timestamp,
            failureCount: event.failureCount,
          });
        });
      });
    } catch {
      // Metrics service not available, continue without it
      // Silently fail - metrics are optional
    }
  });
};

// Only set up metrics tracking in server environment
if (typeof window === 'undefined') {
  setupMetricsTracking();
}


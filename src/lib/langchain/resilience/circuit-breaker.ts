export interface CircuitBreakerConfig {
  threshold: number;        // Number of failures before opening
  timeout: number;          // Timeout for individual requests (ms)
  resetTime: number;        // Time to wait before trying again (ms)
  monitoringPeriod: number; // Time window for monitoring (ms)
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: CircuitState = 'closed';
  private successCount = 0;
  private requestCount = 0;
  private config: CircuitBreakerConfig;
  
  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      threshold: 5,
      timeout: 30000,
      resetTime: 60000,
      monitoringPeriod: 300000, // 5 minutes
      ...config
    };
  }
  
  async execute<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    const contextStr = context ? ` (${context})` : '';
    
    // Check if circuit is open
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime > this.config.resetTime) {
        console.log(`🔄 Circuit breaker transitioning to half-open${contextStr}`);
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        const remainingTime = this.config.resetTime - (Date.now() - this.lastFailTime);
        throw new Error(`Circuit breaker is OPEN${contextStr}. Try again in ${Math.ceil(remainingTime / 1000)}s`);
      }
    }
    
    this.requestCount++;
    
    try {
      // Execute with timeout
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeout)
        )
      ]);
      
      // Success - reset failure count
      this.failures = 0;
      this.successCount++;
      
      // If in half-open state and we have enough successes, close the circuit
      if (this.state === 'half-open' && this.successCount >= 3) {
        console.log(`✅ Circuit breaker closed${contextStr} - ${this.successCount} consecutive successes`);
        this.state = 'closed';
        this.successCount = 0;
      }
      
      return result;
      
    } catch (error) {
      this.failures++;
      this.lastFailTime = Date.now();
      
      console.warn(`⚠️ Circuit breaker failure${contextStr}: ${error instanceof Error ? error.message : 'Unknown error'} (${this.failures}/${this.config.threshold})`);
      
      // Check if we should open the circuit
      if (this.failures >= this.config.threshold) {
        console.error(`🚨 Circuit breaker OPENED${contextStr} - ${this.failures} consecutive failures`);
        this.state = 'open';
      }
      
      throw error;
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  getStats(): {
    state: CircuitState;
    failures: number;
    successes: number;
    requests: number;
    failureRate: number;
    lastFailTime: Date | null;
  } {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successCount,
      requests: this.requestCount,
      failureRate: this.requestCount > 0 ? this.failures / this.requestCount : 0,
      lastFailTime: this.lastFailTime > 0 ? new Date(this.lastFailTime) : null
    };
  }
  
  reset(): void {
    console.log('🔄 Circuit breaker reset');
    this.state = 'closed';
    this.failures = 0;
    this.successCount = 0;
    this.requestCount = 0;
    this.lastFailTime = 0;
  }
  
  // Check if circuit is healthy
  isHealthy(): boolean {
    return this.state === 'closed' || 
           (this.state === 'half-open' && this.successCount > 0);
  }
  
  // Get time until circuit can be retried
  getTimeUntilRetry(): number {
    if (this.state !== 'open') return 0;
    
    const timeSinceLastFail = Date.now() - this.lastFailTime;
    return Math.max(0, this.config.resetTime - timeSinceLastFail);
  }
}

// Pre-configured circuit breakers for different services
export const llmBreaker = new CircuitBreaker({
  threshold: 5,
  timeout: 30000,
  resetTime: 60000
});

export const toolBreaker = new CircuitBreaker({
  threshold: 3,
  timeout: 15000,
  resetTime: 30000
});

export const databaseBreaker = new CircuitBreaker({
  threshold: 10,
  timeout: 10000,
  resetTime: 30000
});

export const externalAPIBreaker = new CircuitBreaker({
  threshold: 3,
  timeout: 20000,
  resetTime: 60000
});

// Circuit breaker manager for monitoring
export class CircuitBreakerManager {
  private breakers = new Map<string, CircuitBreaker>();
  
  register(name: string, breaker: CircuitBreaker): void {
    this.breakers.set(name, breaker);
  }
  
  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }
  
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    
    return stats;
  }
  
  getUnhealthyBreakers(): string[] {
    const unhealthy: string[] = [];
    
    for (const [name, breaker] of this.breakers) {
      if (!breaker.isHealthy()) {
        unhealthy.push(name);
      }
    }
    
    return unhealthy;
  }
  
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// Global circuit breaker manager
export const circuitBreakerManager = new CircuitBreakerManager();

// Register default breakers
circuitBreakerManager.register('llm', llmBreaker);
circuitBreakerManager.register('tools', toolBreaker);
circuitBreakerManager.register('database', databaseBreaker);
circuitBreakerManager.register('external_api', externalAPIBreaker);

// Utility function to execute with circuit breaker
export async function withCircuitBreaker<T>(
  fn: () => Promise<T>,
  breakerName: string = 'default',
  context?: string
): Promise<T> {
  const breaker = circuitBreakerManager.get(breakerName) || llmBreaker;
  return breaker.execute(fn, context);
}

export default {
  CircuitBreaker,
  CircuitBreakerManager,
  circuitBreakerManager,
  withCircuitBreaker,
  llmBreaker,
  toolBreaker,
  databaseBreaker,
  externalAPIBreaker
};

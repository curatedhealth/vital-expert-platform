/**
 * Service Discovery System
 * Manages service registration, health checks, and load balancing
 */

import { createClient } from '@supabase/supabase-js';

export interface Service {
  id: string;
  name: string;
  type: 'api' | 'database' | 'cache' | 'queue' | 'storage' | 'external';
  url: string;
  version: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastHealthCheck: Date;
  metadata: {
    region?: string;
    environment: 'development' | 'staging' | 'production';
    capabilities: string[];
    dependencies: string[];
    loadBalancer?: {
      weight: number;
      maxConnections: number;
      currentConnections: number;
    };
  };
  healthCheck: {
    endpoint: string;
    interval: number; // seconds
    timeout: number; // milliseconds
    retries: number;
    expectedStatus: number[];
  };
}

export interface ServiceRegistry {
  services: Map<string, Service>;
  healthCheckInterval: number;
  maxRetries: number;
  circuitBreakerThreshold: number;
}

export interface LoadBalancingStrategy {
  name: string;
  selectService: (services: Service[]) => Service | null;
  weightFactors: {
    health: number;
    load: number;
    latency: number;
    availability: number;
  };
}

export interface HealthCheckResult {
  serviceId: string;
  healthy: boolean;
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export class ServiceDiscovery {
  private registry: ServiceRegistry;
  private supabase: any;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private loadBalancingStrategies: Map<string, LoadBalancingStrategy> = new Map();
  private healthCheckResults: Map<string, HealthCheckResult[]> = new Map();
  private circuitBreakers: Map<string, { failures: number; lastFailure: Date; open: boolean }> = new Map();

  constructor() {
    this.registry = {
      services: new Map(),
      healthCheckInterval: 30, // 30 seconds
      maxRetries: 3,
      circuitBreakerThreshold: 5
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    this.initializeLoadBalancingStrategies();
    this.startHealthChecks();
  }

  /**
   * Initialize load balancing strategies
   */
  private initializeLoadBalancingStrategies(): void {
    // Round Robin Strategy
    this.loadBalancingStrategies.set('round_robin', {
      name: 'round_robin',
      selectService: this.roundRobinSelection.bind(this),
      weightFactors: {
        health: 1.0,
        load: 0.0,
        latency: 0.0,
        availability: 0.0
      }
    });

    // Weighted Round Robin Strategy
    this.loadBalancingStrategies.set('weighted_round_robin', {
      name: 'weighted_round_robin',
      selectService: this.weightedRoundRobinSelection.bind(this),
      weightFactors: {
        health: 0.4,
        load: 0.3,
        latency: 0.2,
        availability: 0.1
      }
    });

    // Least Connections Strategy
    this.loadBalancingStrategies.set('least_connections', {
      name: 'least_connections',
      selectService: this.leastConnectionsSelection.bind(this),
      weightFactors: {
        health: 0.3,
        load: 0.5,
        latency: 0.1,
        availability: 0.1
      }
    });

    // Health-based Strategy
    this.loadBalancingStrategies.set('health_based', {
      name: 'health_based',
      selectService: this.healthBasedSelection.bind(this),
      weightFactors: {
        health: 0.6,
        load: 0.2,
        latency: 0.1,
        availability: 0.1
      }
    });
  }

  /**
   * Register a service
   */
  async registerService(service: Service): Promise<boolean> {
    try {
      console.log(`🔧 Registering service: ${service.name} (${service.id})`);
      
      // Add to local registry
      this.registry.services.set(service.id, service);
      
      // Store in database if available
      if (this.supabase) {
        await this.storeServiceInDatabase(service);
      }
      
      // Initialize circuit breaker
      this.circuitBreakers.set(service.id, {
        failures: 0,
        lastFailure: new Date(0),
        open: false
      });
      
      console.log(`✅ Service ${service.name} registered successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to register service ${service.name}:`, error);
      return false;
    }
  }

  /**
   * Unregister a service
   */
  async unregisterService(serviceId: string): Promise<boolean> {
    try {
      const service = this.registry.services.get(serviceId);
      if (!service) {
        console.warn(`Service ${serviceId} not found in registry`);
        return false;
      }

      console.log(`🗑️ Unregistering service: ${service.name} (${serviceId})`);
      
      // Remove from local registry
      this.registry.services.delete(serviceId);
      
      // Remove from database if available
      if (this.supabase) {
        await this.removeServiceFromDatabase(serviceId);
      }
      
      // Clean up circuit breaker
      this.circuitBreakers.delete(serviceId);
      
      console.log(`✅ Service ${service.name} unregistered successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to unregister service ${serviceId}:`, error);
      return false;
    }
  }

  /**
   * Discover services by type
   */
  discoverServices(type?: string, healthyOnly: boolean = true): Service[] {
    let services = Array.from(this.registry.services.values());
    
    // Filter by type if specified
    if (type) {
      services = services.filter(service => service.type === type);
    }
    
    // Filter by health status if requested
    if (healthyOnly) {
      services = services.filter(service => 
        service.status === 'healthy' && !this.isCircuitBreakerOpen(service.id)
      );
    }
    
    return services;
  }

  /**
   * Get a service by ID
   */
  getService(serviceId: string): Service | null {
    return this.registry.services.get(serviceId) || null;
  }

  /**
   * Select a service using load balancing
   */
  selectService(type: string, strategy: string = 'health_based'): Service | null {
    const services = this.discoverServices(type, true);
    
    if (services.length === 0) {
      console.warn(`No healthy services found for type: ${type}`);
      return null;
    }
    
    const strategyImpl = this.loadBalancingStrategies.get(strategy);
    if (!strategyImpl) {
      console.warn(`Load balancing strategy not found: ${strategy}`);
      return this.roundRobinSelection(services);
    }
    
    return strategyImpl.selectService(services);
  }

  /**
   * Perform health check on a service
   */
  async healthCheck(service: Service): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(service.healthCheck.endpoint, {
        method: 'GET',
        timeout: service.healthCheck.timeout,
        signal: AbortSignal.timeout(service.healthCheck.timeout)
      });
      
      const responseTime = Date.now() - startTime;
      const healthy = service.healthCheck.expectedStatus.includes(response.status);
      
      const result: HealthCheckResult = {
        serviceId: service.id,
        healthy,
        responseTime,
        statusCode: response.status,
        timestamp: new Date(),
        metadata: {
          endpoint: service.healthCheck.endpoint,
          expectedStatus: service.healthCheck.expectedStatus
        }
      };
      
      // Update service status
      this.updateServiceStatus(service.id, healthy ? 'healthy' : 'degraded');
      
      // Update circuit breaker
      this.updateCircuitBreaker(service.id, healthy);
      
      // Store health check result
      this.storeHealthCheckResult(result);
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: HealthCheckResult = {
        serviceId: service.id,
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        metadata: {
          endpoint: service.healthCheck.endpoint,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      };
      
      // Update service status
      this.updateServiceStatus(service.id, 'unhealthy');
      
      // Update circuit breaker
      this.updateCircuitBreaker(service.id, false);
      
      // Store health check result
      this.storeHealthCheckResult(result);
      
      return result;
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthChecks();
    }, this.registry.healthCheckInterval * 1000);
    
    console.log(`🏥 Started health checks every ${this.registry.healthCheckInterval} seconds`);
  }

  /**
   * Perform health checks on all services
   */
  private async performHealthChecks(): Promise<void> {
    const services = Array.from(this.registry.services.values());
    
    console.log(`🏥 Performing health checks on ${services.length} services`);
    
    const healthCheckPromises = services.map(service => 
      this.healthCheck(service).catch(error => {
        console.error(`Health check failed for ${service.name}:`, error);
        return {
          serviceId: service.id,
          healthy: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          metadata: {}
        } as HealthCheckResult;
      })
    );
    
    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      console.log('🛑 Health checks stopped');
    }
  }

  // Load balancing strategies
  private roundRobinSelection(services: Service[]): Service | null {
    if (services.length === 0) return null;
    
    // Simple round robin - would need state to be truly round robin
    const index = Math.floor(Math.random() * services.length);
    return services[index];
  }

  private weightedRoundRobinSelection(services: Service[]): Service | null {
    if (services.length === 0) return null;
    
    // Calculate weights based on service metadata
    const weights = services.map(service => {
      const loadBalancer = service.metadata.loadBalancer;
      return loadBalancer?.weight || 1;
    });
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < services.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return services[i];
      }
    }
    
    return services[services.length - 1];
  }

  private leastConnectionsSelection(services: Service[]): Service | null {
    if (services.length === 0) return null;
    
    return services.reduce((least, current) => {
      const leastConnections = least.metadata.loadBalancer?.currentConnections || 0;
      const currentConnections = current.metadata.loadBalancer?.currentConnections || 0;
      
      return currentConnections < leastConnections ? current : least;
    });
  }

  private healthBasedSelection(services: Service[]): Service | null {
    if (services.length === 0) return null;
    
    // Filter to only healthy services
    const healthyServices = services.filter(service => service.status === 'healthy');
    
    if (healthyServices.length === 0) {
      // Fallback to least degraded service
      return services.reduce((best, current) => {
        const bestScore = this.calculateHealthScore(best);
        const currentScore = this.calculateHealthScore(current);
        return currentScore > bestScore ? current : best;
      });
    }
    
    // Select from healthy services using weighted round robin
    return this.weightedRoundRobinSelection(healthyServices);
  }

  // Helper methods
  private calculateHealthScore(service: Service): number {
    let score = 0;
    
    // Base score from status
    switch (service.status) {
      case 'healthy': score += 100; break;
      case 'degraded': score += 50; break;
      case 'unhealthy': score += 0; break;
      case 'unknown': score += 25; break;
    }
    
    // Adjust based on recent health check results
    const recentResults = this.getRecentHealthCheckResults(service.id);
    if (recentResults.length > 0) {
      const avgResponseTime = recentResults.reduce((sum, result) => sum + result.responseTime, 0) / recentResults.length;
      const responseTimeScore = Math.max(0, 100 - (avgResponseTime / 10)); // Penalize slow responses
      score = (score + responseTimeScore) / 2;
    }
    
    return score;
  }

  private getRecentHealthCheckResults(serviceId: string, minutes: number = 5): HealthCheckResult[] {
    const results = this.healthCheckResults.get(serviceId) || [];
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    
    return results.filter(result => result.timestamp >= cutoff);
  }

  private isCircuitBreakerOpen(serviceId: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(serviceId);
    if (!circuitBreaker) return false;
    
    if (circuitBreaker.open) {
      // Check if enough time has passed to try again
      const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailure.getTime();
      const retryTimeout = 60000; // 1 minute
      
      if (timeSinceLastFailure > retryTimeout) {
        circuitBreaker.open = false;
        circuitBreaker.failures = 0;
        return false;
      }
    }
    
    return circuitBreaker.open;
  }

  private updateServiceStatus(serviceId: string, status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'): void {
    const service = this.registry.services.get(serviceId);
    if (service) {
      service.status = status;
      service.lastHealthCheck = new Date();
    }
  }

  private updateCircuitBreaker(serviceId: string, success: boolean): void {
    const circuitBreaker = this.circuitBreakers.get(serviceId);
    if (!circuitBreaker) return;
    
    if (success) {
      circuitBreaker.failures = 0;
      circuitBreaker.open = false;
    } else {
      circuitBreaker.failures++;
      circuitBreaker.lastFailure = new Date();
      
      if (circuitBreaker.failures >= this.registry.circuitBreakerThreshold) {
        circuitBreaker.open = true;
        console.warn(`🔴 Circuit breaker opened for service ${serviceId}`);
      }
    }
  }

  private storeHealthCheckResult(result: HealthCheckResult): void {
    const results = this.healthCheckResults.get(result.serviceId) || [];
    results.push(result);
    
    // Keep only last 100 results per service
    if (results.length > 100) {
      results.splice(0, results.length - 100);
    }
    
    this.healthCheckResults.set(result.serviceId, results);
  }

  private async storeServiceInDatabase(service: Service): Promise<void> {
    if (!this.supabase) return;
    
    try {
      await this.supabase
        .from('service_registry')
        .upsert({
          id: service.id,
          name: service.name,
          type: service.type,
          url: service.url,
          version: service.version,
          status: service.status,
          last_health_check: service.lastHealthCheck.toISOString(),
          metadata: service.metadata,
          health_check: service.healthCheck,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store service in database:', error);
    }
  }

  private async removeServiceFromDatabase(serviceId: string): Promise<void> {
    if (!this.supabase) return;
    
    try {
      await this.supabase
        .from('service_registry')
        .delete()
        .eq('id', serviceId);
    } catch (error) {
      console.error('Failed to remove service from database:', error);
    }
  }

  /**
   * Get service statistics
   */
  getServiceStats(): {
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    degradedServices: number;
    unknownServices: number;
  } {
    const services = Array.from(this.registry.services.values());
    
    return {
      totalServices: services.length,
      healthyServices: services.filter(s => s.status === 'healthy').length,
      unhealthyServices: services.filter(s => s.status === 'unhealthy').length,
      degradedServices: services.filter(s => s.status === 'degraded').length,
      unknownServices: services.filter(s => s.status === 'unknown').length
    };
  }

  /**
   * Get health check history for a service
   */
  getHealthCheckHistory(serviceId: string, limit: number = 50): HealthCheckResult[] {
    const results = this.healthCheckResults.get(serviceId) || [];
    return results.slice(-limit);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopHealthChecks();
    this.registry.services.clear();
    this.healthCheckResults.clear();
    this.circuitBreakers.clear();
  }
}

export const serviceDiscovery = new ServiceDiscovery();

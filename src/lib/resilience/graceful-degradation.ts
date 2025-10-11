/**
 * Graceful Degradation System
 * Implements fallback strategies and service degradation handling
 */

import { serviceDiscovery } from '../services/service-discovery';

import type { Service } from '../services/service-discovery';

export interface DegradationLevel {
  level: 'none' | 'minimal' | 'moderate' | 'severe' | 'critical';
  description: string;
  affectedServices: string[];
  fallbackStrategies: string[];
  userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  estimatedRecoveryTime: number; // minutes
}

export interface FallbackStrategy {
  id: string;
  name: string;
  description: string;
  triggerConditions: string[];
  implementation: (context: DegradationContext) => Promise<FallbackResult>;
  priority: number; // Higher number = higher priority
  dependencies: string[];
}

export interface DegradationContext {
  requestId: string;
  userId: string;
  serviceType: string;
  originalRequest: any;
  degradationLevel: DegradationLevel;
  availableServices: Service[];
  unavailableServices: string[];
  userPreferences: {
    allowDegradedMode: boolean;
    maxDegradationLevel: string;
    fallbackPreferences: string[];
  };
}

export interface FallbackResult {
  success: boolean;
  response: any;
  degradationLevel: string;
  fallbackStrategy: string;
  performanceImpact: {
    responseTime: number;
    accuracy: number;
    completeness: number;
  };
  metadata: Record<string, any>;
}

export interface DegradationMetrics {
  totalRequests: number;
  degradedRequests: number;
  degradationRate: number;
  averageDegradationLevel: number;
  fallbackSuccessRate: number;
  averageRecoveryTime: number;
}

export class GracefulDegradationManager {
  private fallbackStrategies: Map<string, FallbackStrategy> = new Map();
  private degradationHistory: DegradationLevel[] = [];
  private metrics: DegradationMetrics = {
    totalRequests: 0,
    degradedRequests: 0,
    degradationRate: 0,
    averageDegradationLevel: 0,
    fallbackSuccessRate: 0,
    averageRecoveryTime: 0
  };

  constructor() {
    this.initializeFallbackStrategies();
  }

  /**
   * Initialize fallback strategies
   */
  private initializeFallbackStrategies(): void {
    // Cached Response Strategy
    this.fallbackStrategies.set('cached_response', {
      id: 'cached_response',
      name: 'Cached Response',
      description: 'Serve cached responses when services are unavailable',
      triggerConditions: ['service_unavailable', 'timeout', 'high_latency'],
      implementation: this.implementCachedResponseFallback.bind(this),
      priority: 1,
      dependencies: ['cache_service']
    });

    // Simplified Response Strategy
    this.fallbackStrategies.set('simplified_response', {
      id: 'simplified_response',
      name: 'Simplified Response',
      description: 'Provide simplified responses with basic functionality',
      triggerConditions: ['service_degraded', 'partial_failure'],
      implementation: this.implementSimplifiedResponseFallback.bind(this),
      priority: 2,
      dependencies: ['basic_services']
    });

    // Alternative Service Strategy
    this.fallbackStrategies.set('alternative_service', {
      id: 'alternative_service',
      name: 'Alternative Service',
      description: 'Use alternative services when primary services fail',
      triggerConditions: ['service_unavailable', 'service_degraded'],
      implementation: this.implementAlternativeServiceFallback.bind(this),
      priority: 3,
      dependencies: ['service_discovery']
    });

    // Offline Mode Strategy
    this.fallbackStrategies.set('offline_mode', {
      id: 'offline_mode',
      name: 'Offline Mode',
      description: 'Enable offline mode with limited functionality',
      triggerConditions: ['critical_failure', 'network_unavailable'],
      implementation: this.implementOfflineModeFallback.bind(this),
      priority: 4,
      dependencies: ['local_storage', 'offline_data']
    });

    // Queue and Retry Strategy
    this.fallbackStrategies.set('queue_retry', {
      id: 'queue_retry',
      name: 'Queue and Retry',
      description: 'Queue requests for later processing when services recover',
      triggerConditions: ['temporary_failure', 'rate_limit'],
      implementation: this.implementQueueRetryFallback.bind(this),
      priority: 5,
      dependencies: ['queue_service', 'retry_mechanism']
    });
  }

  /**
   * Assess degradation level based on available services
   */
  async assessDegradationLevel(serviceType: string, context: any): Promise<DegradationLevel> {
    console.log(`🔍 Assessing degradation level for service type: ${serviceType}`);
    
    // Get available services
    const availableServices = serviceDiscovery.discoverServices(serviceType, true);
    const allServices = serviceDiscovery.discoverServices(serviceType, false);
    
    const unavailableServices = allServices
      .filter(service => !availableServices.some(available => available.id === service.id))
      .map(service => service.id);
    
    // Calculate degradation level
    const degradationLevel = this.calculateDegradationLevel(
      availableServices.length,
      allServices.length,
      unavailableServices
    );
    
    // Determine fallback strategies
    const fallbackStrategies = this.selectFallbackStrategies(degradationLevel, unavailableServices);
    
    // Estimate recovery time
    const estimatedRecoveryTime = this.estimateRecoveryTime(unavailableServices);
    
    const level: DegradationLevel = {
      level: degradationLevel.level,
      description: degradationLevel.description,
      affectedServices: unavailableServices,
      fallbackStrategies,
      userImpact: degradationLevel.userImpact,
      estimatedRecoveryTime
    };
    
    // Record degradation level
    this.recordDegradationLevel(level);
    
    return level;
  }

  /**
   * Handle request with graceful degradation
   */
  async handleRequestWithDegradation(
    serviceType: string,
    request: any,
    userId: string,
    userPreferences: any = {}
  ): Promise<FallbackResult> {
    this.metrics.totalRequests++;
    
    try {
      // Assess degradation level
      const degradationLevel = await this.assessDegradationLevel(serviceType, request);
      
      // Check if degradation is acceptable
      if (!this.isDegradationAcceptable(degradationLevel, userPreferences)) {
        throw new Error(`Degradation level ${degradationLevel.level} exceeds user tolerance`);
      }
      
      // If no degradation, proceed normally
      if (degradationLevel.level === 'none') {
        return await this.handleNormalRequest(serviceType, request);
      }
      
      // Apply graceful degradation
      this.metrics.degradedRequests++;
      const context: DegradationContext = {
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        serviceType,
        originalRequest: request,
        degradationLevel,
        availableServices: serviceDiscovery.discoverServices(serviceType, true),
        unavailableServices: degradationLevel.affectedServices,
        userPreferences: {
          allowDegradedMode: true,
          maxDegradationLevel: 'moderate',
          fallbackPreferences: ['cached_response', 'simplified_response'],
          ...userPreferences
        }
      };
      
      const result = await this.applyFallbackStrategies(context);
      
      // Update metrics
      this.updateMetrics(result);
      
      return result;
    } catch (error) {
      console.error('Graceful degradation failed:', error);
      
      // Return emergency fallback
      return this.createEmergencyFallback(serviceType, request, error);
    }
  }

  /**
   * Apply fallback strategies based on degradation level
   */
  private async applyFallbackStrategies(context: DegradationContext): Promise<FallbackResult> {
    const strategies = context.degradationLevel.fallbackStrategies;
    
    for (const strategyId of strategies) {
      const strategy = this.fallbackStrategies.get(strategyId);
      if (!strategy) continue;
      
      // Check if strategy can be applied
      if (!this.canApplyStrategy(strategy, context)) continue;
      
      try {
        console.log(`🔄 Applying fallback strategy: ${strategy.name}`);
        const result = await strategy.implementation(context);
        
        if (result.success) {
          console.log(`✅ Fallback strategy ${strategy.name} succeeded`);
          return result;
        }
      } catch (error) {
        console.error(`❌ Fallback strategy ${strategy.name} failed:`, error);
        continue;
      }
    }
    
    // If no strategy succeeded, return failure
    throw new Error('All fallback strategies failed');
  }

  // Fallback strategy implementations
  private async implementCachedResponseFallback(context: DegradationContext): Promise<FallbackResult> {
    console.log('📦 Implementing cached response fallback');
    
    // Simulate cached response retrieval
    const cachedResponse = await this.getCachedResponse(context.originalRequest);
    
    if (!cachedResponse) {
      return {
        success: false,
        response: null,
        degradationLevel: context.degradationLevel.level,
        fallbackStrategy: 'cached_response',
        performanceImpact: {
          responseTime: 0,
          accuracy: 0,
          completeness: 0
        },
        metadata: { error: 'No cached response available' }
      };
    }
    
    return {
      success: true,
      response: {
        ...cachedResponse,
        metadata: {
          ...cachedResponse.metadata,
          cached: true,
          cacheAge: this.calculateCacheAge(cachedResponse.timestamp),
          degradationLevel: context.degradationLevel.level
        }
      },
      degradationLevel: context.degradationLevel.level,
      fallbackStrategy: 'cached_response',
      performanceImpact: {
        responseTime: 50, // Fast response from cache
        accuracy: 0.8, // Slightly reduced accuracy
        completeness: 0.9 // High completeness
      },
      metadata: {
        cacheHit: true,
        originalRequest: context.originalRequest
      }
    };
  }

  private async implementSimplifiedResponseFallback(context: DegradationContext): Promise<FallbackResult> {
    console.log('🔧 Implementing simplified response fallback');
    
    // Create simplified response based on available services
    const simplifiedResponse = await this.createSimplifiedResponse(context);
    
    return {
      success: true,
      response: simplifiedResponse,
      degradationLevel: context.degradationLevel.level,
      fallbackStrategy: 'simplified_response',
      performanceImpact: {
        responseTime: 200, // Moderate response time
        accuracy: 0.6, // Reduced accuracy
        completeness: 0.7 // Reduced completeness
      },
      metadata: {
        simplified: true,
        availableServices: context.availableServices.map(s => s.id)
      }
    };
  }

  private async implementAlternativeServiceFallback(context: DegradationContext): Promise<FallbackResult> {
    console.log('🔄 Implementing alternative service fallback');
    
    // Find alternative services
    const alternativeServices = await this.findAlternativeServices(context);
    
    if (alternativeServices.length === 0) {
      return {
        success: false,
        response: null,
        degradationLevel: context.degradationLevel.level,
        fallbackStrategy: 'alternative_service',
        performanceImpact: {
          responseTime: 0,
          accuracy: 0,
          completeness: 0
        },
        metadata: { error: 'No alternative services available' }
      };
    }
    
    // Use the best alternative service
    const bestAlternative = alternativeServices[0];
    const response = await this.callAlternativeService(bestAlternative, context.originalRequest);
    
    return {
      success: true,
      response,
      degradationLevel: context.degradationLevel.level,
      fallbackStrategy: 'alternative_service',
      performanceImpact: {
        responseTime: 300, // Slower response time
        accuracy: 0.7, // Good accuracy
        completeness: 0.8 // Good completeness
      },
      metadata: {
        alternativeService: bestAlternative.id,
        originalService: context.serviceType
      }
    };
  }

  private async implementOfflineModeFallback(context: DegradationContext): Promise<FallbackResult> {
    console.log('📱 Implementing offline mode fallback');
    
    // Create offline response
    const offlineResponse = await this.createOfflineResponse(context);
    
    return {
      success: true,
      response: offlineResponse,
      degradationLevel: context.degradationLevel.level,
      fallbackStrategy: 'offline_mode',
      performanceImpact: {
        responseTime: 100, // Fast local response
        accuracy: 0.5, // Reduced accuracy
        completeness: 0.6 // Reduced completeness
      },
      metadata: {
        offline: true,
        localData: true
      }
    };
  }

  private async implementQueueRetryFallback(context: DegradationContext): Promise<FallbackResult> {
    console.log('⏳ Implementing queue and retry fallback');
    
    // Queue the request for later processing
    const queueResult = await this.queueRequest(context);
    
    if (!queueResult.success) {
      return {
        success: false,
        response: null,
        degradationLevel: context.degradationLevel.level,
        fallbackStrategy: 'queue_retry',
        performanceImpact: {
          responseTime: 0,
          accuracy: 0,
          completeness: 0
        },
        metadata: { error: 'Failed to queue request' }
      };
    }
    
    // Return acknowledgment response
    return {
      success: true,
      response: {
        message: 'Request queued for processing',
        queueId: queueResult.queueId,
        estimatedProcessingTime: queueResult.estimatedTime,
        status: 'queued'
      },
      degradationLevel: context.degradationLevel.level,
      fallbackStrategy: 'queue_retry',
      performanceImpact: {
        responseTime: 50, // Fast acknowledgment
        accuracy: 1.0, // Perfect accuracy for acknowledgment
        completeness: 0.3 // Low completeness (just acknowledgment)
      },
      metadata: {
        queued: true,
        queueId: queueResult.queueId
      }
    };
  }

  // Helper methods
  private calculateDegradationLevel(
    availableCount: number,
    totalCount: number,
    unavailableServices: string[]
  ): { level: DegradationLevel['level']; description: string; userImpact: DegradationLevel['userImpact'] } {
    if (availableCount === totalCount) {
      return {
        level: 'none',
        description: 'All services operational',
        userImpact: 'none'
      };
    }
    
    const degradationRatio = unavailableServices.length / totalCount;
    
    if (degradationRatio <= 0.2) {
      return {
        level: 'minimal',
        description: 'Minor service degradation',
        userImpact: 'low'
      };
    } else if (degradationRatio <= 0.5) {
      return {
        level: 'moderate',
        description: 'Moderate service degradation',
        userImpact: 'medium'
      };
    } else if (degradationRatio <= 0.8) {
      return {
        level: 'severe',
        description: 'Severe service degradation',
        userImpact: 'high'
      };
    } else {
      return {
        level: 'critical',
        description: 'Critical service degradation',
        userImpact: 'critical'
      };
    }
  }

  private selectFallbackStrategies(level: DegradationLevel, unavailableServices: string[]): string[] {
    const strategies: string[] = [];
    
    // Always try cached response first
    strategies.push('cached_response');
    
    if (level.level === 'minimal' || level.level === 'moderate') {
      strategies.push('simplified_response');
      strategies.push('alternative_service');
    }
    
    if (level.level === 'severe') {
      strategies.push('alternative_service');
      strategies.push('queue_retry');
    }
    
    if (level.level === 'critical') {
      strategies.push('offline_mode');
      strategies.push('queue_retry');
    }
    
    return strategies;
  }

  private estimateRecoveryTime(unavailableServices: string[]): number {
    // Simple estimation based on number of unavailable services
    return Math.min(60, unavailableServices.length * 5); // 5 minutes per service, max 60 minutes
  }

  private isDegradationAcceptable(level: DegradationLevel, userPreferences: any): boolean {
    const maxLevel = userPreferences.maxDegradationLevel || 'moderate';
    const levelOrder = ['none', 'minimal', 'moderate', 'severe', 'critical'];
    
    const currentLevelIndex = levelOrder.indexOf(level.level);
    const maxLevelIndex = levelOrder.indexOf(maxLevel);
    
    return currentLevelIndex <= maxLevelIndex;
  }

  private async handleNormalRequest(serviceType: string, request: any): Promise<FallbackResult> {
    // Simulate normal request handling
    return {
      success: true,
      response: { message: 'Normal response', data: request },
      degradationLevel: 'none',
      fallbackStrategy: 'none',
      performanceImpact: {
        responseTime: 100,
        accuracy: 1.0,
        completeness: 1.0
      },
      metadata: { normal: true }
    };
  }

  private canApplyStrategy(strategy: FallbackStrategy, context: DegradationContext): boolean {
    // Check if all dependencies are available
    return strategy.dependencies.every(dep => {
      if (dep === 'service_discovery') return true;
      if (dep === 'cache_service') return true; // Assume cache is always available
      if (dep === 'basic_services') return context.availableServices.length > 0;
      if (dep === 'local_storage') return true; // Assume local storage is available
      if (dep === 'offline_data') return true; // Assume offline data is available
      if (dep === 'queue_service') return true; // Assume queue service is available
      if (dep === 'retry_mechanism') return true; // Assume retry mechanism is available
      return false;
    });
  }

  private async getCachedResponse(request: any): Promise<any> {
    // Simulate cached response retrieval
    return {
      message: 'Cached response',
      data: request,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      cached: true
    };
  }

  private calculateCacheAge(timestamp: Date): number {
    return Date.now() - timestamp.getTime();
  }

  private async createSimplifiedResponse(context: DegradationContext): Promise<any> {
    return {
      message: 'Simplified response due to service degradation',
      data: context.originalRequest,
      simplified: true,
      availableFeatures: context.availableServices.map(s => s.name),
      degradedFeatures: context.unavailableServices
    };
  }

  private async findAlternativeServices(context: DegradationContext): Promise<Service[]> {
    // Find services with similar capabilities
    return context.availableServices.filter(service => 
      service.metadata.capabilities?.some(cap => 
        context.serviceType.toLowerCase().includes(cap.toLowerCase())
      )
    );
  }

  private async callAlternativeService(service: Service, request: any): Promise<any> {
    // Simulate calling alternative service
    return {
      message: `Response from alternative service: ${service.name}`,
      data: request,
      serviceId: service.id
    };
  }

  private async createOfflineResponse(context: DegradationContext): Promise<any> {
    return {
      message: 'Offline mode - limited functionality available',
      data: context.originalRequest,
      offline: true,
      availableFeatures: ['basic_search', 'cached_data'],
      unavailableFeatures: ['real_time_data', 'live_updates']
    };
  }

  private async queueRequest(context: DegradationContext): Promise<{ success: boolean; queueId?: string; estimatedTime?: number }> {
    // Simulate queuing request
    return {
      success: true,
      queueId: `queue-${Date.now()}`,
      estimatedTime: context.degradationLevel.estimatedRecoveryTime
    };
  }

  private createEmergencyFallback(serviceType: string, request: any, error: any): FallbackResult {
    return {
      success: false,
      response: {
        error: 'Service temporarily unavailable',
        message: 'Please try again later',
        serviceType,
        timestamp: new Date().toISOString()
      },
      degradationLevel: 'critical',
      fallbackStrategy: 'emergency',
      performanceImpact: {
        responseTime: 0,
        accuracy: 0,
        completeness: 0
      },
      metadata: {
        emergency: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }

  private recordDegradationLevel(level: DegradationLevel): void {
    this.degradationHistory.push(level);
    
    // Keep only last 1000 records
    if (this.degradationHistory.length > 1000) {
      this.degradationHistory = this.degradationHistory.slice(-1000);
    }
  }

  private updateMetrics(result: FallbackResult): void {
    this.metrics.degradationRate = this.metrics.degradedRequests / this.metrics.totalRequests;
    
    // Update average degradation level
    const levelValues = { none: 0, minimal: 1, moderate: 2, severe: 3, critical: 4 };
    const currentLevel = levelValues[result.degradationLevel as keyof typeof levelValues] || 0;
    this.metrics.averageDegradationLevel = 
      (this.metrics.averageDegradationLevel * (this.metrics.degradedRequests - 1) + currentLevel) / 
      this.metrics.degradedRequests;
    
    // Update fallback success rate
    if (result.success) {
      this.metrics.fallbackSuccessRate = 
        (this.metrics.fallbackSuccessRate * (this.metrics.degradedRequests - 1) + 1) / 
        this.metrics.degradedRequests;
    }
  }

  /**
   * Get degradation metrics
   */
  getMetrics(): DegradationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get degradation history
   */
  getDegradationHistory(): DegradationLevel[] {
    return [...this.degradationHistory];
  }

  /**
   * Get available fallback strategies
   */
  getFallbackStrategies(): FallbackStrategy[] {
    return Array.from(this.fallbackStrategies.values());
  }
}

export const gracefulDegradationManager = new GracefulDegradationManager();

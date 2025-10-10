/**
 * Fallback Strategies
 * Implements various fallback mechanisms for service degradation
 */

import type { DegradationContext, FallbackResult } from './graceful-degradation';

export interface CacheStrategy {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any, ttl?: number) => Promise<void>;
  has: (key: string) => Promise<boolean>;
  delete: (key: string) => Promise<void>;
}

export interface QueueStrategy {
  enqueue: (queueName: string, data: any, options?: any) => Promise<string>;
  dequeue: (queueName: string) => Promise<any>;
  getQueueStatus: (queueName: string) => Promise<{ length: number; processing: number }>;
}

export interface RetryStrategy {
  execute: <T>(operation: () => Promise<T>, options?: RetryOptions) => Promise<T>;
  schedule: (operation: () => Promise<any>, delay: number) => Promise<void>;
}

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition: (error: any) => boolean;
}

export interface OfflineDataStrategy {
  store: (key: string, data: any) => Promise<void>;
  retrieve: (key: string) => Promise<any>;
  search: (query: string) => Promise<any[]>;
  sync: () => Promise<void>;
}

export class FallbackStrategies {
  private cache: CacheStrategy;
  private queue: QueueStrategy;
  private retry: RetryStrategy;
  private offlineData: OfflineDataStrategy;

  constructor() {
    this.cache = new MemoryCacheStrategy();
    this.queue = new MemoryQueueStrategy();
    this.retry = new ExponentialBackoffRetryStrategy();
    this.offlineData = new LocalStorageOfflineDataStrategy();
  }

  /**
   * Cached Response Fallback
   */
  async cachedResponseFallback(context: DegradationContext): Promise<FallbackResult> {
    try {
      const cacheKey = this.generateCacheKey(context.originalRequest);
      
      // Try to get cached response
      const cachedResponse = await this.cache.get(cacheKey);
      
      if (cachedResponse) {
        const cacheAge = Date.now() - cachedResponse.timestamp;
        const maxAge = 300000; // 5 minutes
        
        if (cacheAge < maxAge) {
          return {
            success: true,
            response: {
              ...cachedResponse.data,
              metadata: {
                ...cachedResponse.data.metadata,
                cached: true,
                cacheAge,
                degradationLevel: context.degradationLevel.level
              }
            },
            degradationLevel: context.degradationLevel.level,
            fallbackStrategy: 'cached_response',
            performanceImpact: {
              responseTime: 50,
              accuracy: 0.8,
              completeness: 0.9
            },
            metadata: {
              cacheHit: true,
              cacheAge,
              originalRequest: context.originalRequest
            }
          };
        }
      }
      
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
        metadata: { error: 'No valid cached response available' }
      };
    } catch (error) {
      console.error('Cached response fallback failed:', error);
      return this.createErrorFallback(context, 'cached_response', error);
    }
  }

  /**
   * Simplified Response Fallback
   */
  async simplifiedResponseFallback(context: DegradationContext): Promise<FallbackResult> {
    try {
      const simplifiedResponse = await this.createSimplifiedResponse(context);
      
      return {
        success: true,
        response: simplifiedResponse,
        degradationLevel: context.degradationLevel.level,
        fallbackStrategy: 'simplified_response',
        performanceImpact: {
          responseTime: 200,
          accuracy: 0.6,
          completeness: 0.7
        },
        metadata: {
          simplified: true,
          availableServices: context.availableServices.map(s => s.id),
          simplifiedFeatures: this.getSimplifiedFeatures(context)
        }
      };
    } catch (error) {
      console.error('Simplified response fallback failed:', error);
      return this.createErrorFallback(context, 'simplified_response', error);
    }
  }

  /**
   * Alternative Service Fallback
   */
  async alternativeServiceFallback(context: DegradationContext): Promise<FallbackResult> {
    try {
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
      
      // Try alternative services in order of preference
      for (const service of alternativeServices) {
        try {
          const response = await this.callAlternativeService(service, context.originalRequest);
          
          return {
            success: true,
            response,
            degradationLevel: context.degradationLevel.level,
            fallbackStrategy: 'alternative_service',
            performanceImpact: {
              responseTime: 300,
              accuracy: 0.7,
              completeness: 0.8
            },
            metadata: {
              alternativeService: service.id,
              originalService: context.serviceType,
              serviceUrl: service.url
            }
          };
        } catch (error) {
          console.warn(`Alternative service ${service.id} failed:`, error);
          continue;
        }
      }
      
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
        metadata: { error: 'All alternative services failed' }
      };
    } catch (error) {
      console.error('Alternative service fallback failed:', error);
      return this.createErrorFallback(context, 'alternative_service', error);
    }
  }

  /**
   * Offline Mode Fallback
   */
  async offlineModeFallback(context: DegradationContext): Promise<FallbackResult> {
    try {
      const offlineResponse = await this.createOfflineResponse(context);
      
      return {
        success: true,
        response: offlineResponse,
        degradationLevel: context.degradationLevel.level,
        fallbackStrategy: 'offline_mode',
        performanceImpact: {
          responseTime: 100,
          accuracy: 0.5,
          completeness: 0.6
        },
        metadata: {
          offline: true,
          localData: true,
          lastSync: await this.getLastSyncTime()
        }
      };
    } catch (error) {
      console.error('Offline mode fallback failed:', error);
      return this.createErrorFallback(context, 'offline_mode', error);
    }
  }

  /**
   * Queue and Retry Fallback
   */
  async queueRetryFallback(context: DegradationContext): Promise<FallbackResult> {
    try {
      const queueName = `requests-${context.serviceType}`;
      const queueData = {
        requestId: context.requestId,
        userId: context.userId,
        serviceType: context.serviceType,
        originalRequest: context.originalRequest,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3
      };
      
      const queueId = await this.queue.enqueue(queueName, queueData, {
        priority: this.calculatePriority(context),
        delay: this.calculateDelay(context)
      });
      
      // Schedule retry
      await this.retry.schedule(async () => {
        await this.processQueuedRequest(queueId, queueData);
      }, this.calculateDelay(context));
      
      return {
        success: true,
        response: {
          message: 'Request queued for processing',
          queueId,
          estimatedProcessingTime: context.degradationLevel.estimatedRecoveryTime,
          status: 'queued',
          retrySchedule: this.getRetrySchedule(context)
        },
        degradationLevel: context.degradationLevel.level,
        fallbackStrategy: 'queue_retry',
        performanceImpact: {
          responseTime: 50,
          accuracy: 1.0,
          completeness: 0.3
        },
        metadata: {
          queued: true,
          queueId,
          queueName,
          estimatedRecoveryTime: context.degradationLevel.estimatedRecoveryTime
        }
      };
    } catch (error) {
      console.error('Queue retry fallback failed:', error);
      return this.createErrorFallback(context, 'queue_retry', error);
    }
  }

  // Helper methods
  private generateCacheKey(request: any): string {
    const keyData = {
      serviceType: request.serviceType || 'unknown',
      userId: request.userId || 'anonymous',
      query: request.query || request.message || '',
      timestamp: Math.floor(Date.now() / 300000) * 300000 // 5-minute buckets
    };
    
    return `cache:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  private async createSimplifiedResponse(context: DegradationContext): Promise<any> {
    const baseResponse = {
      message: 'Simplified response due to service degradation',
      data: context.originalRequest,
      simplified: true,
      timestamp: new Date().toISOString(),
      degradationLevel: context.degradationLevel.level
    };
    
    // Add simplified features based on available services
    const simplifiedFeatures = this.getSimplifiedFeatures(context);
    
    return {
      ...baseResponse,
      availableFeatures: simplifiedFeatures,
      degradedFeatures: context.unavailableServices,
      recommendations: this.getSimplifiedRecommendations(context)
    };
  }

  private getSimplifiedFeatures(context: DegradationContext): string[] {
    const features: string[] = [];
    
    // Basic features that are always available
    features.push('basic_search', 'cached_data', 'offline_mode');
    
    // Add features based on available services
    context.availableServices.forEach(service => {
      if (service.metadata.capabilities) {
        features.push(...service.metadata.capabilities);
      }
    });
    
    return [...new Set(features)];
  }

  private getSimplifiedRecommendations(context: DegradationContext): string[] {
    const recommendations: string[] = [];
    
    if (context.degradationLevel.level === 'moderate') {
      recommendations.push('Try again in a few minutes', 'Use cached data if available');
    } else if (context.degradationLevel.level === 'severe') {
      recommendations.push('Service is experiencing issues', 'Please try again later', 'Contact support if urgent');
    } else if (context.degradationLevel.level === 'critical') {
      recommendations.push('Service is temporarily unavailable', 'Please try again later', 'Contact support immediately');
    }
    
    return recommendations;
  }

  private async findAlternativeServices(context: DegradationContext): Promise<any[]> {
    // Find services with similar capabilities
    const alternatives: any[] = [];
    
    context.availableServices.forEach(service => {
      if (service.metadata.capabilities) {
        const hasRelevantCapability = service.metadata.capabilities.some((cap: string) => 
          context.serviceType.toLowerCase().includes(cap.toLowerCase()) ||
          cap.toLowerCase().includes(context.serviceType.toLowerCase())
        );
        
        if (hasRelevantCapability) {
          alternatives.push(service);
        }
      }
    });
    
    // Sort by relevance and health
    return alternatives.sort((a, b) => {
      const aScore = this.calculateServiceScore(a);
      const bScore = this.calculateServiceScore(b);
      return bScore - aScore;
    });
  }

  private calculateServiceScore(service: any): number {
    let score = 0;
    
    // Health score
    if (service.status === 'healthy') score += 100;
    else if (service.status === 'degraded') score += 50;
    else if (service.status === 'unhealthy') score += 0;
    
    // Capability score
    if (service.metadata.capabilities) {
      score += service.metadata.capabilities.length * 10;
    }
    
    // Authority score
    if (service.metadata.authority) {
      score += service.metadata.authority * 20;
    }
    
    return score;
  }

  private async callAlternativeService(service: any, request: any): Promise<any> {
    // Simulate calling alternative service
    // In production, this would make actual HTTP calls
    
    return {
      message: `Response from alternative service: ${service.name}`,
      data: request,
      serviceId: service.id,
      serviceUrl: service.url,
      alternative: true,
      timestamp: new Date().toISOString()
    };
  }

  private async createOfflineResponse(context: DegradationContext): Promise<any> {
    // Get offline data
    const offlineData = await this.offlineData.search(context.originalRequest.query || '');
    
    return {
      message: 'Offline mode - limited functionality available',
      data: context.originalRequest,
      offline: true,
      offlineData,
      availableFeatures: ['basic_search', 'cached_data', 'offline_storage'],
      unavailableFeatures: ['real_time_data', 'live_updates', 'live_chat'],
      lastSync: await this.getLastSyncTime(),
      timestamp: new Date().toISOString()
    };
  }

  private async getLastSyncTime(): Promise<string> {
    // Simulate getting last sync time
    return new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
  }

  private calculatePriority(context: DegradationContext): number {
    // Higher priority for more critical requests
    const levelPriority = {
      'none': 0,
      'minimal': 1,
      'moderate': 2,
      'severe': 3,
      'critical': 4
    };
    
    return levelPriority[context.degradationLevel.level] || 0;
  }

  private calculateDelay(context: DegradationContext): number {
    // Calculate delay based on degradation level
    const baseDelay = 30000; // 30 seconds
    const levelMultiplier = {
      'none': 0,
      'minimal': 1,
      'moderate': 2,
      'severe': 3,
      'critical': 4
    };
    
    return baseDelay * (levelMultiplier[context.degradationLevel.level] || 1);
  }

  private getRetrySchedule(context: DegradationContext): string[] {
    const delays = [
      this.calculateDelay(context),
      this.calculateDelay(context) * 2,
      this.calculateDelay(context) * 4
    ];
    
    return delays.map((delay, index) => 
      `Retry ${index + 1}: ${new Date(Date.now() + delay).toISOString()}`
    );
  }

  private async processQueuedRequest(queueId: string, queueData: any): Promise<void> {
    try {
      console.log(`Processing queued request: ${queueId}`);
      
      // Simulate processing the queued request
      // In production, this would retry the original service call
      
      // Update retry count
      queueData.retryCount++;
      
      if (queueData.retryCount < queueData.maxRetries) {
        // Schedule another retry
        await this.retry.schedule(async () => {
          await this.processQueuedRequest(queueId, queueData);
        }, this.calculateDelay({ degradationLevel: { level: 'moderate' } } as DegradationContext));
      } else {
        console.log(`Max retries reached for request: ${queueId}`);
        // Handle max retries reached
      }
    } catch (error) {
      console.error(`Failed to process queued request ${queueId}:`, error);
    }
  }

  private createErrorFallback(context: DegradationContext, strategy: string, error: any): FallbackResult {
    return {
      success: false,
      response: {
        error: 'Fallback strategy failed',
        message: 'Please try again later',
        strategy,
        timestamp: new Date().toISOString()
      },
      degradationLevel: context.degradationLevel.level,
      fallbackStrategy: strategy,
      performanceImpact: {
        responseTime: 0,
        accuracy: 0,
        completeness: 0
      },
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        strategy,
        failed: true
      }
    };
  }
}

// Strategy implementations
class MemoryCacheStrategy implements CacheStrategy {
  private cache = new Map<string, { data: any; timestamp: number; ttl?: number }>();

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    });
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

class MemoryQueueStrategy implements QueueStrategy {
  private queues = new Map<string, any[]>();
  private processing = new Map<string, number>();

  async enqueue(queueName: string, data: any, options?: any): Promise<string> {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      this.processing.set(queueName, 0);
    }
    
    const queue = this.queues.get(queueName)!;
    const queueId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    queue.push({ ...data, queueId, options });
    
    return queueId;
  }

  async dequeue(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue || queue.length === 0) return null;
    
    const processing = this.processing.get(queueName) || 0;
    this.processing.set(queueName, processing + 1);
    
    return queue.shift();
  }

  async getQueueStatus(queueName: string): Promise<{ length: number; processing: number }> {
    const queue = this.queues.get(queueName) || [];
    const processing = this.processing.get(queueName) || 0;
    
    return { length: queue.length, processing };
  }
}

class ExponentialBackoffRetryStrategy implements RetryStrategy {
  async execute<T>(operation: () => Promise<T>, options: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: () => true
  }): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === options.maxAttempts || !options.retryCondition(error)) {
          throw error;
        }
        
        const delay = Math.min(
          options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1),
          options.maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  async schedule(operation: () => Promise<any>, delay: number): Promise<void> {
    setTimeout(async () => {
      try {
        await operation();
      } catch (error) {
        console.error('Scheduled operation failed:', error);
      }
    }, delay);
  }
}

class LocalStorageOfflineDataStrategy implements OfflineDataStrategy {
  private storageKey = 'offline_data';

  async store(key: string, data: any): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      const offlineData = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      offlineData[key] = { data, timestamp: Date.now() };
      localStorage.setItem(this.storageKey, JSON.stringify(offlineData));
    }
  }

  async retrieve(key: string): Promise<any> {
    if (typeof window !== 'undefined' && window.localStorage) {
      const offlineData = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      return offlineData[key]?.data;
    }
    return null;
  }

  async search(query: string): Promise<any[]> {
    if (typeof window !== 'undefined' && window.localStorage) {
      const offlineData = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      const results: any[] = [];
      
      for (const [key, value] of Object.entries(offlineData)) {
        if (key.toLowerCase().includes(query.toLowerCase()) || 
            JSON.stringify(value).toLowerCase().includes(query.toLowerCase())) {
          results.push({ key, ...value });
        }
      }
      
      return results;
    }
    return [];
  }

  async sync(): Promise<void> {
    // Simulate sync with server
    console.log('Syncing offline data...');
  }
}

export const fallbackStrategies = new FallbackStrategies();

import { EventEmitter } from 'events';
import { autonomousCacheManager } from './redis-cache';
import { loadBalancer } from './load-balancer';

/**
 * Advanced Analytics and Performance Insights for Autonomous Agents
 * Provides comprehensive metrics, usage analytics, and performance insights
 */

export interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  agentId?: string;
  executionId?: string;
  taskId?: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  executionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  totalCost: number;
  tasksCompleted: number;
  tasksFailed: number;
  evidenceCollected: number;
  memoryUsage: number;
  errorRate: number;
  throughput: number;
  confidenceScore: number;
  success: boolean;
  nodeId?: string;
  region?: string;
}

export interface UsageAnalytics {
  userId: string;
  sessionId: string;
  timestamp: number;
  action: string;
  agentId?: string;
  duration?: number;
  cost?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface SystemInsights {
  timestamp: number;
  totalExecutions: number;
  averageExecutionTime: number;
  averageCost: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
  popularAgents: Array<{ agentId: string; usage: number }>;
  errorPatterns: Array<{ error: string; count: number }>;
  performanceTrends: {
    executionTime: number[];
    cost: number[];
    successRate: number[];
    throughput: number[];
  };
}

export interface UserBehavior {
  userId: string;
  totalSessions: number;
  averageSessionDuration: number;
  favoriteAgents: string[];
  usagePatterns: {
    hourOfDay: number[];
    dayOfWeek: number[];
    month: number[];
  };
  costAnalysis: {
    totalCost: number;
    averageCostPerSession: number;
    costByAgent: Record<string, number>;
  };
  successRate: number;
  lastActive: number;
}

/**
 * Analytics Event Collector
 */
export class AnalyticsEventCollector {
  private events: AnalyticsEvent[] = [];
  private eventEmitter: EventEmitter;
  private maxEvents: number = 10000;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Collect an analytics event
   */
  collect(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    const analyticsEvent: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...event
    };

    this.events.push(analyticsEvent);
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    this.eventEmitter.emit('analytics:event', analyticsEvent);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string, limit: number = 100): AnalyticsEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit);
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string, limit: number = 100): AnalyticsEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .slice(-limit);
  }

  /**
   * Get events by time range
   */
  getEventsByTimeRange(startTime: number, endTime: number): AnalyticsEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  /**
   * Get all events
   */
  getAllEvents(limit: number = 1000): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear old events
   */
  clearOldEvents(olderThan: number): void {
    this.events = this.events.filter(event => event.timestamp > olderThan);
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
 * Performance Metrics Collector
 */
export class PerformanceMetricsCollector {
  private metrics: PerformanceMetrics[] = [];
  private eventEmitter: EventEmitter;
  private maxMetrics: number = 5000;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Record performance metrics
   */
  record(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Maintain max metrics limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    this.eventEmitter.emit('performance:recorded', metrics);
  }

  /**
   * Get metrics by execution ID
   */
  getMetricsByExecution(executionId: string): PerformanceMetrics | undefined {
    return this.metrics.find(m => m.executionId === executionId);
  }

  /**
   * Get metrics by time range
   */
  getMetricsByTimeRange(startTime: number, endTime: number): PerformanceMetrics[] {
    return this.metrics.filter(m => 
      m.startTime >= startTime && m.startTime <= endTime
    );
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(timeRange?: { start: number; end: number }): {
    totalExecutions: number;
    averageExecutionTime: number;
    averageCost: number;
    successRate: number;
    errorRate: number;
    averageThroughput: number;
    averageMemoryUsage: number;
    averageConfidenceScore: number;
  } {
    const metrics = timeRange 
      ? this.getMetricsByTimeRange(timeRange.start, timeRange.end)
      : this.metrics;

    if (metrics.length === 0) {
      return {
        totalExecutions: 0,
        averageExecutionTime: 0,
        averageCost: 0,
        successRate: 0,
        errorRate: 0,
        averageThroughput: 0,
        averageMemoryUsage: 0,
        averageConfidenceScore: 0
      };
    }

    const totalExecutions = metrics.length;
    const successfulExecutions = metrics.filter(m => m.success).length;
    const totalExecutionTime = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const totalCost = metrics.reduce((sum, m) => sum + m.totalCost, 0);
    const totalThroughput = metrics.reduce((sum, m) => sum + m.throughput, 0);
    const totalMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    const totalConfidenceScore = metrics.reduce((sum, m) => sum + m.confidenceScore, 0);

    return {
      totalExecutions,
      averageExecutionTime: totalExecutionTime / totalExecutions,
      averageCost: totalCost / totalExecutions,
      successRate: successfulExecutions / totalExecutions,
      errorRate: 1 - (successfulExecutions / totalExecutions),
      averageThroughput: totalThroughput / totalExecutions,
      averageMemoryUsage: totalMemoryUsage / totalExecutions,
      averageConfidenceScore: totalConfidenceScore / totalExecutions
    };
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(days: number = 7): {
    executionTime: number[];
    cost: number[];
    successRate: number[];
    throughput: number[];
    timestamps: number[];
  } {
    const endTime = Date.now();
    const startTime = endTime - (days * 24 * 60 * 60 * 1000);
    const metrics = this.getMetricsByTimeRange(startTime, endTime);
    
    // Group by day
    const dailyMetrics = new Map<number, PerformanceMetrics[]>();
    
    for (const metric of metrics) {
      const day = Math.floor(metric.startTime / (24 * 60 * 60 * 1000));
      if (!dailyMetrics.has(day)) {
        dailyMetrics.set(day, []);
      }
      dailyMetrics.get(day)!.push(metric);
    }

    const trends = {
      executionTime: [] as number[],
      cost: [] as number[],
      successRate: [] as number[],
      throughput: [] as number[],
      timestamps: [] as number[]
    };

    for (let i = 0; i < days; i++) {
      const day = Math.floor((endTime - (i * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
      const dayMetrics = dailyMetrics.get(day) || [];
      
      if (dayMetrics.length > 0) {
        const avgExecutionTime = dayMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / dayMetrics.length;
        const avgCost = dayMetrics.reduce((sum, m) => sum + m.totalCost, 0) / dayMetrics.length;
        const successRate = dayMetrics.filter(m => m.success).length / dayMetrics.length;
        const avgThroughput = dayMetrics.reduce((sum, m) => sum + m.throughput, 0) / dayMetrics.length;
        
        trends.executionTime.unshift(avgExecutionTime);
        trends.cost.unshift(avgCost);
        trends.successRate.unshift(successRate);
        trends.throughput.unshift(avgThroughput);
        trends.timestamps.unshift(day * 24 * 60 * 60 * 1000);
      } else {
        trends.executionTime.unshift(0);
        trends.cost.unshift(0);
        trends.successRate.unshift(0);
        trends.throughput.unshift(0);
        trends.timestamps.unshift(day * 24 * 60 * 60 * 1000);
      }
    }

    return trends;
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
 * Usage Analytics Collector
 */
export class UsageAnalyticsCollector {
  private usage: Map<string, UsageAnalytics[]> = new Map();
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Record usage analytics
   */
  record(usage: UsageAnalytics): void {
    const userId = usage.userId;
    if (!this.usage.has(userId)) {
      this.usage.set(userId, []);
    }
    
    this.usage.get(userId)!.push(usage);
    this.eventEmitter.emit('usage:recorded', usage);
  }

  /**
   * Get usage by user
   */
  getUserUsage(userId: string): UsageAnalytics[] {
    return this.usage.get(userId) || [];
  }

  /**
   * Get user behavior analysis
   */
  getUserBehavior(userId: string): UserBehavior | null {
    const userUsage = this.getUserUsage(userId);
    if (userUsage.length === 0) return null;

    const sessions = new Set(userUsage.map(u => u.sessionId));
    const totalCost = userUsage.reduce((sum, u) => sum + (u.cost || 0), 0);
    const successfulActions = userUsage.filter(u => u.success).length;
    
    // Analyze usage patterns
    const hourOfDay = userUsage.map(u => new Date(u.timestamp).getHours());
    const dayOfWeek = userUsage.map(u => new Date(u.timestamp).getDay());
    const month = userUsage.map(u => new Date(u.timestamp).getMonth());
    
    // Get favorite agents
    const agentUsage = new Map<string, number>();
    userUsage.forEach(u => {
      if (u.agentId) {
        agentUsage.set(u.agentId, (agentUsage.get(u.agentId) || 0) + 1);
      }
    });
    
    const favoriteAgents = Array.from(agentUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([agentId]) => agentId);

    // Cost analysis by agent
    const costByAgent: Record<string, number> = {};
    userUsage.forEach(u => {
      if (u.agentId && u.cost) {
        costByAgent[u.agentId] = (costByAgent[u.agentId] || 0) + u.cost;
      }
    });

    return {
      userId,
      totalSessions: sessions.size,
      averageSessionDuration: userUsage.reduce((sum, u) => sum + (u.duration || 0), 0) / sessions.size,
      favoriteAgents,
      usagePatterns: {
        hourOfDay: this.getFrequencyDistribution(hourOfDay),
        dayOfWeek: this.getFrequencyDistribution(dayOfWeek),
        month: this.getFrequencyDistribution(month)
      },
      costAnalysis: {
        totalCost,
        averageCostPerSession: totalCost / sessions.size,
        costByAgent
      },
      successRate: successfulActions / userUsage.length,
      lastActive: Math.max(...userUsage.map(u => u.timestamp))
    };
  }

  /**
   * Get frequency distribution
   */
  private getFrequencyDistribution(values: number[]): number[] {
    const distribution = new Array(24).fill(0); // Assuming hour of day
    values.forEach(value => {
      if (value >= 0 && value < distribution.length) {
        distribution[value]++;
      }
    });
    return distribution;
  }

  /**
   * Get all users
   */
  getAllUsers(): string[] {
    return Array.from(this.usage.keys());
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
 * System Insights Generator
 */
export class SystemInsightsGenerator {
  private eventCollector: AnalyticsEventCollector;
  private performanceCollector: PerformanceMetricsCollector;
  private usageCollector: UsageAnalyticsCollector;
  private eventEmitter: EventEmitter;

  constructor(
    eventCollector: AnalyticsEventCollector,
    performanceCollector: PerformanceMetricsCollector,
    usageCollector: UsageAnalyticsCollector
  ) {
    this.eventCollector = eventCollector;
    this.performanceCollector = performanceCollector;
    this.usageCollector = usageCollector;
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Generate system insights
   */
  async generateInsights(): Promise<SystemInsights> {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    // Get performance metrics
    const performanceMetrics = this.performanceCollector.getAggregatedMetrics({
      start: last24Hours,
      end: now
    });

    // Get load balancer stats
    const loadBalancerStats = await loadBalancer.getStats();
    
    // Get cache stats
    const cacheStats = await autonomousCacheManager.getStats();

    // Get popular agents
    const allEvents = this.eventCollector.getEventsByTimeRange(last24Hours, now);
    const agentUsage = new Map<string, number>();
    allEvents.forEach(event => {
      if (event.agentId) {
        agentUsage.set(event.agentId, (agentUsage.get(event.agentId) || 0) + 1);
      }
    });

    const popularAgents = Array.from(agentUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([agentId, usage]) => ({ agentId, usage }));

    // Get error patterns
    const errorEvents = allEvents.filter(event => event.type === 'error');
    const errorPatterns = new Map<string, number>();
    errorEvents.forEach(event => {
      const error = event.data.error || 'Unknown error';
      errorPatterns.set(error, (errorPatterns.get(error) || 0) + 1);
    });

    const errorPatternsArray = Array.from(errorPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));

    // Get performance trends
    const trends = this.performanceCollector.getPerformanceTrends(7);

    // Get active users
    const activeUsers = this.usageCollector.getAllUsers().length;

    const insights: SystemInsights = {
      timestamp: now,
      totalExecutions: performanceMetrics.totalExecutions,
      averageExecutionTime: performanceMetrics.averageExecutionTime,
      averageCost: performanceMetrics.averageCost,
      successRate: performanceMetrics.successRate,
      errorRate: performanceMetrics.errorRate,
      throughput: performanceMetrics.averageThroughput,
      memoryUsage: cacheStats.memoryUsage,
      cpuUsage: 0, // Would need system monitoring
      activeUsers,
      popularAgents,
      errorPatterns: errorPatternsArray,
      performanceTrends: {
        executionTime: trends.executionTime,
        cost: trends.cost,
        successRate: trends.successRate,
        throughput: trends.throughput
      }
    };

    this.eventEmitter.emit('insights:generated', insights);
    return insights;
  }

  /**
   * Get real-time insights
   */
  async getRealTimeInsights(): Promise<Partial<SystemInsights>> {
    const now = Date.now();
    const last5Minutes = now - (5 * 60 * 1000);
    
    const recentMetrics = this.performanceCollector.getMetricsByTimeRange(last5Minutes, now);
    const recentEvents = this.eventCollector.getEventsByTimeRange(last5Minutes, now);
    
    if (recentMetrics.length === 0) {
      return {
        timestamp: now,
        totalExecutions: 0,
        throughput: 0,
        successRate: 0,
        errorRate: 0
      };
    }

    const totalExecutions = recentMetrics.length;
    const successfulExecutions = recentMetrics.filter(m => m.success).length;
    const totalThroughput = recentMetrics.reduce((sum, m) => sum + m.throughput, 0);
    const errorEvents = recentEvents.filter(e => e.type === 'error').length;

    return {
      timestamp: now,
      totalExecutions,
      throughput: totalThroughput / totalExecutions,
      successRate: successfulExecutions / totalExecutions,
      errorRate: errorEvents / recentEvents.length
    };
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
 * Main Analytics Manager
 */
export class AnalyticsManager {
  private eventCollector: AnalyticsEventCollector;
  private performanceCollector: PerformanceMetricsCollector;
  private usageCollector: UsageAnalyticsCollector;
  private insightsGenerator: SystemInsightsGenerator;
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventCollector = new AnalyticsEventCollector();
    this.performanceCollector = new PerformanceMetricsCollector();
    this.usageCollector = new UsageAnalyticsCollector();
    this.insightsGenerator = new SystemInsightsGenerator(
      this.eventCollector,
      this.performanceCollector,
      this.usageCollector
    );
    this.eventEmitter = new EventEmitter();
    
    this.setupEventHandlers();
  }

  /**
   * Track an event
   */
  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    this.eventCollector.collect(event);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: PerformanceMetrics): void {
    this.performanceCollector.record(metrics);
  }

  /**
   * Track usage analytics
   */
  trackUsage(usage: UsageAnalytics): void {
    this.usageCollector.record(usage);
  }

  /**
   * Get system insights
   */
  async getSystemInsights(): Promise<SystemInsights> {
    return this.insightsGenerator.generateInsights();
  }

  /**
   * Get real-time insights
   */
  async getRealTimeInsights(): Promise<Partial<SystemInsights>> {
    return this.insightsGenerator.getRealTimeInsights();
  }

  /**
   * Get user behavior
   */
  getUserBehavior(userId: string): UserBehavior | null {
    return this.usageCollector.getUserBehavior(userId);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(days: number = 7) {
    return this.performanceCollector.getPerformanceTrends(days);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string, limit: number = 100): AnalyticsEvent[] {
    return this.eventCollector.getEventsByType(type, limit);
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string, limit: number = 100): AnalyticsEvent[] {
    return this.eventCollector.getEventsByUser(userId, limit);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Forward events
    this.eventCollector.on('analytics:event', (event) => {
      this.eventEmitter.emit('analytics:event', event);
    });
    
    this.performanceCollector.on('performance:recorded', (metrics) => {
      this.eventEmitter.emit('performance:recorded', metrics);
    });
    
    this.usageCollector.on('usage:recorded', (usage) => {
      this.eventEmitter.emit('usage:recorded', usage);
    });
    
    this.insightsGenerator.on('insights:generated', (insights) => {
      this.eventEmitter.emit('insights:generated', insights);
    });
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
export const analyticsManager = new AnalyticsManager();

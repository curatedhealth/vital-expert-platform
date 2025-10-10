/**
 * Auto-Scaler
 * Automatic scaling based on load patterns and resource utilization
 */

import { performanceOptimizer } from './performance-optimizer';
import { cacheOptimizer } from './cache-optimizer';

export interface ScalingTarget {
  id: string;
  name: string;
  type: 'horizontal' | 'vertical' | 'database' | 'cache' | 'queue';
  currentInstances: number;
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number; // seconds
  lastScalingAction?: Date;
  status: 'active' | 'paused' | 'maintenance';
}

export interface ScalingAction {
  id: string;
  targetId: string;
  actionType: 'scale_up' | 'scale_down' | 'maintain';
  reason: string;
  currentInstances: number;
  targetInstances: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedCost: number;
  estimatedTime: number; // seconds
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface LoadPattern {
  id: string;
  name: string;
  pattern: 'stable' | 'bursty' | 'cyclical' | 'growing' | 'declining';
  confidence: number;
  peakHours: number[];
  averageLoad: number;
  peakLoad: number;
  scalingRecommendation: 'conservative' | 'aggressive' | 'predictive';
  lastAnalyzed: Date;
}

export interface ScalingMetrics {
  timestamp: Date;
  cpuUtilization: number;
  memoryUtilization: number;
  requestRate: number;
  responseTime: number;
  errorRate: number;
  queueDepth: number;
  activeConnections: number;
}

export class AutoScaler {
  private scalingTargets: Map<string, ScalingTarget> = new Map();
  private scalingActions: Map<string, ScalingAction> = new Map();
  private loadPatterns: Map<string, LoadPattern> = new Map();
  private metricsHistory: ScalingMetrics[] = [];
  private isScaling: boolean = false;

  constructor() {
    this.initializeScalingTargets();
    this.startScalingProcess();
  }

  /**
   * Initialize default scaling targets
   */
  private initializeScalingTargets(): void {
    const defaultTargets: ScalingTarget[] = [
      {
        id: 'api_servers',
        name: 'API Servers',
        type: 'horizontal',
        currentInstances: 2,
        minInstances: 1,
        maxInstances: 10,
        targetUtilization: 70,
        scaleUpThreshold: 80,
        scaleDownThreshold: 30,
        cooldownPeriod: 300, // 5 minutes
        status: 'active'
      },
      {
        id: 'agent_workers',
        name: 'Agent Workers',
        type: 'horizontal',
        currentInstances: 3,
        minInstances: 2,
        maxInstances: 20,
        targetUtilization: 60,
        scaleUpThreshold: 75,
        scaleDownThreshold: 25,
        cooldownPeriod: 180, // 3 minutes
        status: 'active'
      },
      {
        id: 'database_connections',
        name: 'Database Connections',
        type: 'database',
        currentInstances: 10,
        minInstances: 5,
        maxInstances: 50,
        targetUtilization: 60,
        scaleUpThreshold: 80,
        scaleDownThreshold: 30,
        cooldownPeriod: 120, // 2 minutes
        status: 'active'
      },
      {
        id: 'cache_cluster',
        name: 'Cache Cluster',
        type: 'cache',
        currentInstances: 2,
        minInstances: 1,
        maxInstances: 8,
        targetUtilization: 70,
        scaleUpThreshold: 85,
        scaleDownThreshold: 40,
        cooldownPeriod: 240, // 4 minutes
        status: 'active'
      },
      {
        id: 'queue_workers',
        name: 'Queue Workers',
        type: 'queue',
        currentInstances: 4,
        minInstances: 2,
        maxInstances: 15,
        targetUtilization: 65,
        scaleUpThreshold: 80,
        scaleDownThreshold: 30,
        cooldownPeriod: 150, // 2.5 minutes
        status: 'active'
      }
    ];

    defaultTargets.forEach(target => {
      this.scalingTargets.set(target.id, target);
    });
  }

  /**
   * Start the scaling process
   */
  private startScalingProcess(): void {
    this.isScaling = true;

    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectScalingMetrics();
    }, 30 * 1000);

    // Analyze load patterns every 5 minutes
    setInterval(() => {
      this.analyzeLoadPatterns();
    }, 5 * 60 * 1000);

    // Evaluate scaling decisions every 2 minutes
    setInterval(() => {
      this.evaluateScalingDecisions();
    }, 2 * 60 * 1000);

    // Process pending scaling actions every 30 seconds
    setInterval(() => {
      this.processScalingActions();
    }, 30 * 1000);

    console.log('📈 Auto-scaler started');
  }

  /**
   * Collect scaling metrics
   */
  private async collectScalingMetrics(): Promise<void> {
    try {
      // Get performance statistics
      const perfStats = performanceOptimizer.getPerformanceStatistics();
      const cacheStats = cacheOptimizer.getCacheStatistics();

      // Create scaling metrics
      const metrics: ScalingMetrics = {
        timestamp: new Date(),
        cpuUtilization: this.getAverageCPUUtilization(),
        memoryUtilization: this.getAverageMemoryUtilization(),
        requestRate: this.getCurrentRequestRate(),
        responseTime: this.getAverageResponseTime(perfStats),
        errorRate: this.getCurrentErrorRate(),
        queueDepth: this.getCurrentQueueDepth(),
        activeConnections: this.getActiveConnections()
      };

      this.metricsHistory.push(metrics);

      // Keep only last 24 hours of metrics
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
      this.metricsHistory = this.metricsHistory.filter(
        m => m.timestamp.getTime() > cutoffTime
      );

    } catch (error) {
      console.error('❌ Error collecting scaling metrics:', error);
    }
  }

  /**
   * Analyze load patterns
   */
  private analyzeLoadPatterns(): void {
    if (this.metricsHistory.length < 10) return;

    console.log('📊 Analyzing load patterns...');

    // Analyze patterns for each scaling target
    for (const [targetId, target] of this.scalingTargets.entries()) {
      const pattern = this.analyzeTargetLoadPattern(targetId);
      if (pattern) {
        this.loadPatterns.set(targetId, pattern);
        console.log(`📈 Load pattern for ${target.name}: ${pattern.pattern} (confidence: ${(pattern.confidence * 100).toFixed(1)}%)`);
      }
    }
  }

  /**
   * Analyze load pattern for specific target
   */
  private analyzeTargetLoadPattern(targetId: string): LoadPattern | null {
    const target = this.scalingTargets.get(targetId);
    if (!target) return null;

    // Get recent metrics (last 2 hours)
    const recentMetrics = this.metricsHistory.filter(
      m => Date.now() - m.timestamp.getTime() < 2 * 60 * 60 * 1000
    );

    if (recentMetrics.length < 5) return null;

    // Analyze utilization pattern
    const utilization = this.getTargetUtilization(targetId, recentMetrics);
    const pattern = this.detectLoadPattern(utilization);
    const peakHours = this.detectPeakHours(recentMetrics);

    return {
      id: `pattern_${targetId}_${Date.now()}`,
      name: `${target.name} Load Pattern`,
      pattern: pattern.type,
      confidence: pattern.confidence,
      peakHours,
      averageLoad: pattern.averageLoad,
      peakLoad: pattern.peakLoad,
      scalingRecommendation: this.getScalingRecommendation(pattern),
      lastAnalyzed: new Date()
    };
  }

  /**
   * Get target utilization metrics
   */
  private getTargetUtilization(targetId: string, metrics: ScalingMetrics[]): number[] {
    switch (targetId) {
      case 'api_servers':
        return metrics.map(m => m.cpuUtilization);
      case 'agent_workers':
        return metrics.map(m => m.cpuUtilization);
      case 'database_connections':
        return metrics.map(m => m.activeConnections / 50 * 100); // Normalize to percentage
      case 'cache_cluster':
        return metrics.map(m => m.memoryUtilization);
      case 'queue_workers':
        return metrics.map(m => m.queueDepth / 100 * 100); // Normalize to percentage
      default:
        return metrics.map(m => m.cpuUtilization);
    }
  }

  /**
   * Detect load pattern from utilization data
   */
  private detectLoadPattern(utilization: number[]): {
    type: 'stable' | 'bursty' | 'cyclical' | 'growing' | 'declining';
    confidence: number;
    averageLoad: number;
    peakLoad: number;
  } {
    const averageLoad = utilization.reduce((sum, val) => sum + val, 0) / utilization.length;
    const peakLoad = Math.max(...utilization);
    const variance = this.calculateVariance(utilization);
    const trend = this.calculateTrend(utilization);

    let type: 'stable' | 'bursty' | 'cyclical' | 'growing' | 'declining';
    let confidence = 0.5;

    if (variance < 0.1) {
      type = 'stable';
      confidence = 0.9;
    } else if (variance > 0.3) {
      type = 'bursty';
      confidence = 0.8;
    } else if (this.detectCyclicalPattern(utilization)) {
      type = 'cyclical';
      confidence = 0.7;
    } else if (trend > 0.1) {
      type = 'growing';
      confidence = 0.8;
    } else if (trend < -0.1) {
      type = 'declining';
      confidence = 0.8;
    } else {
      type = 'stable';
      confidence = 0.6;
    }

    return { type, confidence, averageLoad, peakLoad };
  }

  /**
   * Calculate variance
   */
  private calculateVariance(data: number[]): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance) / mean;
  }

  /**
   * Calculate trend
   */
  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    return (secondAvg - firstAvg) / firstAvg;
  }

  /**
   * Detect cyclical pattern
   */
  private detectCyclicalPattern(data: number[]): boolean {
    if (data.length < 10) return false;

    // Simple cyclical detection using autocorrelation
    const lag = Math.floor(data.length / 4);
    const correlation = this.calculateAutocorrelation(data, lag);
    
    return correlation > 0.5;
  }

  /**
   * Calculate autocorrelation
   */
  private calculateAutocorrelation(data: number[], lag: number): number {
    if (data.length <= lag) return 0;

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < data.length - lag; i++) {
      numerator += (data[i] - mean) * (data[i + lag] - mean);
      denominator += Math.pow(data[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Detect peak hours
   */
  private detectPeakHours(metrics: ScalingMetrics[]): number[] {
    const hourlyLoad: number[] = new Array(24).fill(0);
    const hourlyCount: number[] = new Array(24).fill(0);

    metrics.forEach(metric => {
      const hour = metric.timestamp.getHours();
      hourlyLoad[hour] += metric.cpuUtilization;
      hourlyCount[hour]++;
    });

    // Calculate average load per hour
    const hourlyAverages = hourlyLoad.map((load, hour) => 
      hourlyCount[hour] > 0 ? load / hourlyCount[hour] : 0
    );

    // Find hours with above-average load
    const overallAverage = hourlyAverages.reduce((sum, val) => sum + val, 0) / 24;
    const peakHours = hourlyAverages
      .map((load, hour) => ({ hour, load }))
      .filter(({ load }) => load > overallAverage * 1.2)
      .map(({ hour }) => hour);

    return peakHours;
  }

  /**
   * Get scaling recommendation based on pattern
   */
  private getScalingRecommendation(pattern: any): 'conservative' | 'aggressive' | 'predictive' {
    switch (pattern.type) {
      case 'stable':
        return 'conservative';
      case 'bursty':
        return 'aggressive';
      case 'cyclical':
        return 'predictive';
      case 'growing':
        return 'aggressive';
      case 'declining':
        return 'conservative';
      default:
        return 'conservative';
    }
  }

  /**
   * Evaluate scaling decisions
   */
  private evaluateScalingDecisions(): void {
    console.log('⚖️ Evaluating scaling decisions...');

    for (const [targetId, target] of this.scalingTargets.entries()) {
      if (target.status !== 'active') continue;

      // Check cooldown period
      if (target.lastScalingAction) {
        const timeSinceLastAction = Date.now() - target.lastScalingAction.getTime();
        if (timeSinceLastAction < target.cooldownPeriod * 1000) {
          continue; // Still in cooldown
        }
      }

      const currentUtilization = this.getCurrentTargetUtilization(targetId);
      const pattern = this.loadPatterns.get(targetId);

      // Determine scaling action
      const action = this.determineScalingAction(target, currentUtilization, pattern);
      if (action) {
        this.createScalingAction(action);
      }
    }
  }

  /**
   * Get current target utilization
   */
  private getCurrentTargetUtilization(targetId: string): number {
    if (this.metricsHistory.length === 0) return 0;

    const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    
    switch (targetId) {
      case 'api_servers':
      case 'agent_workers':
        return latestMetrics.cpuUtilization;
      case 'database_connections':
        return (latestMetrics.activeConnections / 50) * 100;
      case 'cache_cluster':
        return latestMetrics.memoryUtilization;
      case 'queue_workers':
        return (latestMetrics.queueDepth / 100) * 100;
      default:
        return latestMetrics.cpuUtilization;
    }
  }

  /**
   * Determine scaling action
   */
  private determineScalingAction(
    target: ScalingTarget, 
    currentUtilization: number, 
    pattern: LoadPattern | undefined
  ): Partial<ScalingAction> | null {
    const currentInstances = target.currentInstances;
    let actionType: 'scale_up' | 'scale_down' | 'maintain';
    let targetInstances = currentInstances;
    let reason = '';
    let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';

    // Scale up conditions
    if (currentUtilization > target.scaleUpThreshold) {
      actionType = 'scale_up';
      targetInstances = Math.min(currentInstances + 1, target.maxInstances);
      reason = `High utilization: ${currentUtilization.toFixed(1)}% > ${target.scaleUpThreshold}%`;
      priority = currentUtilization > target.scaleUpThreshold * 1.2 ? 'critical' : 'high';
    }
    // Scale down conditions
    else if (currentUtilization < target.scaleDownThreshold && currentInstances > target.minInstances) {
      actionType = 'scale_down';
      targetInstances = Math.max(currentInstances - 1, target.minInstances);
      reason = `Low utilization: ${currentUtilization.toFixed(1)}% < ${target.scaleDownThreshold}%`;
      priority = 'low';
    }
    // Predictive scaling based on pattern
    else if (pattern && pattern.scalingRecommendation === 'predictive') {
      const predictedUtilization = this.predictUtilization(pattern);
      if (predictedUtilization > target.scaleUpThreshold * 0.8) {
        actionType = 'scale_up';
        targetInstances = Math.min(currentInstances + 1, target.maxInstances);
        reason = `Predictive scaling: predicted utilization ${predictedUtilization.toFixed(1)}%`;
        priority = 'medium';
      }
    }
    else {
      return null; // No action needed
    }

    if (targetInstances === currentInstances) {
      return null; // No change in instances
    }

    return {
      targetId: target.id,
      actionType,
      reason,
      currentInstances,
      targetInstances,
      priority,
      estimatedCost: this.calculateScalingCost(target, currentInstances, targetInstances),
      estimatedTime: this.calculateScalingTime(target, actionType)
    };
  }

  /**
   * Predict utilization based on pattern
   */
  private predictUtilization(pattern: LoadPattern): number {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Simple prediction based on cyclical patterns
    if (pattern.pattern === 'cyclical' && pattern.peakHours.includes(currentHour)) {
      return pattern.peakLoad;
    }
    
    return pattern.averageLoad;
  }

  /**
   * Calculate scaling cost
   */
  private calculateScalingCost(target: ScalingTarget, current: number, targetInstances: number): number {
    const instanceCost = this.getInstanceCost(target.type);
    const change = Math.abs(targetInstances - current);
    return change * instanceCost;
  }

  /**
   * Get instance cost by type
   */
  private getInstanceCost(type: string): number {
    const costs: Record<string, number> = {
      'horizontal': 10, // $10 per instance
      'vertical': 5,    // $5 per instance
      'database': 20,   // $20 per connection
      'cache': 8,       // $8 per instance
      'queue': 6        // $6 per worker
    };
    
    return costs[type] || 10;
  }

  /**
   * Calculate scaling time
   */
  private calculateScalingTime(target: ScalingTarget, actionType: string): number {
    const baseTime: Record<string, number> = {
      'scale_up': 60,    // 1 minute
      'scale_down': 30,  // 30 seconds
      'maintain': 0
    };
    
    return baseTime[actionType] || 60;
  }

  /**
   * Create scaling action
   */
  private createScalingAction(actionData: Partial<ScalingAction>): void {
    const action: ScalingAction = {
      id: `scale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      targetId: actionData.targetId!,
      actionType: actionData.actionType!,
      reason: actionData.reason!,
      currentInstances: actionData.currentInstances!,
      targetInstances: actionData.targetInstances!,
      priority: actionData.priority!,
      estimatedCost: actionData.estimatedCost!,
      estimatedTime: actionData.estimatedTime!,
      status: 'pending',
      createdAt: new Date()
    };

    this.scalingActions.set(action.id, action);
    console.log(`📋 Created scaling action: ${action.actionType} ${action.targetId} (${action.currentInstances} → ${action.targetInstances})`);
  }

  /**
   * Process scaling actions
   */
  private async processScalingActions(): Promise<void> {
    const pendingActions = Array.from(this.scalingActions.values())
      .filter(action => action.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    for (const action of pendingActions) {
      try {
        await this.executeScalingAction(action);
      } catch (error) {
        console.error(`❌ Failed to execute scaling action ${action.id}:`, error);
        action.status = 'failed';
        action.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
  }

  /**
   * Execute scaling action
   */
  private async executeScalingAction(action: ScalingAction): Promise<void> {
    console.log(`🚀 Executing scaling action: ${action.actionType} ${action.targetId}`);
    
    action.status = 'in_progress';
    action.startedAt = new Date();

    try {
      // Simulate scaling operation
      await this.performScaling(action);

      // Update target instances
      const target = this.scalingTargets.get(action.targetId);
      if (target) {
        target.currentInstances = action.targetInstances;
        target.lastScalingAction = new Date();
      }

      action.status = 'completed';
      action.completedAt = new Date();
      
      console.log(`✅ Scaling action completed: ${action.targetId} now has ${action.targetInstances} instances`);

    } catch (error) {
      action.status = 'failed';
      action.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Perform actual scaling operation
   */
  private async performScaling(action: ScalingAction): Promise<void> {
    // In production, this would integrate with cloud providers (AWS, GCP, Azure)
    // For now, we'll simulate the scaling operation
    
    const scalingTime = action.estimatedTime * 1000; // Convert to milliseconds
    await new Promise(resolve => setTimeout(resolve, Math.min(scalingTime, 5000))); // Cap at 5 seconds for simulation
    
    console.log(`🔄 Scaled ${action.targetId} from ${action.currentInstances} to ${action.targetInstances} instances`);
  }

  // Helper methods for getting current metrics
  private getAverageCPUUtilization(): number {
    // In production, this would get real CPU metrics
    return Math.random() * 100;
  }

  private getAverageMemoryUtilization(): number {
    // In production, this would get real memory metrics
    return Math.random() * 100;
  }

  private getCurrentRequestRate(): number {
    // In production, this would get real request rate
    return Math.random() * 1000;
  }

  private getAverageResponseTime(perfStats: any): number {
    // Use performance statistics if available
    if (perfStats && perfStats.targets) {
      const responseTimeTarget = perfStats.targets.find((t: any) => t.metric === 'response_time');
      if (responseTimeTarget) {
        return responseTimeTarget.currentValue;
      }
    }
    return Math.random() * 2000 + 500;
  }

  private getCurrentErrorRate(): number {
    // In production, this would get real error rate
    return Math.random() * 0.1;
  }

  private getCurrentQueueDepth(): number {
    // In production, this would get real queue depth
    return Math.floor(Math.random() * 100);
  }

  private getActiveConnections(): number {
    // In production, this would get real connection count
    return Math.floor(Math.random() * 50);
  }

  /**
   * Get scaling statistics
   */
  getScalingStatistics(): {
    targets: ScalingTarget[];
    actions: ScalingAction[];
    patterns: LoadPattern[];
    metrics: ScalingMetrics[];
    totalCost: number;
    averageResponseTime: number;
  } {
    const targets = Array.from(this.scalingTargets.values());
    const actions = Array.from(this.scalingActions.values());
    const patterns = Array.from(this.loadPatterns.values());
    const metrics = this.metricsHistory.slice(-10); // Last 10 measurements

    const totalCost = actions
      .filter(action => action.status === 'completed')
      .reduce((sum, action) => sum + action.estimatedCost, 0);

    const averageResponseTime = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length
      : 0;

    return {
      targets,
      actions,
      patterns,
      metrics,
      totalCost,
      averageResponseTime
    };
  }

  /**
   * Pause scaling for a target
   */
  pauseScaling(targetId: string): void {
    const target = this.scalingTargets.get(targetId);
    if (target) {
      target.status = 'paused';
      console.log(`⏸️ Paused scaling for ${target.name}`);
    }
  }

  /**
   * Resume scaling for a target
   */
  resumeScaling(targetId: string): void {
    const target = this.scalingTargets.get(targetId);
    if (target) {
      target.status = 'active';
      console.log(`▶️ Resumed scaling for ${target.name}`);
    }
  }

  /**
   * Cancel pending scaling action
   */
  cancelScalingAction(actionId: string): boolean {
    const action = this.scalingActions.get(actionId);
    if (action && action.status === 'pending') {
      action.status = 'cancelled';
      console.log(`❌ Cancelled scaling action: ${actionId}`);
      return true;
    }
    return false;
  }
}

export const autoScaler = new AutoScaler();

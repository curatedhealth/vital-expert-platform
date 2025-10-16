import { OrchestrationResult } from './automatic-orchestrator';

export interface PerformanceMetrics {
  agentId: string;
  queryId: string;
  domain: string;
  complexity: number;
  confidence: number;
  responseTime: number;
  userSatisfaction?: number;
  resolutionSuccess: boolean;
  escalationRequired: boolean;
  feedbackNotes?: string;
  timestamp: Date;
}

export class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics[]>;
  
  constructor() {
    this.metrics = new Map();
    this.loadHistoricalMetrics();
  }
  
  async trackQuery(
    queryId: string,
    orchestrationResult: OrchestrationResult
  ): Promise<{
    updateResponseTime: (time: number) => void;
    updateSatisfaction: (rating: number) => void;
    updateSuccess: (success: boolean) => void;
    complete: () => Promise<void>;
  }> {
    const startTime = Date.now();
    
    // Initialize tracking
    const metric: Partial<PerformanceMetrics> = {
      queryId,
      agentId: orchestrationResult.selectedAgent.id || '',
      domain: orchestrationResult.analysis.domain.primary,
      complexity: orchestrationResult.analysis.complexity.score,
      confidence: orchestrationResult.confidence,
      timestamp: new Date()
    };
    
    // Store initial metric
    await this.saveMetric(metric as PerformanceMetrics);
    
    // Return tracking handle for updates
    return {
      updateResponseTime: (time: number) => {
        metric.responseTime = time;
      },
      updateSatisfaction: (rating: number) => {
        metric.userSatisfaction = rating;
      },
      updateSuccess: (success: boolean) => {
        metric.resolutionSuccess = success;
      },
      complete: () => this.saveMetric(metric as PerformanceMetrics)
    };
  }
  
  async getAgentPerformance(agentId: string, days: number = 30): Promise<AgentPerformanceSummary> {
    const metrics = await this.getMetricsForAgent(agentId, days);
    
    if (metrics.length === 0) {
      return this.getDefaultPerformance(agentId);
    }
    
    return {
      agentId,
      totalQueries: metrics.length,
      avgResponseTime: this.average(metrics.map(m => m.responseTime)),
      avgSatisfaction: this.average(metrics.map(m => m.userSatisfaction).filter(Boolean)),
      successRate: metrics.filter(m => m.resolutionSuccess).length / metrics.length,
      domainPerformance: this.calculateDomainPerformance(metrics),
      complexityPerformance: this.calculateComplexityPerformance(metrics),
      trend: this.calculateTrend(metrics)
    };
  }
  
  private calculateDomainPerformance(metrics: PerformanceMetrics[]): Map<string, number> {
    const domainPerf = new Map<string, number>();
    const domainGroups = this.groupBy(metrics, m => m.domain);
    
    for (const [domain, domainMetrics] of Array.from(domainGroups.entries())) {
      const successRate = domainMetrics.filter(m => m.resolutionSuccess).length / domainMetrics.length;
      domainPerf.set(domain, successRate);
    }
    
    return domainPerf;
  }
  
  private calculateComplexityPerformance(metrics: PerformanceMetrics[]): Map<string, number> {
    const complexityPerf = new Map<string, number>();
    
    // Group by complexity buckets
    const buckets = {
      'simple': metrics.filter(m => m.complexity <= 3),
      'moderate': metrics.filter(m => m.complexity > 3 && m.complexity <= 6),
      'complex': metrics.filter(m => m.complexity > 6)
    };
    
    for (const [level, bucketMetrics] of Object.entries(buckets)) {
      if (bucketMetrics.length > 0) {
        const successRate = bucketMetrics.filter(m => m.resolutionSuccess).length / bucketMetrics.length;
        complexityPerf.set(level, successRate);
      }
    }
    
    return complexityPerf;
  }
  
  private calculateTrend(metrics: PerformanceMetrics[]): 'improving' | 'stable' | 'declining' {
    if (metrics.length < 10) return 'stable';
    
    // Compare recent vs older performance
    const midpoint = Math.floor(metrics.length / 2);
    const older = metrics.slice(0, midpoint);
    const recent = metrics.slice(midpoint);
    
    const olderSuccess = older.filter(m => m.resolutionSuccess).length / older.length;
    const recentSuccess = recent.filter(m => m.resolutionSuccess).length / recent.length;
    
    const diff = recentSuccess - olderSuccess;
    
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  }
  
  // Utility functions
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
  
  private groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const item of array) {
      const key = keyFn(item);
      const group = map.get(key) || [];
      group.push(item);
      map.set(key, group);
    }
    return map;
  }
  
  private async saveMetric(metric: PerformanceMetrics): Promise<void> {
    // Save to database
    console.log('Saving performance metric:', metric);
    
    // Store in memory for now
    const agentMetrics = this.metrics.get(metric.agentId) || [];
    agentMetrics.push(metric);
    this.metrics.set(metric.agentId, agentMetrics);
  }
  
  private async getMetricsForAgent(agentId: string, days: number): Promise<PerformanceMetrics[]> {
    // Load from database
    const allMetrics = this.metrics.get(agentId) || [];
    
    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return allMetrics.filter(metric => metric.timestamp >= cutoffDate);
  }
  
  private getDefaultPerformance(agentId: string): AgentPerformanceSummary {
    return {
      agentId,
      totalQueries: 0,
      avgResponseTime: 0,
      avgSatisfaction: 0,
      successRate: 0.7, // Default baseline
      domainPerformance: new Map(),
      complexityPerformance: new Map(),
      trend: 'stable'
    };
  }
  
  private loadHistoricalMetrics(): void {
    // Load from database
    this.metrics = new Map();
  }
}

interface AgentPerformanceSummary {
  agentId: string;
  totalQueries: number;
  avgResponseTime: number;
  avgSatisfaction: number;
  successRate: number;
  domainPerformance: Map<string, number>;
  complexityPerformance: Map<string, number>;
  trend: 'improving' | 'stable' | 'declining';
}

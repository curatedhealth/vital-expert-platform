/**
 * Alert Tuning System
 * ML-based threshold tuning to reduce false positives and optimize alerting
 */

import { performanceMetricsService } from '@/shared/services/monitoring/performance-metrics.service';

export interface AlertThreshold {
  metric: string;
  currentThreshold: number;
  suggestedThreshold: number;
  confidence: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  tuningReason: string;
  lastUpdated: Date;
}

export interface AlertPattern {
  id: string;
  pattern: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  falsePositiveRate: number;
  correlationRules: string[];
  suggestedAction: 'tune' | 'suppress' | 'investigate';
}

export interface TuningRecommendation {
  metric: string;
  action: 'increase' | 'decrease' | 'maintain' | 'suppress';
  newThreshold?: number;
  confidence: number;
  expectedImprovement: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AlertCorrelation {
  id: string;
  primaryAlert: string;
  relatedAlerts: string[];
  correlationStrength: number;
  pattern: string;
  suggestedGrouping: boolean;
}

export class AlertTuner {
  private historicalData: Map<string, number[]> = new Map();
  private alertPatterns: Map<string, AlertPattern> = new Map();
  private correlationRules: Map<string, AlertCorrelation> = new Map();
  private tuningHistory: TuningRecommendation[] = [];
  private isLearning: boolean = false;

  constructor() {
    this.initializeDefaultThresholds();
    this.startLearningProcess();
  }

  /**
   * Initialize default thresholds for common metrics
   */
  private initializeDefaultThresholds(): void {
    const defaultThresholds = [
      { metric: 'response_time', threshold: 2000 },
      { metric: 'error_rate', threshold: 0.05 },
      { metric: 'cpu_usage', threshold: 80 },
      { metric: 'memory_usage', threshold: 85 },
      { metric: 'database_connections', threshold: 50 },
      { metric: 'queue_length', threshold: 100 },
      { metric: 'cache_hit_rate', threshold: 0.7 },
      { metric: 'agent_selection_time', threshold: 1000 }
    ];

    defaultThresholds.forEach(({ metric, threshold }) => {
      this.historicalData.set(metric, []);
    });
  }

  /**
   * Start the learning process
   */
  private startLearningProcess(): void {
    this.isLearning = true;
    
    // Collect historical data every 5 minutes
    setInterval(() => {
      this.collectHistoricalData();
    }, 5 * 60 * 1000);

    // Analyze patterns every hour
    setInterval(() => {
      this.analyzeAlertPatterns();
    }, 60 * 60 * 1000);

    // Generate tuning recommendations every 6 hours
    setInterval(() => {
      this.generateTuningRecommendations();
    }, 6 * 60 * 60 * 1000);

    console.log('🔧 Alert tuning system started');
  }

  /**
   * Collect historical data for analysis
   */
  private async collectHistoricalData(): Promise<void> {
    try {
      const metrics = [
        'response_time', 'error_rate', 'cpu_usage', 'memory_usage',
        'database_connections', 'queue_length', 'cache_hit_rate',
        'agent_selection_time', 'multi_agent_coordination_time',
        'coordination_strategy', 'coordination_quality_score'
      ];

      for (const metric of metrics) {
        try {
          const data = await performanceMetricsService.getMetricHistory(metric, '1h');
          if (data && data.length > 0) {
            const values = data.map(d => d.value);
            const existing = this.historicalData.get(metric) || [];
            const combined = [...existing, ...values].slice(-1000); // Keep last 1000 values
            this.historicalData.set(metric, combined);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to collect data for metric ${metric}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to collect historical data:', error);
    }
  }

  /**
   * Analyze alert patterns to identify tuning opportunities
   */
  private analyzeAlertPatterns(): void {
    console.log('🔍 Analyzing alert patterns...');

    for (const [metric, data] of this.historicalData.entries()) {
      if (data.length < 10) continue; // Need minimum data points

      const pattern = this.detectPattern(metric, data);
      if (pattern) {
        this.alertPatterns.set(metric, pattern);
        console.log(`📊 Pattern detected for ${metric}: ${pattern.pattern}`);
      }
    }

    // Analyze correlations
    this.analyzeAlertCorrelations();
  }

  /**
   * Detect patterns in metric data
   */
  private detectPattern(metric: string, data: number[]): AlertPattern | null {
    if (data.length < 10) return null;

    const stats = this.calculateStatistics(data);
    const variance = this.calculateVariance(data);
    const trend = this.calculateTrend(data);

    // Detect different patterns
    let patternType = 'stable';
    let falsePositiveRate = 0;

    if (variance > 0.3) {
      patternType = 'high_variance';
      falsePositiveRate = 0.25; // High variance often leads to false positives
    } else if (trend > 0.1) {
      patternType = 'increasing_trend';
      falsePositiveRate = 0.15;
    } else if (trend < -0.1) {
      patternType = 'decreasing_trend';
      falsePositiveRate = 0.1;
    } else if (this.detectCyclicalPattern(data)) {
      patternType = 'cyclical';
      falsePositiveRate = 0.2;
    }

    // Calculate frequency of potential alerts
    const currentThreshold = this.getCurrentThreshold(metric);
    const potentialAlerts = data.filter(value => value > currentThreshold).length;
    const frequency = potentialAlerts / data.length;

    return {
      id: `${metric}_${Date.now()}`,
      pattern: patternType,
      frequency,
      severity: frequency > 0.1 ? 'high' : frequency > 0.05 ? 'medium' : 'low',
      falsePositiveRate,
      correlationRules: this.getCorrelationRules(metric),
      suggestedAction: this.getSuggestedAction(patternType, frequency, falsePositiveRate)
    };
  }

  /**
   * Calculate basic statistics
   */
  private calculateStatistics(data: number[]): { mean: number; median: number; std: number } {
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const std = Math.sqrt(variance);

    return { mean, median, std };
  }

  /**
   * Calculate variance coefficient
   */
  private calculateVariance(data: number[]): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance) / mean;
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstMean = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    return (secondMean - firstMean) / firstMean;
  }

  /**
   * Detect cyclical patterns
   */
  private detectCyclicalPattern(data: number[]): boolean {
    if (data.length < 20) return false;

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
   * Get current threshold for a metric
   */
  private getCurrentThreshold(metric: string): number {
    const thresholds: Record<string, number> = {
      'response_time': 2000,
      'error_rate': 0.05,
      'cpu_usage': 80,
      'memory_usage': 85,
      'database_connections': 50,
      'queue_length': 100,
      'cache_hit_rate': 0.7,
      'agent_selection_time': 1000
    };

    return thresholds[metric] || 100;
  }

  /**
   * Get correlation rules for a metric
   */
  private getCorrelationRules(metric: string): string[] {
    const rules: Record<string, string[]> = {
      'response_time': ['cpu_usage', 'memory_usage', 'database_connections'],
      'error_rate': ['response_time', 'cpu_usage'],
      'cpu_usage': ['memory_usage', 'queue_length'],
      'memory_usage': ['cpu_usage', 'database_connections'],
      'database_connections': ['response_time', 'queue_length'],
      'queue_length': ['cpu_usage', 'memory_usage']
    };

    return rules[metric] || [];
  }

  /**
   * Get suggested action based on pattern analysis
   */
  private getSuggestedAction(
    pattern: string,
    frequency: number,
    falsePositiveRate: number
  ): 'tune' | 'suppress' | 'investigate' {
    if (falsePositiveRate > 0.3) return 'suppress';
    if (frequency > 0.2) return 'tune';
    if (pattern === 'high_variance') return 'investigate';
    return 'tune';
  }

  /**
   * Analyze alert correlations
   */
  private analyzeAlertCorrelations(): void {
    const metrics = Array.from(this.historicalData.keys());
    
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        
        const correlation = this.calculateCorrelation(
          this.historicalData.get(metric1) || [],
          this.historicalData.get(metric2) || []
        );

        if (Math.abs(correlation) > 0.7) {
          const correlationId = `${metric1}_${metric2}_${Date.now()}`;
          this.correlationRules.set(correlationId, {
            id: correlationId,
            primaryAlert: metric1,
            relatedAlerts: [metric2],
            correlationStrength: Math.abs(correlation),
            pattern: correlation > 0 ? 'positive' : 'negative',
            suggestedGrouping: true
          });
        }
      }
    }
  }

  /**
   * Calculate correlation between two datasets
   */
  private calculateCorrelation(data1: number[], data2: number[]): number {
    if (data1.length !== data2.length || data1.length === 0) return 0;

    const minLength = Math.min(data1.length, data2.length);
    const d1 = data1.slice(0, minLength);
    const d2 = data2.slice(0, minLength);

    const mean1 = d1.reduce((sum, val) => sum + val, 0) / d1.length;
    const mean2 = d2.reduce((sum, val) => sum + val, 0) / d2.length;

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    for (let i = 0; i < d1.length; i++) {
      const diff1 = d1[i] - mean1;
      const diff2 = d2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Generate tuning recommendations
   */
  private generateTuningRecommendations(): void {
    console.log('🎯 Generating tuning recommendations...');

    const recommendations: TuningRecommendation[] = [];

    for (const [metric, pattern] of this.alertPatterns.entries()) {
      const data = this.historicalData.get(metric);
      if (!data || data.length < 10) continue;

      const recommendation = this.calculateTuningRecommendation(metric, pattern, data);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Store recommendations
    this.tuningHistory.push(...recommendations);

    // Apply automatic tuning for low-risk recommendations
    this.applyAutomaticTuning(recommendations);

    console.log(`✅ Generated ${recommendations.length} tuning recommendations`);
  }

  /**
   * Calculate tuning recommendation for a metric
   */
  private calculateTuningRecommendation(
    metric: string,
    pattern: AlertPattern,
    data: number[]
  ): TuningRecommendation | null {
    const currentThreshold = this.getCurrentThreshold(metric);
    const stats = this.calculateStatistics(data);
    const percentile95 = this.calculatePercentile(data, 0.95);
    const percentile99 = this.calculatePercentile(data, 0.99);

    let action: 'increase' | 'decrease' | 'maintain' | 'suppress';
    let newThreshold: number | undefined;
    let confidence = 0.5;
    let expectedImprovement = 0;
    let reasoning = '';
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';

    // Determine action based on pattern and false positive rate
    if (pattern.falsePositiveRate > 0.3) {
      action = 'suppress';
      reasoning = `High false positive rate (${(pattern.falsePositiveRate * 100).toFixed(1)}%) suggests threshold is too sensitive`;
      riskLevel = 'low';
    } else if (pattern.pattern === 'high_variance' && pattern.frequency > 0.1) {
      action = 'increase';
      newThreshold = percentile95;
      confidence = 0.8;
      expectedImprovement = pattern.falsePositiveRate * 0.5;
      reasoning = `High variance pattern with frequent alerts. Setting threshold to 95th percentile (${newThreshold.toFixed(2)})`;
      riskLevel = 'medium';
    } else if (pattern.pattern === 'increasing_trend' && stats.mean > currentThreshold * 0.8) {
      action = 'increase';
      newThreshold = Math.max(currentThreshold * 1.2, percentile95);
      confidence = 0.7;
      expectedImprovement = 0.2;
      reasoning = `Increasing trend detected. Adjusting threshold to ${newThreshold.toFixed(2)} to reduce false positives`;
      riskLevel = 'medium';
    } else if (pattern.frequency < 0.01 && currentThreshold < percentile99) {
      action = 'decrease';
      newThreshold = Math.min(currentThreshold * 0.9, percentile95);
      confidence = 0.6;
      expectedImprovement = 0.1;
      reasoning = `Very low alert frequency suggests threshold may be too high. Adjusting to ${newThreshold.toFixed(2)}`;
      riskLevel = 'high';
    } else {
      action = 'maintain';
      reasoning = `Current threshold appears appropriate based on pattern analysis`;
      riskLevel = 'low';
    }

    return {
      metric,
      action,
      newThreshold,
      confidence,
      expectedImprovement,
      reasoning,
      riskLevel
    };
  }

  /**
   * Calculate percentile value
   */
  private calculatePercentile(data: number[], percentile: number): number {
    const sorted = [...data].sort((a, b) => a - b);
    const index = Math.ceil((percentile * sorted.length) - 1);
    return sorted[Math.max(0, index)];
  }

  /**
   * Apply automatic tuning for low-risk recommendations
   */
  private applyAutomaticTuning(recommendations: TuningRecommendation[]): void {
    const lowRiskRecommendations = recommendations.filter(r => r.riskLevel === 'low');
    
    for (const rec of lowRiskRecommendations) {
      if (rec.action === 'suppress') {
        console.log(`🔇 Suppressing alerts for ${rec.metric}: ${rec.reasoning}`);
        // In production, this would update the monitoring system
      } else if (rec.action === 'increase' && rec.newThreshold) {
        console.log(`📈 Increasing threshold for ${rec.metric} to ${rec.newThreshold}: ${rec.reasoning}`);
        // In production, this would update the threshold
      }
    }
  }

  /**
   * Get current alert patterns
   */
  getAlertPatterns(): AlertPattern[] {
    return Array.from(this.alertPatterns.values());
  }

  /**
   * Get tuning recommendations
   */
  getTuningRecommendations(): TuningRecommendation[] {
    return [...this.tuningHistory];
  }

  /**
   * Get alert correlations
   */
  getAlertCorrelations(): AlertCorrelation[] {
    return Array.from(this.correlationRules.values());
  }

  /**
   * Get tuning statistics
   */
  getTuningStatistics(): {
    totalPatterns: number;
    highSeverityPatterns: number;
    averageFalsePositiveRate: number;
    totalRecommendations: number;
    appliedRecommendations: number;
  } {
    const patterns = Array.from(this.alertPatterns.values());
    const recommendations = this.tuningHistory;

    return {
      totalPatterns: patterns.length,
      highSeverityPatterns: patterns.filter(p => p.severity === 'high').length,
      averageFalsePositiveRate: patterns.length > 0 
        ? patterns.reduce((sum, p) => sum + p.falsePositiveRate, 0) / patterns.length 
        : 0,
      totalRecommendations: recommendations.length,
      appliedRecommendations: recommendations.filter(r => r.riskLevel === 'low').length
    };
  }

  /**
   * Manually apply a tuning recommendation
   */
  async applyRecommendation(recommendationId: string): Promise<boolean> {
    const recommendation = this.tuningHistory.find(r => r.metric === recommendationId);
    if (!recommendation) return false;

    try {
      console.log(`🔧 Applying recommendation for ${recommendation.metric}: ${recommendation.reasoning}`);
      
      // In production, this would update the actual monitoring system
      // For now, we'll just log the action
      if (recommendation.action === 'increase' && recommendation.newThreshold) {
        console.log(`📈 Setting threshold for ${recommendation.metric} to ${recommendation.newThreshold}`);
      } else if (recommendation.action === 'decrease' && recommendation.newThreshold) {
        console.log(`📉 Setting threshold for ${recommendation.metric} to ${recommendation.newThreshold}`);
      } else if (recommendation.action === 'suppress') {
        console.log(`🔇 Suppressing alerts for ${recommendation.metric}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to apply recommendation for ${recommendation.metric}:`, error);
      return false;
    }
  }
}

export const alertTuner = new AlertTuner();

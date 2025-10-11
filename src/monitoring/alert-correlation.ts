/**
 * Alert Correlation System
 * Intelligent alert correlation and deduplication to reduce noise
 */


export interface AlertEvent {
  id: string;
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  metadata: Record<string, any>;
}

export interface CorrelatedAlertGroup {
  id: string;
  primaryAlert: AlertEvent;
  relatedAlerts: AlertEvent[];
  correlationStrength: number;
  pattern: string;
  rootCause: string;
  suggestedAction: string;
  createdAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'investigating' | 'resolved' | 'suppressed';
}

export interface CorrelationRule {
  id: string;
  name: string;
  pattern: string;
  conditions: CorrelationCondition[];
  action: 'group' | 'suppress' | 'escalate' | 'investigate';
  priority: number;
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface CorrelationCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=' | 'contains' | 'within';
  value: number | string;
  timeWindow: number; // seconds
  required: boolean;
}

export interface DeduplicationRule {
  id: string;
  name: string;
  metrics: string[];
  timeWindow: number; // seconds
  action: 'keep_first' | 'keep_latest' | 'merge' | 'suppress';
  enabled: boolean;
}

export class AlertCorrelationEngine {
  private correlationRules: Map<string, CorrelationRule> = new Map();
  private deduplicationRules: Map<string, DeduplicationRule> = new Map();
  private activeGroups: Map<string, CorrelatedAlertGroup> = new Map();
  private alertHistory: AlertEvent[] = [];
  private correlationMatrix: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.startCorrelationProcess();
  }

  /**
   * Initialize default correlation and deduplication rules
   */
  private initializeDefaultRules(): void {
    // Correlation rules
    const correlationRules: CorrelationRule[] = [
      {
        id: 'cpu_memory_correlation',
        name: 'CPU and Memory Correlation',
        pattern: 'cpu_memory_spike',
        conditions: [
          { metric: 'cpu_usage', operator: '>', value: 80, timeWindow: 300, required: true },
          { metric: 'memory_usage', operator: '>', value: 85, timeWindow: 300, required: true }
        ],
        action: 'group',
        priority: 1,
        enabled: true,
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'response_time_error_correlation',
        name: 'Response Time and Error Rate Correlation',
        pattern: 'performance_degradation',
        conditions: [
          { metric: 'response_time', operator: '>', value: 2000, timeWindow: 600, required: true },
          { metric: 'error_rate', operator: '>', value: 0.05, timeWindow: 600, required: true }
        ],
        action: 'escalate',
        priority: 2,
        enabled: true,
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'database_connection_correlation',
        name: 'Database Connection Issues',
        pattern: 'database_issues',
        conditions: [
          { metric: 'database_connections', operator: '>', value: 45, timeWindow: 300, required: true },
          { metric: 'response_time', operator: '>', value: 1500, timeWindow: 300, required: false }
        ],
        action: 'investigate',
        priority: 3,
        enabled: true,
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'agent_coordination_correlation',
        name: 'Agent Coordination Issues',
        pattern: 'agent_coordination_problems',
        conditions: [
          { metric: 'multi_agent_coordination_time', operator: '>', value: 5000, timeWindow: 300, required: true },
          { metric: 'coordination_quality_score', operator: '<', value: 0.7, timeWindow: 300, required: false }
        ],
        action: 'group',
        priority: 4,
        enabled: true,
        createdAt: new Date(),
        triggerCount: 0
      }
    ];

    correlationRules.forEach(rule => {
      this.correlationRules.set(rule.id, rule);
    });

    // Deduplication rules
    const deduplicationRules: DeduplicationRule[] = [
      {
        id: 'response_time_dedup',
        name: 'Response Time Deduplication',
        metrics: ['response_time'],
        timeWindow: 300, // 5 minutes
        action: 'keep_latest',
        enabled: true
      },
      {
        id: 'error_rate_dedup',
        name: 'Error Rate Deduplication',
        metrics: ['error_rate'],
        timeWindow: 600, // 10 minutes
        action: 'merge',
        enabled: true
      },
      {
        id: 'resource_usage_dedup',
        name: 'Resource Usage Deduplication',
        metrics: ['cpu_usage', 'memory_usage'],
        timeWindow: 180, // 3 minutes
        action: 'keep_latest',
        enabled: true
      }
    ];

    deduplicationRules.forEach(rule => {
      this.deduplicationRules.set(rule.id, rule);
    });
  }

  /**
   * Start the correlation process
   */
  private startCorrelationProcess(): void {
    // Process new alerts every 30 seconds
    setInterval(() => {
      this.processNewAlerts();
    }, 30000);

    // Clean up old groups every 5 minutes
    setInterval(() => {
      this.cleanupOldGroups();
    }, 5 * 60 * 1000);

    // Update correlation matrix every hour
    setInterval(() => {
      this.updateCorrelationMatrix();
    }, 60 * 60 * 1000);

    console.log('🔗 Alert correlation engine started');
  }

  /**
   * Process new alerts for correlation
   */
  private async processNewAlerts(): Promise<void> {
    try {
      // Get recent alerts (last 5 minutes)
      const recentAlerts = this.alertHistory.filter(
        alert => Date.now() - alert.timestamp.getTime() < 5 * 60 * 1000
      );

      if (recentAlerts.length === 0) return;

      // Apply deduplication first
      const deduplicatedAlerts = this.applyDeduplication(recentAlerts);

      // Process correlation rules
      for (const rule of this.correlationRules.values()) {
        if (!rule.enabled) continue;

        const matchingAlerts = this.findMatchingAlerts(deduplicatedAlerts, rule);
        if (matchingAlerts.length > 0) {
          await this.handleCorrelationMatch(rule, matchingAlerts);
        }
      }

      // Update correlation matrix
      this.updateCorrelationMatrix();

    } catch (error) {
      console.error('❌ Error processing alerts for correlation:', error);
    }
  }

  /**
   * Apply deduplication rules
   */
  private applyDeduplication(alerts: AlertEvent[]): AlertEvent[] {
    const deduplicated: AlertEvent[] = [];
    const processed = new Set<string>();

    for (const rule of this.deduplicationRules.values()) {
      if (!rule.enabled) continue;

      const ruleAlerts = alerts.filter(alert => 
        rule.metrics.includes(alert.metric) && !processed.has(alert.id)
      );

      if (ruleAlerts.length === 0) continue;

      const grouped = this.groupAlertsByTimeWindow(ruleAlerts, rule.timeWindow);
      
      for (const group of grouped) {
        const deduplicatedAlert = this.deduplicateGroup(group, rule);
        if (deduplicatedAlert) {
          deduplicated.push(deduplicatedAlert);
          group.forEach(alert => processed.add(alert.id));
        }
      }
    }

    // Add non-duplicated alerts
    alerts.forEach(alert => {
      if (!processed.has(alert.id)) {
        deduplicated.push(alert);
      }
    });

    return deduplicated;
  }

  /**
   * Group alerts by time window
   */
  private groupAlertsByTimeWindow(alerts: AlertEvent[], timeWindow: number): AlertEvent[][] {
    const groups: AlertEvent[][] = [];
    const sorted = alerts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let currentGroup: AlertEvent[] = [];
    let groupStart = 0;

    for (let i = 0; i < sorted.length; i++) {
      const alert = sorted[i];
      
      if (currentGroup.length === 0) {
        currentGroup.push(alert);
        groupStart = alert.timestamp.getTime();
      } else if (alert.timestamp.getTime() - groupStart <= timeWindow * 1000) {
        currentGroup.push(alert);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [alert];
        groupStart = alert.timestamp.getTime();
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Deduplicate a group of alerts
   */
  private deduplicateGroup(group: AlertEvent[], rule: DeduplicationRule): AlertEvent | null {
    if (group.length === 0) return null;
    if (group.length === 1) return group[0];

    switch (rule.action) {
      case 'keep_first':
        return group[0];
      case 'keep_latest':
        return group[group.length - 1];
      case 'merge':
        return this.mergeAlerts(group);
      case 'suppress':
        return null; // Suppress all alerts in group
      default:
        return group[0];
    }
  }

  /**
   * Merge multiple alerts into one
   */
  private mergeAlerts(alerts: AlertEvent[]): AlertEvent {
    const primary = alerts[0];
    const merged: AlertEvent = {
      ...primary,
      id: `merged_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      value: Math.max(...alerts.map(a => a.value)),
      severity: this.getHighestSeverity(alerts),
      metadata: {
        ...primary.metadata,
        mergedFrom: alerts.map(a => a.id),
        mergedCount: alerts.length,
        originalValues: alerts.map(a => a.value)
      }
    };

    return merged;
  }

  /**
   * Get highest severity from a group of alerts
   */
  private getHighestSeverity(alerts: AlertEvent[]): 'low' | 'medium' | 'high' | 'critical' {
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    return alerts.reduce((highest, alert) => 
      severityOrder[alert.severity] > severityOrder[highest] ? alert.severity : highest
    , 'low' as const);
  }

  /**
   * Find alerts matching a correlation rule
   */
  private findMatchingAlerts(alerts: AlertEvent[], rule: CorrelationRule): AlertEvent[] {
    const matching: AlertEvent[] = [];
    const timeWindow = Math.max(...rule.conditions.map(c => c.timeWindow)) * 1000;
    const now = Date.now();

    for (const alert of alerts) {
      if (now - alert.timestamp.getTime() > timeWindow) continue;

      const conditionMatches = rule.conditions.map(condition => {
        if (alert.metric !== condition.metric) return !condition.required;
        
        return this.evaluateCondition(alert, condition);
      });

      const allRequiredMatch = rule.conditions
        .filter(c => c.required)
        .every((_, index) => conditionMatches[index]);

      if (allRequiredMatch) {
        matching.push(alert);
      }
    }

    return matching;
  }

  /**
   * Evaluate a correlation condition
   */
  private evaluateCondition(alert: AlertEvent, condition: CorrelationCondition): boolean {
    const { operator, value } = condition;

    switch (operator) {
      case '>':
        return alert.value > (value as number);
      case '<':
        return alert.value < (value as number);
      case '>=':
        return alert.value >= (value as number);
      case '<=':
        return alert.value <= (value as number);
      case '=':
        return alert.value === value;
      case '!=':
        return alert.value !== value;
      case 'contains':
        return alert.metadata[condition.metric]?.toString().includes(value as string) || false;
      case 'within':
        return Math.abs(alert.value - (value as number)) <= (value as number) * 0.1;
      default:
        return false;
    }
  }

  /**
   * Handle correlation rule match
   */
  private async handleCorrelationMatch(rule: CorrelationRule, alerts: AlertEvent[]): Promise<void> {
    rule.triggerCount++;
    rule.lastTriggered = new Date();

    console.log(`🔗 Correlation rule '${rule.name}' triggered with ${alerts.length} alerts`);

    switch (rule.action) {
      case 'group':
        await this.createCorrelatedGroup(rule, alerts);
        break;
      case 'suppress':
        console.log(`🔇 Suppressing ${alerts.length} alerts due to correlation rule '${rule.name}'`);
        break;
      case 'escalate':
        await this.escalateAlerts(rule, alerts);
        break;
      case 'investigate':
        await this.investigateAlerts(rule, alerts);
        break;
    }
  }

  /**
   * Create a correlated alert group
   */
  private async createCorrelatedGroup(rule: CorrelationRule, alerts: AlertEvent[]): Promise<void> {
    const primaryAlert = alerts.reduce((primary, alert) => 
      alert.severity === 'critical' || 
      (alert.severity === 'high' && primary.severity !== 'critical') ||
      (alert.severity === 'medium' && !['critical', 'high'].includes(primary.severity))
        ? alert : primary
    );

    const relatedAlerts = alerts.filter(alert => alert.id !== primaryAlert.id);

    const group: CorrelatedAlertGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      primaryAlert,
      relatedAlerts,
      correlationStrength: this.calculateCorrelationStrength(alerts),
      pattern: rule.pattern,
      rootCause: this.identifyRootCause(alerts),
      suggestedAction: this.suggestAction(rule, alerts),
      createdAt: new Date(),
      status: 'active'
    };

    this.activeGroups.set(group.id, group);

    console.log(`📊 Created correlated alert group '${group.id}' with ${alerts.length} alerts`);
    console.log(`🎯 Root cause: ${group.rootCause}`);
    console.log(`💡 Suggested action: ${group.suggestedAction}`);
  }

  /**
   * Calculate correlation strength between alerts
   */
  private calculateCorrelationStrength(alerts: AlertEvent[]): number {
    if (alerts.length < 2) return 1.0;

    // Simple correlation strength based on time proximity and metric similarity
    const timeSpan = Math.max(...alerts.map(a => a.timestamp.getTime())) - 
                    Math.min(...alerts.map(a => a.timestamp.getTime()));
    const timeScore = Math.max(0, 1 - (timeSpan / (5 * 60 * 1000))); // 5 minutes max

    const metricDiversity = new Set(alerts.map(a => a.metric)).size;
    const diversityScore = 1 - (metricDiversity - 1) / (alerts.length - 1);

    return (timeScore + diversityScore) / 2;
  }

  /**
   * Identify root cause from alerts
   */
  private identifyRootCause(alerts: AlertEvent[]): string {
    const metrics = alerts.map(a => a.metric);
    const uniqueMetrics = [...new Set(metrics)];

    if (uniqueMetrics.includes('cpu_usage') && uniqueMetrics.includes('memory_usage')) {
      return 'Resource exhaustion - high CPU and memory usage';
    }
    if (uniqueMetrics.includes('response_time') && uniqueMetrics.includes('error_rate')) {
      return 'Performance degradation - increased response time and error rate';
    }
    if (uniqueMetrics.includes('database_connections')) {
      return 'Database connection issues';
    }
    if (uniqueMetrics.includes('multi_agent_coordination_time')) {
      return 'Agent coordination problems';
    }
    if (uniqueMetrics.includes('queue_length')) {
      return 'Queue backlog - processing delays';
    }

    return `Multiple system issues detected (${uniqueMetrics.join(', ')})`;
  }

  /**
   * Suggest action based on rule and alerts
   */
  private suggestAction(rule: CorrelationRule, alerts: AlertEvent[]): string {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const highCount = alerts.filter(a => a.severity === 'high').length;

    if (criticalCount > 0) {
      return 'Immediate investigation required - critical alerts detected';
    }
    if (highCount > 2) {
      return 'High priority investigation - multiple high-severity alerts';
    }
    if (rule.pattern === 'performance_degradation') {
      return 'Check system resources and database performance';
    }
    if (rule.pattern === 'database_issues') {
      return 'Investigate database connection pool and query performance';
    }
    if (rule.pattern === 'agent_coordination_problems') {
      return 'Review agent coordination logic and communication protocols';
    }

    return 'Monitor system and investigate if issues persist';
  }

  /**
   * Escalate alerts
   */
  private async escalateAlerts(rule: CorrelationRule, alerts: AlertEvent[]): Promise<void> {
    console.log(`🚨 Escalating ${alerts.length} alerts due to correlation rule '${rule.name}'`);
    
    // In production, this would send notifications to on-call engineers
    // For now, we'll just log the escalation
    alerts.forEach(alert => {
      console.log(`📢 ESCALATED: ${alert.metric} = ${alert.value} (threshold: ${alert.threshold})`);
    });
  }

  /**
   * Investigate alerts
   */
  private async investigateAlerts(rule: CorrelationRule, alerts: AlertEvent[]): Promise<void> {
    console.log(`🔍 Investigation triggered for ${alerts.length} alerts due to correlation rule '${rule.name}'`);
    
    // In production, this would create investigation tickets or trigger automated diagnostics
    const investigationId = `investigation_${Date.now()}`;
    console.log(`🎫 Created investigation ticket: ${investigationId}`);
  }

  /**
   * Update correlation matrix
   */
  private updateCorrelationMatrix(): void {
    const metrics = [...new Set(this.alertHistory.map(a => a.metric))];
    
    for (const metric1 of metrics) {
      if (!this.correlationMatrix.has(metric1)) {
        this.correlationMatrix.set(metric1, new Map());
      }
      
      for (const metric2 of metrics) {
        if (metric1 === metric2) continue;
        
        const correlation = this.calculateMetricCorrelation(metric1, metric2);
        this.correlationMatrix.get(metric1)!.set(metric2, correlation);
      }
    }
  }

  /**
   * Calculate correlation between two metrics
   */
  private calculateMetricCorrelation(metric1: string, metric2: string): number {
    const alerts1 = this.alertHistory.filter(a => a.metric === metric1);
    const alerts2 = this.alertHistory.filter(a => a.metric === metric2);
    
    if (alerts1.length === 0 || alerts2.length === 0) return 0;

    // Find time-aligned alerts
    const alignedPairs: { value1: number; value2: number }[] = [];
    
    for (const alert1 of alerts1) {
      const timeWindow = 5 * 60 * 1000; // 5 minutes
      const nearbyAlerts2 = alerts2.filter(a2 => 
        Math.abs(a2.timestamp.getTime() - alert1.timestamp.getTime()) <= timeWindow
      );
      
      if (nearbyAlerts2.length > 0) {
        const closest = nearbyAlerts2.reduce((closest, current) => 
          Math.abs(current.timestamp.getTime() - alert1.timestamp.getTime()) < 
          Math.abs(closest.timestamp.getTime() - alert1.timestamp.getTime()) 
            ? current : closest
        );
        
        alignedPairs.push({ value1: alert1.value, value2: closest.value });
      }
    }

    if (alignedPairs.length < 2) return 0;

    // Calculate Pearson correlation
    const values1 = alignedPairs.map(p => p.value1);
    const values2 = alignedPairs.map(p => p.value2);
    
    const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
    const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;
    
    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;
    
    for (let i = 0; i < values1.length; i++) {
      const diff1 = values1[i] - mean1;
      const diff2 = values2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sumSq1 * sumSq2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Clean up old groups
   */
  private cleanupOldGroups(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [id, group] of this.activeGroups.entries()) {
      if (group.createdAt.getTime() < cutoffTime) {
        this.activeGroups.delete(id);
        console.log(`🧹 Cleaned up old alert group: ${id}`);
      }
    }

    // Clean up old alert history (keep last 7 days)
    const historyCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.alertHistory = this.alertHistory.filter(
      alert => alert.timestamp.getTime() > historyCutoff
    );
  }

  /**
   * Add a new alert for correlation processing
   */
  addAlert(alert: AlertEvent): void {
    this.alertHistory.push(alert);
    
    // Keep only last 1000 alerts in memory
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }
  }

  /**
   * Get active correlated groups
   */
  getActiveGroups(): CorrelatedAlertGroup[] {
    return Array.from(this.activeGroups.values());
  }

  /**
   * Get correlation statistics
   */
  getCorrelationStatistics(): {
    totalGroups: number;
    activeGroups: number;
    totalRules: number;
    enabledRules: number;
    totalAlerts: number;
    correlationRate: number;
  } {
    const totalGroups = this.activeGroups.size;
    const activeGroups = Array.from(this.activeGroups.values())
      .filter(g => g.status === 'active').length;
    const totalRules = this.correlationRules.size;
    const enabledRules = Array.from(this.correlationRules.values())
      .filter(r => r.enabled).length;
    const totalAlerts = this.alertHistory.length;
    
    const recentAlerts = this.alertHistory.filter(
      alert => Date.now() - alert.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );
    const correlatedAlerts = Array.from(this.activeGroups.values())
      .flatMap(g => [g.primaryAlert, ...g.relatedAlerts])
      .filter(alert => 
        recentAlerts.some(ra => ra.id === alert.id)
      ).length;
    
    const correlationRate = recentAlerts.length > 0 
      ? correlatedAlerts / recentAlerts.length 
      : 0;

    return {
      totalGroups,
      activeGroups,
      totalRules,
      enabledRules,
      totalAlerts,
      correlationRate
    };
  }
}

export const alertCorrelationEngine = new AlertCorrelationEngine();

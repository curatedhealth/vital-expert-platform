/**
 * Data Consistency Manager
 * Multiple consistency models and conflict resolution
 */

export type ConsistencyModel = 'strong' | 'eventual' | 'causal' | 'session' | 'bounded_staleness';

export interface ConsistencyRule {
  id: string;
  name: string;
  model: ConsistencyModel;
  scope: string; // 'global' | 'user' | 'session' | 'entity'
  entityType: string;
  requirements: {
    readConsistency: boolean;
    writeConsistency: boolean;
    conflictResolution: 'last_write_wins' | 'first_write_wins' | 'merge' | 'custom';
    stalenessThreshold?: number; // milliseconds
    replicationFactor?: number;
  };
  enabled: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

export interface ConsistencyViolation {
  id: string;
  ruleId: string;
  entityId: string;
  entityType: string;
  violationType: 'read_inconsistency' | 'write_conflict' | 'staleness' | 'replication_lag';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'detected' | 'resolving' | 'resolved' | 'ignored';
  metadata: Record<string, any>;
}

export interface DataOperation {
  id: string;
  type: 'create' | 'read' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  data: any;
  timestamp: Date;
  userId: string;
  sessionId: string;
  consistencyLevel: ConsistencyModel;
  version: number;
  dependencies: string[]; // IDs of operations this depends on
}

export interface ConflictResolution {
  id: string;
  conflictId: string;
  strategy: 'last_write_wins' | 'first_write_wins' | 'merge' | 'custom' | 'manual';
  resolution: any;
  resolvedBy: string;
  resolvedAt: Date;
  confidence: number;
  metadata: Record<string, any>;
}

export interface ConsistencyMetrics {
  timestamp: Date;
  totalOperations: number;
  consistencyViolations: number;
  conflictResolutions: number;
  averageStaleness: number;
  replicationLag: number;
  consistencyScore: number; // 0-1
}

export class ConsistencyManager {
  private rules: Map<string, ConsistencyRule> = new Map();
  private violations: Map<string, ConsistencyViolation> = new Map();
  private operations: Map<string, DataOperation> = new Map();
  private resolutions: Map<string, ConflictResolution> = new Map();
  private metrics: ConsistencyMetrics[] = [];
  private isMonitoring: boolean = false;

  constructor() {
    this.initializeDefaultRules();
    this.startConsistencyMonitoring();
  }

  /**
   * Initialize default consistency rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: ConsistencyRule[] = [
      {
        id: 'user_preferences_strong',
        name: 'User Preferences - Strong Consistency',
        model: 'strong',
        scope: 'user',
        entityType: 'user_preferences',
        requirements: {
          readConsistency: true,
          writeConsistency: true,
          conflictResolution: 'last_write_wins',
          replicationFactor: 3
        },
        enabled: true,
        createdAt: new Date(),
        lastUpdated: new Date()
      },
      {
        id: 'chat_memory_eventual',
        name: 'Chat Memory - Eventual Consistency',
        model: 'eventual',
        scope: 'session',
        entityType: 'chat_memory',
        requirements: {
          readConsistency: false,
          writeConsistency: false,
          conflictResolution: 'merge',
          stalenessThreshold: 5000 // 5 seconds
        },
        enabled: true,
        createdAt: new Date(),
        lastUpdated: new Date()
      },
      {
        id: 'agent_selection_causal',
        name: 'Agent Selection - Causal Consistency',
        model: 'causal',
        scope: 'session',
        entityType: 'agent_selection',
        requirements: {
          readConsistency: true,
          writeConsistency: false,
          conflictResolution: 'last_write_wins'
        },
        enabled: true,
        createdAt: new Date(),
        lastUpdated: new Date()
      },
      {
        id: 'learning_patterns_session',
        name: 'Learning Patterns - Session Consistency',
        model: 'session',
        scope: 'session',
        entityType: 'learning_patterns',
        requirements: {
          readConsistency: true,
          writeConsistency: true,
          conflictResolution: 'merge'
        },
        enabled: true,
        createdAt: new Date(),
        lastUpdated: new Date()
      },
      {
        id: 'system_metrics_bounded_staleness',
        name: 'System Metrics - Bounded Staleness',
        model: 'bounded_staleness',
        scope: 'global',
        entityType: 'system_metrics',
        requirements: {
          readConsistency: false,
          writeConsistency: false,
          conflictResolution: 'last_write_wins',
          stalenessThreshold: 10000 // 10 seconds
        },
        enabled: true,
        createdAt: new Date(),
        lastUpdated: new Date()
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Start consistency monitoring
   */
  private startConsistencyMonitoring(): void {
    this.isMonitoring = true;

    // Monitor consistency every 30 seconds
    setInterval(() => {
      this.monitorConsistency();
    }, 30 * 1000);

    // Resolve conflicts every 2 minutes
    setInterval(() => {
      this.resolveConflicts();
    }, 2 * 60 * 1000);

    // Generate metrics every 5 minutes
    setInterval(() => {
      this.generateConsistencyMetrics();
    }, 5 * 60 * 1000);

    console.log('🔄 Consistency manager started');
  }

  /**
   * Register a data operation
   */
  registerOperation(operation: Omit<DataOperation, 'id' | 'timestamp' | 'version'>): string {
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const version = this.getNextVersion(operation.entityType, operation.entityId);
    
    const fullOperation: DataOperation = {
      ...operation,
      id,
      timestamp: new Date(),
      version
    };

    this.operations.set(id, fullOperation);

    // Check for consistency violations
    this.checkConsistencyViolations(fullOperation);

    return id;
  }

  /**
   * Get next version number for entity
   */
  private getNextVersion(entityType: string, entityId: string): number {
    const existingOps = Array.from(this.operations.values())
      .filter(op => op.entityType === entityType && op.entityId === entityId)
      .sort((a, b) => b.version - a.version);

    return existingOps.length > 0 ? existingOps[0].version + 1 : 1;
  }

  /**
   * Check for consistency violations
   */
  private checkConsistencyViolations(operation: DataOperation): void {
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => 
        rule.enabled && 
        rule.entityType === operation.entityType &&
        this.isOperationInScope(operation, rule)
      );

    for (const rule of applicableRules) {
      const violation = this.detectViolation(operation, rule);
      if (violation) {
        this.violations.set(violation.id, violation);
        console.warn(`⚠️ Consistency violation detected: ${violation.description}`);
      }
    }
  }

  /**
   * Check if operation is in rule scope
   */
  private isOperationInScope(operation: DataOperation, rule: ConsistencyRule): boolean {
    switch (rule.scope) {
      case 'global':
        return true;
      case 'user':
        return true; // All operations have userId
      case 'session':
        return !!operation.sessionId;
      case 'entity':
        return operation.entityType === rule.entityType;
      default:
        return false;
    }
  }

  /**
   * Detect consistency violation
   */
  private detectViolation(operation: DataOperation, rule: ConsistencyRule): ConsistencyViolation | null {
    // Check for read consistency violations
    if (rule.requirements.readConsistency && operation.type === 'read') {
      const staleness = this.checkStaleness(operation, rule);
      if (staleness > (rule.requirements.stalenessThreshold || 0)) {
        return {
          id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          entityId: operation.entityId,
          entityType: operation.entityType,
          violationType: 'staleness',
          severity: staleness > 30000 ? 'high' : 'medium',
          description: `Data staleness of ${staleness}ms exceeds threshold`,
          detectedAt: new Date(),
          status: 'detected',
          metadata: { operationId: operation.id, staleness }
        };
      }
    }

    // Check for write conflicts
    if (rule.requirements.writeConsistency && (operation.type === 'update' || operation.type === 'delete')) {
      const conflicts = this.detectWriteConflicts(operation, rule);
      if (conflicts.length > 0) {
        return {
          id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          entityId: operation.entityId,
          entityType: operation.entityType,
          violationType: 'write_conflict',
          severity: 'high',
          description: `Write conflict detected with ${conflicts.length} concurrent operations`,
          detectedAt: new Date(),
          status: 'detected',
          metadata: { operationId: operation.id, conflicts }
        };
      }
    }

    return null;
  }

  /**
   * Check data staleness
   */
  private checkStaleness(operation: DataOperation, rule: ConsistencyRule): number {
    const latestWrite = this.getLatestWriteOperation(operation.entityType, operation.entityId);
    if (!latestWrite) return 0;

    return operation.timestamp.getTime() - latestWrite.timestamp.getTime();
  }

  /**
   * Get latest write operation for entity
   */
  private getLatestWriteOperation(entityType: string, entityId: string): DataOperation | null {
    const writeOps = Array.from(this.operations.values())
      .filter(op => 
        op.entityType === entityType && 
        op.entityId === entityId && 
        (op.type === 'create' || op.type === 'update')
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return writeOps.length > 0 ? writeOps[0] : null;
  }

  /**
   * Detect write conflicts
   */
  private detectWriteConflicts(operation: DataOperation, rule: ConsistencyRule): DataOperation[] {
    const timeWindow = 5000; // 5 seconds
    const cutoffTime = operation.timestamp.getTime() - timeWindow;

    return Array.from(this.operations.values())
      .filter(op => 
        op.entityType === operation.entityType &&
        op.entityId === operation.entityId &&
        op.type === 'update' &&
        op.timestamp.getTime() > cutoffTime &&
        op.id !== operation.id
      );
  }

  /**
   * Monitor consistency across the system
   */
  private monitorConsistency(): void {
    console.log('🔍 Monitoring data consistency...');

    // Check for stale data
    this.checkStaleData();

    // Check for replication lag
    this.checkReplicationLag();

    // Check for orphaned operations
    this.checkOrphanedOperations();
  }

  /**
   * Check for stale data
   */
  private checkStaleData(): void {
    const now = Date.now();
    const staleThreshold = 60000; // 1 minute

    for (const [ruleId, rule] of this.rules.entries()) {
      if (!rule.enabled || !rule.requirements.stalenessThreshold) continue;

      const staleOps = Array.from(this.operations.values())
        .filter(op => 
          op.entityType === rule.entityType &&
          op.type === 'read' &&
          now - op.timestamp.getTime() > rule.requirements.stalenessThreshold!
        );

      if (staleOps.length > 0) {
        console.warn(`⚠️ Found ${staleOps.length} stale read operations for ${rule.name}`);
      }
    }
  }

  /**
   * Check replication lag
   */
  private checkReplicationLag(): void {
    // In production, this would check actual replication lag
    // For now, we'll simulate the check
    const simulatedLag = Math.random() * 1000; // 0-1000ms
    
    if (simulatedLag > 500) {
      console.warn(`⚠️ High replication lag detected: ${simulatedLag.toFixed(1)}ms`);
    }
  }

  /**
   * Check for orphaned operations
   */
  private checkOrphanedOperations(): void {
    const orphanedOps = Array.from(this.operations.values())
      .filter(op => 
        op.dependencies.length > 0 &&
        !op.dependencies.every(depId => this.operations.has(depId))
      );

    if (orphanedOps.length > 0) {
      console.warn(`⚠️ Found ${orphanedOps.length} orphaned operations`);
    }
  }

  /**
   * Resolve conflicts
   */
  private resolveConflicts(): void {
    const unresolvedViolations = Array.from(this.violations.values())
      .filter(v => v.status === 'detected');

    for (const violation of unresolvedViolations) {
      try {
        const resolution = this.resolveViolation(violation);
        if (resolution) {
          this.resolutions.set(resolution.id, resolution);
          violation.status = 'resolved';
          violation.resolvedAt = new Date();
          console.log(`✅ Resolved consistency violation: ${violation.id}`);
        }
      } catch (error) {
        console.error(`❌ Failed to resolve violation ${violation.id}:`, error);
        violation.status = 'ignored';
      }
    }
  }

  /**
   * Resolve specific violation
   */
  private resolveViolation(violation: ConsistencyViolation): ConflictResolution | null {
    const rule = this.rules.get(violation.ruleId);
    if (!rule) return null;

    const strategy = rule.requirements.conflictResolution;
    let resolution: any = null;

    switch (strategy) {
      case 'last_write_wins':
        resolution = this.resolveLastWriteWins(violation);
        break;
      case 'first_write_wins':
        resolution = this.resolveFirstWriteWins(violation);
        break;
      case 'merge':
        resolution = this.resolveMerge(violation);
        break;
      case 'custom':
        resolution = this.resolveCustom(violation);
        break;
      default:
        return null;
    }

    if (!resolution) return null;

    return {
      id: `resolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conflictId: violation.id,
      strategy,
      resolution,
      resolvedBy: 'consistency_manager',
      resolvedAt: new Date(),
      confidence: this.calculateResolutionConfidence(violation, resolution),
      metadata: { violationType: violation.violationType }
    };
  }

  /**
   * Resolve using last write wins strategy
   */
  private resolveLastWriteWins(violation: ConsistencyViolation): any {
    const operations = Array.from(this.operations.values())
      .filter(op => 
        op.entityType === violation.entityType &&
        op.entityId === violation.entityId &&
        (op.type === 'create' || op.type === 'update')
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return operations.length > 0 ? operations[0].data : null;
  }

  /**
   * Resolve using first write wins strategy
   */
  private resolveFirstWriteWins(violation: ConsistencyViolation): any {
    const operations = Array.from(this.operations.values())
      .filter(op => 
        op.entityType === violation.entityType &&
        op.entityId === violation.entityId &&
        (op.type === 'create' || op.type === 'update')
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return operations.length > 0 ? operations[0].data : null;
  }

  /**
   * Resolve using merge strategy
   */
  private resolveMerge(violation: ConsistencyViolation): any {
    const operations = Array.from(this.operations.values())
      .filter(op => 
        op.entityType === violation.entityType &&
        op.entityId === violation.entityId &&
        (op.type === 'create' || op.type === 'update')
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (operations.length === 0) return null;

    // Simple merge strategy - combine all data, with later operations taking precedence
    const merged = { ...operations[0].data };
    
    for (let i = 1; i < operations.length; i++) {
      Object.assign(merged, operations[i].data);
    }

    return merged;
  }

  /**
   * Resolve using custom strategy
   */
  private resolveCustom(violation: ConsistencyViolation): any {
    // Custom resolution logic based on entity type
    switch (violation.entityType) {
      case 'user_preferences':
        return this.resolveUserPreferences(violation);
      case 'chat_memory':
        return this.resolveChatMemory(violation);
      case 'learning_patterns':
        return this.resolveLearningPatterns(violation);
      default:
        return this.resolveLastWriteWins(violation);
    }
  }

  /**
   * Resolve user preferences conflicts
   */
  private resolveUserPreferences(violation: ConsistencyViolation): any {
    // For user preferences, prioritize explicit user choices over inferred ones
    const operations = Array.from(this.operations.values())
      .filter(op => 
        op.entityType === violation.entityType &&
        op.entityId === violation.entityId &&
        (op.type === 'create' || op.type === 'update')
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Look for operations with explicit user input
    const explicitOps = operations.filter(op => 
      op.metadata?.source === 'explicit' || op.metadata?.userInput === true
    );

    if (explicitOps.length > 0) {
      return explicitOps[0].data;
    }

    // Fall back to most recent
    return operations.length > 0 ? operations[0].data : null;
  }

  /**
   * Resolve chat memory conflicts
   */
  private resolveChatMemory(violation: ConsistencyViolation): any {
    // For chat memory, merge all memories chronologically
    const operations = Array.from(this.operations.values())
      .filter(op => 
        op.entityType === violation.entityType &&
        op.entityId === violation.entityId &&
        (op.type === 'create' || op.type === 'update')
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (operations.length === 0) return null;

    // Merge memories chronologically
    const merged = {
      messages: [],
      context: {},
      metadata: {}
    };

    operations.forEach(op => {
      if (op.data.messages) {
        merged.messages.push(...op.data.messages);
      }
      if (op.data.context) {
        Object.assign(merged.context, op.data.context);
      }
      if (op.data.metadata) {
        Object.assign(merged.metadata, op.data.metadata);
      }
    });

    return merged;
  }

  /**
   * Resolve learning patterns conflicts
   */
  private resolveLearningPatterns(violation: ConsistencyViolation): any {
    // For learning patterns, combine all patterns and recalculate confidence
    const operations = Array.from(this.operations.values())
      .filter(op => 
        op.entityType === violation.entityType &&
        op.entityId === violation.entityId &&
        (op.type === 'create' || op.type === 'update')
      );

    if (operations.length === 0) return null;

    // Combine patterns and recalculate statistics
    const combined = {
      patterns: [],
      totalFrequency: 0,
      averageConfidence: 0,
      lastUpdated: new Date()
    };

    let totalConfidence = 0;
    let patternCount = 0;

    operations.forEach(op => {
      if (op.data.patterns) {
        combined.patterns.push(...op.data.patterns);
        combined.totalFrequency += op.data.totalFrequency || 0;
        totalConfidence += op.data.averageConfidence || 0;
        patternCount++;
      }
    });

    combined.averageConfidence = patternCount > 0 ? totalConfidence / patternCount : 0;

    return combined;
  }

  /**
   * Calculate resolution confidence
   */
  private calculateResolutionConfidence(violation: ConsistencyViolation, resolution: any): number {
    // Base confidence on violation type and resolution strategy
    let confidence = 0.5;

    switch (violation.violationType) {
      case 'read_inconsistency':
        confidence = 0.8;
        break;
      case 'write_conflict':
        confidence = 0.7;
        break;
      case 'staleness':
        confidence = 0.9;
        break;
      case 'replication_lag':
        confidence = 0.6;
        break;
    }

    // Adjust based on data quality
    if (resolution && typeof resolution === 'object') {
      if (resolution.confidence) {
        confidence = (confidence + resolution.confidence) / 2;
      }
      if (resolution.timestamp) {
        const age = Date.now() - new Date(resolution.timestamp).getTime();
        confidence *= Math.max(0.5, 1 - (age / 3600000)); // Decay over 1 hour
      }
    }

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Generate consistency metrics
   */
  private generateConsistencyMetrics(): void {
    const now = new Date();
    const totalOperations = this.operations.size;
    const consistencyViolations = Array.from(this.violations.values())
      .filter(v => v.detectedAt.getTime() > now.getTime() - 5 * 60 * 1000).length;
    const conflictResolutions = Array.from(this.resolutions.values())
      .filter(r => r.resolvedAt.getTime() > now.getTime() - 5 * 60 * 1000).length;

    // Calculate average staleness
    const readOps = Array.from(this.operations.values())
      .filter(op => op.type === 'read');
    const averageStaleness = readOps.length > 0 
      ? readOps.reduce((sum, op) => sum + (now.getTime() - op.timestamp.getTime()), 0) / readOps.length
      : 0;

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(totalOperations, consistencyViolations);

    const metrics: ConsistencyMetrics = {
      timestamp: now,
      totalOperations,
      consistencyViolations,
      conflictResolutions,
      averageStaleness,
      replicationLag: Math.random() * 1000, // Simulated
      consistencyScore
    };

    this.metrics.push(metrics);

    // Keep only last 24 hours of metrics
    const cutoffTime = now.getTime() - (24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);

    console.log(`📊 Consistency metrics: Score ${(consistencyScore * 100).toFixed(1)}%, Violations ${consistencyViolations}`);
  }

  /**
   * Calculate overall consistency score
   */
  private calculateConsistencyScore(totalOps: number, violations: number): number {
    if (totalOps === 0) return 1;

    const violationRate = violations / totalOps;
    return Math.max(0, 1 - violationRate * 2); // Penalize violations heavily
  }

  /**
   * Get consistency statistics
   */
  getConsistencyStatistics(): {
    rules: ConsistencyRule[];
    violations: ConsistencyViolation[];
    resolutions: ConflictResolution[];
    metrics: ConsistencyMetrics[];
    overallScore: number;
  } {
    const rules = Array.from(this.rules.values());
    const violations = Array.from(this.violations.values());
    const resolutions = Array.from(this.resolutions.values());
    const metrics = this.metrics.slice(-10); // Last 10 measurements

    const overallScore = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.consistencyScore, 0) / metrics.length
      : 1;

    return {
      rules,
      violations,
      resolutions,
      metrics,
      overallScore
    };
  }

  /**
   * Add consistency rule
   */
  addConsistencyRule(rule: Omit<ConsistencyRule, 'id' | 'createdAt' | 'lastUpdated'>): string {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullRule: ConsistencyRule = {
      ...rule,
      id,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.rules.set(id, fullRule);
    console.log(`✅ Added consistency rule: ${fullRule.name}`);
    
    return id;
  }

  /**
   * Update consistency rule
   */
  updateConsistencyRule(ruleId: string, updates: Partial<ConsistencyRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    const updatedRule = {
      ...rule,
      ...updates,
      lastUpdated: new Date()
    };

    this.rules.set(ruleId, updatedRule);
    console.log(`✅ Updated consistency rule: ${ruleId}`);
    
    return true;
  }

  /**
   * Enable/disable consistency rule
   */
  toggleConsistencyRule(ruleId: string, enabled: boolean): boolean {
    return this.updateConsistencyRule(ruleId, { enabled });
  }
}

export const consistencyManager = new ConsistencyManager();

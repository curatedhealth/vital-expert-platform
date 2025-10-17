import { EventEmitter } from 'events';

export interface SafetyLimits {
  maxCost: number;
  maxIterations: number;
  maxDuration: number; // in minutes
  maxApiCalls: number;
  maxFileOperations: number;
  maxConcurrentTasks: number;
}

export interface SafetyViolation {
  type: 'cost' | 'iteration' | 'duration' | 'api_calls' | 'file_operations' | 'concurrent_tasks' | 'banned_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentValue: number;
  limitValue: number;
  timestamp: Date;
  action: 'warn' | 'pause' | 'stop' | 'intervention_required';
}

export interface SafetyMetrics {
  currentCost: number;
  currentIterations: number;
  currentDuration: number;
  currentApiCalls: number;
  currentFileOperations: number;
  currentConcurrentTasks: number;
  violations: SafetyViolation[];
  lastReset: Date;
}

export interface SafetyConfig {
  limits: SafetyLimits;
  bannedActions: string[];
  interventionPoints: {
    costThreshold: number; // percentage
    iterationThreshold: number; // percentage
    durationThreshold: number; // percentage
    highPriorityTaskThreshold: number; // priority level
  };
  autoReset: boolean;
  resetInterval: number; // in hours
}

export class SafetyManager extends EventEmitter {
  private config: SafetyConfig;
  private metrics: SafetyMetrics;
  private isEnabled: boolean = true;

  constructor(config?: Partial<SafetyConfig>) {
    super();
    
    this.config = {
      limits: {
        maxCost: 100, // $100 default
        maxIterations: 50,
        maxDuration: 60, // 60 minutes
        maxApiCalls: 1000,
        maxFileOperations: 100,
        maxConcurrentTasks: 5
      },
      bannedActions: [
        'delete system files',
        'modify critical configurations',
        'access sensitive data',
        'execute system commands',
        'modify database schema',
        'access user credentials',
        'modify security settings',
        'delete user data',
        'access payment information',
        'modify agent configurations'
      ],
      interventionPoints: {
        costThreshold: 80, // 80% of max cost
        iterationThreshold: 80, // 80% of max iterations
        durationThreshold: 80, // 80% of max duration
        highPriorityTaskThreshold: 9 // priority 9+ tasks
      },
      autoReset: true,
      resetInterval: 24 // 24 hours
    };

    // Override with provided config
    if (config) {
      this.config = { ...this.config, ...config };
      if (config.limits) {
        this.config.limits = { ...this.config.limits, ...config.limits };
      }
      if (config.interventionPoints) {
        this.config.interventionPoints = { ...this.config.interventionPoints, ...config.interventionPoints };
      }
    }

    this.metrics = {
      currentCost: 0,
      currentIterations: 0,
      currentDuration: 0,
      currentApiCalls: 0,
      currentFileOperations: 0,
      currentConcurrentTasks: 0,
      violations: [],
      lastReset: new Date()
    };

    // Set up auto-reset if enabled
    if (this.config.autoReset) {
      this.setupAutoReset();
    }
  }

  /**
   * Check if an action is allowed
   */
  canExecute(action: string, estimatedCost: number = 0): {
    allowed: boolean;
    violations: SafetyViolation[];
    warnings: string[];
  } {
    const violations: SafetyViolation[] = [];
    const warnings: string[] = [];

    // Check banned actions
    if (this.isBannedAction(action)) {
      violations.push({
        type: 'banned_action',
        severity: 'critical',
        message: `Action "${action}" is banned`,
        currentValue: 1,
        limitValue: 0,
        timestamp: new Date(),
        action: 'stop'
      });
    }

    // Check cost limits
    if (this.metrics.currentCost + estimatedCost > this.config.limits.maxCost) {
      violations.push({
        type: 'cost',
        severity: 'high',
        message: `Cost limit exceeded: $${this.metrics.currentCost + estimatedCost} > $${this.config.limits.maxCost}`,
        currentValue: this.metrics.currentCost + estimatedCost,
        limitValue: this.config.limits.maxCost,
        timestamp: new Date(),
        action: 'stop'
      });
    } else if (this.metrics.currentCost + estimatedCost > this.config.limits.maxCost * (this.config.interventionPoints.costThreshold / 100)) {
      warnings.push(`Approaching cost limit: $${this.metrics.currentCost + estimatedCost} / $${this.config.limits.maxCost}`);
    }

    // Check iteration limits
    if (this.metrics.currentIterations >= this.config.limits.maxIterations) {
      violations.push({
        type: 'iteration',
        severity: 'high',
        message: `Iteration limit exceeded: ${this.metrics.currentIterations} >= ${this.config.limits.maxIterations}`,
        currentValue: this.metrics.currentIterations,
        limitValue: this.config.limits.maxIterations,
        timestamp: new Date(),
        action: 'stop'
      });
    } else if (this.metrics.currentIterations >= this.config.limits.maxIterations * (this.config.interventionPoints.iterationThreshold / 100)) {
      warnings.push(`Approaching iteration limit: ${this.metrics.currentIterations} / ${this.config.limits.maxIterations}`);
    }

    // Check duration limits
    if (this.metrics.currentDuration >= this.config.limits.maxDuration) {
      violations.push({
        type: 'duration',
        severity: 'high',
        message: `Duration limit exceeded: ${this.metrics.currentDuration} minutes >= ${this.config.limits.maxDuration} minutes`,
        currentValue: this.metrics.currentDuration,
        limitValue: this.config.limits.maxDuration,
        timestamp: new Date(),
        action: 'stop'
      });
    } else if (this.metrics.currentDuration >= this.config.limits.maxDuration * (this.config.interventionPoints.durationThreshold / 100)) {
      warnings.push(`Approaching duration limit: ${this.metrics.currentDuration} / ${this.config.limits.maxDuration} minutes`);
    }

    // Check API call limits
    if (this.metrics.currentApiCalls >= this.config.limits.maxApiCalls) {
      violations.push({
        type: 'api_calls',
        severity: 'medium',
        message: `API call limit exceeded: ${this.metrics.currentApiCalls} >= ${this.config.limits.maxApiCalls}`,
        currentValue: this.metrics.currentApiCalls,
        limitValue: this.config.limits.maxApiCalls,
        timestamp: new Date(),
        action: 'pause'
      });
    }

    // Check file operation limits
    if (this.metrics.currentFileOperations >= this.config.limits.maxFileOperations) {
      violations.push({
        type: 'file_operations',
        severity: 'medium',
        message: `File operation limit exceeded: ${this.metrics.currentFileOperations} >= ${this.config.limits.maxFileOperations}`,
        currentValue: this.metrics.currentFileOperations,
        limitValue: this.config.limits.maxFileOperations,
        timestamp: new Date(),
        action: 'pause'
      });
    }

    // Check concurrent task limits
    if (this.metrics.currentConcurrentTasks >= this.config.limits.maxConcurrentTasks) {
      violations.push({
        type: 'concurrent_tasks',
        severity: 'medium',
        message: `Concurrent task limit exceeded: ${this.metrics.currentConcurrentTasks} >= ${this.config.limits.maxConcurrentTasks}`,
        currentValue: this.metrics.currentConcurrentTasks,
        limitValue: this.config.limits.maxConcurrentTasks,
        timestamp: new Date(),
        action: 'pause'
      });
    }

    // Add violations to metrics
    this.metrics.violations.push(...violations);

    // Emit events for violations
    violations.forEach(violation => {
      this.emit('violation', violation);
      
      if (violation.action === 'stop') {
        this.emit('stop_required', violation);
      } else if (violation.action === 'pause') {
        this.emit('pause_required', violation);
      } else if (violation.action === 'intervention_required') {
        this.emit('intervention_required', violation);
      }
    });

    // Emit warnings
    warnings.forEach(warning => {
      this.emit('warning', warning);
    });

    return {
      allowed: violations.length === 0,
      violations,
      warnings
    };
  }

  /**
   * Record execution metrics
   */
  recordExecution(metrics: {
    cost?: number;
    iterations?: number;
    duration?: number;
    apiCalls?: number;
    fileOperations?: number;
    concurrentTasks?: number;
  }): void {
    if (metrics.cost !== undefined) {
      this.metrics.currentCost += metrics.cost;
    }
    if (metrics.iterations !== undefined) {
      this.metrics.currentIterations += metrics.iterations;
    }
    if (metrics.duration !== undefined) {
      this.metrics.currentDuration += metrics.duration;
    }
    if (metrics.apiCalls !== undefined) {
      this.metrics.currentApiCalls += metrics.apiCalls;
    }
    if (metrics.fileOperations !== undefined) {
      this.metrics.currentFileOperations += metrics.fileOperations;
    }
    if (metrics.concurrentTasks !== undefined) {
      this.metrics.currentConcurrentTasks = metrics.concurrentTasks;
    }

    this.emit('metrics_updated', this.metrics);
  }

  /**
   * Check if intervention is required
   */
  requiresIntervention(context?: {
    currentTask?: any;
    highPriorityTasks?: any[];
    userPreferences?: any;
  }): {
    required: boolean;
    reason: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  } {
    // Check cost threshold
    const costPercentage = (this.metrics.currentCost / this.config.limits.maxCost) * 100;
    if (costPercentage >= this.config.interventionPoints.costThreshold) {
      return {
        required: true,
        reason: `Cost threshold reached: ${costPercentage.toFixed(1)}% of limit`,
        severity: costPercentage >= 95 ? 'critical' : 'high'
      };
    }

    // Check iteration threshold
    const iterationPercentage = (this.metrics.currentIterations / this.config.limits.maxIterations) * 100;
    if (iterationPercentage >= this.config.interventionPoints.iterationThreshold) {
      return {
        required: true,
        reason: `Iteration threshold reached: ${iterationPercentage.toFixed(1)}% of limit`,
        severity: iterationPercentage >= 95 ? 'critical' : 'high'
      };
    }

    // Check duration threshold
    const durationPercentage = (this.metrics.currentDuration / this.config.limits.maxDuration) * 100;
    if (durationPercentage >= this.config.interventionPoints.durationThreshold) {
      return {
        required: true,
        reason: `Duration threshold reached: ${durationPercentage.toFixed(1)}% of limit`,
        severity: durationPercentage >= 95 ? 'critical' : 'high'
      };
    }

    // Check high priority tasks
    if (context?.highPriorityTasks) {
      const highPriorityCount = context.highPriorityTasks.filter(
        task => task.priority >= this.config.interventionPoints.highPriorityTaskThreshold
      ).length;
      
      if (highPriorityCount > 0) {
        return {
          required: true,
          reason: `${highPriorityCount} high-priority tasks require human review`,
          severity: 'medium'
        };
      }
    }

    // Check for recent violations
    const recentViolations = this.metrics.violations.filter(
      v => Date.now() - v.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (recentViolations.length >= 3) {
      return {
        required: true,
        reason: `${recentViolations.length} safety violations in the last 5 minutes`,
        severity: 'high'
      };
    }

    return {
      required: false,
      reason: '',
      severity: 'low'
    };
  }

  /**
   * Get current safety metrics
   */
  getMetrics(): SafetyMetrics {
    return { ...this.metrics };
  }

  /**
   * Get safety status report
   */
  getStatusReport(): {
    status: 'safe' | 'warning' | 'critical';
    metrics: SafetyMetrics;
    recommendations: string[];
    nextReset: Date;
  } {
    const recommendations: string[] = [];
    let status: 'safe' | 'warning' | 'critical' = 'safe';

    // Check overall status
    const costPercentage = (this.metrics.currentCost / this.config.limits.maxCost) * 100;
    const iterationPercentage = (this.metrics.currentIterations / this.config.limits.maxIterations) * 100;
    const durationPercentage = (this.metrics.currentDuration / this.config.limits.maxDuration) * 100;

    if (costPercentage >= 90 || iterationPercentage >= 90 || durationPercentage >= 90) {
      status = 'critical';
    } else if (costPercentage >= 70 || iterationPercentage >= 70 || durationPercentage >= 70) {
      status = 'warning';
    }

    // Generate recommendations
    if (costPercentage >= 80) {
      recommendations.push('Consider reducing task complexity or using cheaper tools');
    }
    if (iterationPercentage >= 80) {
      recommendations.push('Consider breaking down complex tasks into smaller steps');
    }
    if (durationPercentage >= 80) {
      recommendations.push('Consider optimizing task execution or reducing scope');
    }
    if (this.metrics.violations.length > 0) {
      recommendations.push('Review recent safety violations and adjust limits if needed');
    }

    const nextReset = new Date(this.metrics.lastReset.getTime() + this.config.resetInterval * 60 * 60 * 1000);

    return {
      status,
      metrics: this.metrics,
      recommendations,
      nextReset
    };
  }

  /**
   * Reset safety metrics
   */
  reset(): void {
    console.log('🔄 [SafetyManager] Resetting safety metrics');
    
    this.metrics = {
      currentCost: 0,
      currentIterations: 0,
      currentDuration: 0,
      currentApiCalls: 0,
      currentFileOperations: 0,
      currentConcurrentTasks: 0,
      violations: [],
      lastReset: new Date()
    };

    this.emit('reset', this.metrics);
  }

  /**
   * Update safety configuration
   */
  updateConfig(newConfig: Partial<SafetyConfig>): void {
    console.log('⚙️ [SafetyManager] Updating safety configuration');
    
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.limits) {
      this.config.limits = { ...this.config.limits, ...newConfig.limits };
    }
    
    if (newConfig.interventionPoints) {
      this.config.interventionPoints = { ...this.config.interventionPoints, ...newConfig.interventionPoints };
    }

    this.emit('config_updated', this.config);
  }

  /**
   * Enable or disable safety manager
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.emit('enabled_changed', enabled);
  }

  /**
   * Check if safety manager is enabled
   */
  isSafetyEnabled(): boolean {
    return this.isEnabled;
  }

  // Private methods

  private isBannedAction(action: string): boolean {
    const actionLower = action.toLowerCase();
    return this.config.bannedActions.some(banned => 
      actionLower.includes(banned.toLowerCase())
    );
  }

  private setupAutoReset(): void {
    const resetInterval = this.config.resetInterval * 60 * 60 * 1000; // Convert to milliseconds
    
    setInterval(() => {
      console.log('🔄 [SafetyManager] Auto-resetting safety metrics');
      this.reset();
    }, resetInterval);
  }

  /**
   * Validate safety configuration
   */
  validateConfig(config: SafetyConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate limits
    if (config.limits.maxCost <= 0) {
      errors.push('Max cost must be greater than 0');
    }
    if (config.limits.maxIterations <= 0) {
      errors.push('Max iterations must be greater than 0');
    }
    if (config.limits.maxDuration <= 0) {
      errors.push('Max duration must be greater than 0');
    }
    if (config.limits.maxApiCalls <= 0) {
      errors.push('Max API calls must be greater than 0');
    }
    if (config.limits.maxFileOperations <= 0) {
      errors.push('Max file operations must be greater than 0');
    }
    if (config.limits.maxConcurrentTasks <= 0) {
      errors.push('Max concurrent tasks must be greater than 0');
    }

    // Validate intervention points
    if (config.interventionPoints.costThreshold < 0 || config.interventionPoints.costThreshold > 100) {
      errors.push('Cost threshold must be between 0 and 100');
    }
    if (config.interventionPoints.iterationThreshold < 0 || config.interventionPoints.iterationThreshold > 100) {
      errors.push('Iteration threshold must be between 0 and 100');
    }
    if (config.interventionPoints.durationThreshold < 0 || config.interventionPoints.durationThreshold > 100) {
      errors.push('Duration threshold must be between 0 and 100');
    }
    if (config.interventionPoints.highPriorityTaskThreshold < 1 || config.interventionPoints.highPriorityTaskThreshold > 10) {
      errors.push('High priority task threshold must be between 1 and 10');
    }

    // Warnings
    if (config.limits.maxCost > 1000) {
      warnings.push('High cost limit may lead to unexpected charges');
    }
    if (config.limits.maxIterations > 200) {
      warnings.push('High iteration limit may lead to long execution times');
    }
    if (config.limits.maxDuration > 480) { // 8 hours
      warnings.push('High duration limit may lead to long execution times');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export singleton instance
export const safetyManager = new SafetyManager();

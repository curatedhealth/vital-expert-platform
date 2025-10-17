import { Task, CompletedTask, Evidence, Goal } from './autonomous-state';

export interface PerformanceMetrics {
  totalCost: number;
  totalDuration: number;
  averageTaskDuration: number;
  memoryUsage: number;
  cacheHitRate: number;
  parallelExecutionRate: number;
  errorRate: number;
  throughput: number; // tasks per minute
}

export interface OptimizationConfig {
  enableCaching: boolean;
  enableParallelExecution: boolean;
  enableMemoryOptimization: boolean;
  enableCostOptimization: boolean;
  maxConcurrentTasks: number;
  cacheSize: number;
  memoryThreshold: number;
  costThreshold: number;
}

export class PerformanceOptimizer {
  private config: OptimizationConfig;
  private cache: Map<string, any> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];
  private activeTasks: Set<string> = new Set();
  private memoryUsage: number = 0;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableCaching: true,
      enableParallelExecution: true,
      enableMemoryOptimization: true,
      enableCostOptimization: true,
      maxConcurrentTasks: 3,
      cacheSize: 1000,
      memoryThreshold: 100 * 1024 * 1024, // 100MB
      costThreshold: 50,
      ...config
    };
  }

  /**
   * Cost Optimization
   */
  optimizeCosts(tasks: Task[], budget: number): Task[] {
    if (!this.config.enableCostOptimization) return tasks;

    console.log('💰 [PerformanceOptimizer] Optimizing costs with budget:', budget);

    // Sort tasks by cost-effectiveness (priority / estimated cost)
    const costOptimizedTasks = tasks
      .map(task => ({
        ...task,
        costEffectiveness: task.priority / Math.max(task.estimatedCost || 1, 0.01)
      }))
      .sort((a, b) => b.costEffectiveness - a.costEffectiveness);

    // Select tasks within budget
    let totalCost = 0;
    const selectedTasks: Task[] = [];

    for (const task of costOptimizedTasks) {
      const taskCost = task.estimatedCost || 1;
      if (totalCost + taskCost <= budget) {
        selectedTasks.push(task);
        totalCost += taskCost;
      } else {
        console.log(`💰 [PerformanceOptimizer] Skipping task ${task.id} - would exceed budget`);
      }
    }

    console.log(`💰 [PerformanceOptimizer] Selected ${selectedTasks.length}/${tasks.length} tasks within budget`);
    return selectedTasks;
  }

  /**
   * Speed Optimization - Parallel Execution
   */
  async executeTasksInParallel(
    tasks: Task[],
    executor: (task: Task) => Promise<any>
  ): Promise<CompletedTask[]> {
    if (!this.config.enableParallelExecution) {
      // Sequential execution
      const results: CompletedTask[] = [];
      for (const task of tasks) {
        const result = await executor(task);
        results.push(result);
      }
      return results;
    }

    console.log('⚡ [PerformanceOptimizer] Executing tasks in parallel');

    const batches: Task[][] = [];
    for (let i = 0; i < tasks.length; i += this.config.maxConcurrentTasks) {
      batches.push(tasks.slice(i, i + this.config.maxConcurrentTasks));
    }

    const allResults: CompletedTask[] = [];

    for (const batch of batches) {
      const batchPromises = batch.map(async (task) => {
        this.activeTasks.add(task.id);
        try {
          const result = await executor(task);
          return result;
        } finally {
          this.activeTasks.delete(task.id);
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          allResults.push(result.value);
        } else {
          console.error('❌ [PerformanceOptimizer] Task failed:', result.reason);
        }
      }

      // Small delay between batches to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`⚡ [PerformanceOptimizer] Completed ${allResults.length} tasks in parallel`);
    return allResults;
  }

  /**
   * Memory Optimization
   */
  optimizeMemory(state: any): any {
    if (!this.config.enableMemoryOptimization) return state;

    console.log('🧠 [PerformanceOptimizer] Optimizing memory usage');

    // Clean up old episodic memories (keep last 50 instead of 100)
    if (state.episodicMemory && state.episodicMemory.length > 50) {
      state.episodicMemory = state.episodicMemory.slice(-50);
    }

    // Clean up old evidence (keep last 200 instead of all)
    if (state.evidenceChain && state.evidenceChain.length > 200) {
      state.evidenceChain = state.evidenceChain.slice(-200);
    }

    // Clean up old completed tasks (keep last 100)
    if (state.completedTasks && state.completedTasks.length > 100) {
      state.completedTasks = state.completedTasks.slice(-100);
    }

    // Compress working memory
    if (state.workingMemory) {
      state.workingMemory.facts = state.workingMemory.facts?.slice(-20) || [];
      state.workingMemory.insights = state.workingMemory.insights?.slice(-20) || [];
      state.workingMemory.hypotheses = state.workingMemory.hypotheses?.slice(-10) || [];
    }

    this.memoryUsage = this.calculateMemoryUsage(state);
    console.log(`🧠 [PerformanceOptimizer] Memory usage: ${(this.memoryUsage / 1024 / 1024).toFixed(2)}MB`);

    return state;
  }

  /**
   * Caching System
   */
  getCachedResult(key: string): any | null {
    if (!this.config.enableCaching) return null;

    const result = this.cache.get(key);
    if (result) {
      console.log(`💾 [PerformanceOptimizer] Cache hit for key: ${key.substring(0, 20)}...`);
      return result;
    }
    return null;
  }

  setCachedResult(key: string, value: any): void {
    if (!this.config.enableCaching) return;

    // Implement LRU cache
    if (this.cache.size >= this.config.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
    console.log(`💾 [PerformanceOptimizer] Cached result for key: ${key.substring(0, 20)}...`);
  }

  /**
   * Task Prioritization
   */
  prioritizeTasks(tasks: Task[]): Task[] {
    console.log('🎯 [PerformanceOptimizer] Prioritizing tasks');

    return tasks.sort((a, b) => {
      // Priority score = (priority * 0.4) + (urgency * 0.3) + (complexity * 0.2) + (dependencies * 0.1)
      const scoreA = (a.priority * 0.4) + 
                    ((a.urgency || 0.5) * 0.3) + 
                    ((a.complexity || 0.5) * 0.2) + 
                    ((a.dependencies?.length || 0) * 0.1);
      
      const scoreB = (b.priority * 0.4) + 
                    ((b.urgency || 0.5) * 0.3) + 
                    ((b.complexity || 0.5) * 0.2) + 
                    ((b.dependencies?.length || 0) * 0.1);

      return scoreB - scoreA;
    });
  }

  /**
   * Resource Management
   */
  canExecuteTask(task: Task): boolean {
    // Check if we have capacity for more tasks
    if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
      return false;
    }

    // Check memory threshold
    if (this.memoryUsage > this.config.memoryThreshold) {
      console.log('🧠 [PerformanceOptimizer] Memory threshold exceeded, skipping task');
      return false;
    }

    return true;
  }

  /**
   * Performance Monitoring
   */
  recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    const fullMetrics: PerformanceMetrics = {
      totalCost: 0,
      totalDuration: 0,
      averageTaskDuration: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      parallelExecutionRate: 0,
      errorRate: 0,
      throughput: 0,
      ...metrics
    };

    this.performanceHistory.push(fullMetrics);

    // Keep only last 100 metrics
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-100);
    }

    console.log('📊 [PerformanceOptimizer] Recorded metrics:', {
      cost: fullMetrics.totalCost,
      duration: fullMetrics.totalDuration,
      memory: (fullMetrics.memoryUsage / 1024 / 1024).toFixed(2) + 'MB',
      throughput: fullMetrics.throughput.toFixed(2) + ' tasks/min'
    });
  }

  /**
   * Get Performance Report
   */
  getPerformanceReport(): {
    current: PerformanceMetrics;
    average: PerformanceMetrics;
    trends: {
      costTrend: number;
      speedTrend: number;
      memoryTrend: number;
    };
  } {
    if (this.performanceHistory.length === 0) {
      return {
        current: {
          totalCost: 0,
          totalDuration: 0,
          averageTaskDuration: 0,
          memoryUsage: 0,
          cacheHitRate: 0,
          parallelExecutionRate: 0,
          errorRate: 0,
          throughput: 0
        },
        average: {
          totalCost: 0,
          totalDuration: 0,
          averageTaskDuration: 0,
          memoryUsage: 0,
          cacheHitRate: 0,
          parallelExecutionRate: 0,
          errorRate: 0,
          throughput: 0
        },
        trends: {
          costTrend: 0,
          speedTrend: 0,
          memoryTrend: 0
        }
      };
    }

    const current = this.performanceHistory[this.performanceHistory.length - 1];
    
    const average: PerformanceMetrics = {
      totalCost: this.performanceHistory.reduce((sum, m) => sum + m.totalCost, 0) / this.performanceHistory.length,
      totalDuration: this.performanceHistory.reduce((sum, m) => sum + m.totalDuration, 0) / this.performanceHistory.length,
      averageTaskDuration: this.performanceHistory.reduce((sum, m) => sum + m.averageTaskDuration, 0) / this.performanceHistory.length,
      memoryUsage: this.performanceHistory.reduce((sum, m) => sum + m.memoryUsage, 0) / this.performanceHistory.length,
      cacheHitRate: this.performanceHistory.reduce((sum, m) => sum + m.cacheHitRate, 0) / this.performanceHistory.length,
      parallelExecutionRate: this.performanceHistory.reduce((sum, m) => sum + m.parallelExecutionRate, 0) / this.performanceHistory.length,
      errorRate: this.performanceHistory.reduce((sum, m) => sum + m.errorRate, 0) / this.performanceHistory.length,
      throughput: this.performanceHistory.reduce((sum, m) => sum + m.throughput, 0) / this.performanceHistory.length
    };

    // Calculate trends (comparing last 10 vs previous 10)
    const recent = this.performanceHistory.slice(-10);
    const previous = this.performanceHistory.slice(-20, -10);
    
    const trends = {
      costTrend: this.calculateTrend(recent.map(m => m.totalCost), previous.map(m => m.totalCost)),
      speedTrend: this.calculateTrend(recent.map(m => m.throughput), previous.map(m => m.throughput)),
      memoryTrend: this.calculateTrend(recent.map(m => m.memoryUsage), previous.map(m => m.memoryUsage))
    };

    return { current, average, trends };
  }

  private calculateTrend(recent: number[], previous: number[]): number {
    if (recent.length === 0 || previous.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;
    
    return previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
  }

  private calculateMemoryUsage(state: any): number {
    // Rough estimation of memory usage
    let size = 0;
    
    if (state.episodicMemory) size += state.episodicMemory.length * 1024; // ~1KB per episode
    if (state.evidenceChain) size += state.evidenceChain.length * 512; // ~512B per evidence
    if (state.completedTasks) size += state.completedTasks.length * 256; // ~256B per task
    if (state.workingMemory) size += JSON.stringify(state.workingMemory).length;
    
    return size;
  }

  /**
   * Clear cache and reset metrics
   */
  reset(): void {
    this.cache.clear();
    this.performanceHistory = [];
    this.activeTasks.clear();
    this.memoryUsage = 0;
    console.log('🔄 [PerformanceOptimizer] Reset complete');
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

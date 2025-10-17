import { describe, it, expect, vi, beforeEach, jest } from 'vitest';
import { PerformanceOptimizer, performanceOptimizer } from '../performance-optimizer';
import { Task } from '../autonomous-state';

// Mock external dependencies
jest.mock('../task-executor', () => ({
  taskExecutor: {
    executeTask: jest.fn()
  }
}));

describe('Performance Optimizer Tests', () => {
  let optimizer: PerformanceOptimizer;

  beforeEach(() => {
    optimizer = new PerformanceOptimizer({
      enableCaching: true,
      enableParallelExecution: true,
      enableMemoryOptimization: true,
      enableCostOptimization: true,
      maxConcurrentTasks: 3,
      cacheSize: 100,
      memoryThreshold: 50 * 1024 * 1024, // 50MB
      costThreshold: 25
    });
  });

  describe('Cost Optimization', () => {
    it('should optimize tasks within budget', () => {
      const tasks: Task[] = [
        {
          id: 'task1',
          description: 'High priority task',
          type: 'research',
          priority: 10,
          estimatedCost: 5,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task2',
          description: 'Low priority task',
          type: 'analysis',
          priority: 2,
          estimatedCost: 15,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task3',
          description: 'Medium priority task',
          type: 'validation',
          priority: 5,
          estimatedCost: 8,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      const budget = 20;
      const optimized = optimizer.optimizeCosts(tasks, budget);

      expect(optimized).toHaveLength(2);
      expect(optimized[0].id).toBe('task1'); // Highest cost-effectiveness
      expect(optimized[1].id).toBe('task3'); // Second highest
      expect(optimized.find(t => t.id === 'task2')).toBeUndefined(); // Excluded due to cost
    });

    it('should handle empty task list', () => {
      const optimized = optimizer.optimizeCosts([], 100);
      expect(optimized).toHaveLength(0);
    });

    it('should handle zero budget', () => {
      const tasks: Task[] = [
        {
          id: 'task1',
          description: 'Test task',
          type: 'research',
          priority: 10,
          estimatedCost: 5,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      const optimized = optimizer.optimizeCosts(tasks, 0);
      expect(optimized).toHaveLength(0);
    });
  });

  describe('Task Prioritization', () => {
    it('should prioritize tasks correctly', () => {
      const tasks: Task[] = [
        {
          id: 'task1',
          description: 'Low priority task',
          type: 'research',
          priority: 2,
          urgency: 0.3,
          complexity: 0.4,
          dependencies: [],
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task2',
          description: 'High priority task',
          type: 'analysis',
          priority: 8,
          urgency: 0.8,
          complexity: 0.6,
          dependencies: [],
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task3',
          description: 'Medium priority task',
          type: 'validation',
          priority: 5,
          urgency: 0.5,
          complexity: 0.5,
          dependencies: ['task1'],
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      const prioritized = optimizer.prioritizeTasks(tasks);

      expect(prioritized[0].id).toBe('task2'); // Highest priority score
      expect(prioritized[1].id).toBe('task3'); // Medium priority score
      expect(prioritized[2].id).toBe('task1'); // Lowest priority score
    });
  });

  describe('Caching System', () => {
    it('should cache and retrieve results', () => {
      const key = 'test-key';
      const value = { result: 'test data' };

      // Initially no cache
      expect(optimizer.getCachedResult(key)).toBeNull();

      // Set cache
      optimizer.setCachedResult(key, value);
      expect(optimizer.getCachedResult(key)).toEqual(value);
    });

    it('should implement LRU cache eviction', () => {
      const config = {
        enableCaching: true,
        cacheSize: 2
      };
      const smallOptimizer = new PerformanceOptimizer(config);

      // Fill cache
      smallOptimizer.setCachedResult('key1', 'value1');
      smallOptimizer.setCachedResult('key2', 'value2');

      // Add one more to trigger eviction
      smallOptimizer.setCachedResult('key3', 'value3');

      // First key should be evicted
      expect(smallOptimizer.getCachedResult('key1')).toBeNull();
      expect(smallOptimizer.getCachedResult('key2')).toBe('value2');
      expect(smallOptimizer.getCachedResult('key3')).toBe('value3');
    });
  });

  describe('Resource Management', () => {
    it('should check if task can be executed', () => {
      const task: Task = {
        id: 'task1',
        description: 'Test task',
        type: 'research',
        priority: 5,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Should be able to execute when no active tasks
      expect(optimizer.canExecuteTask(task)).toBe(true);

      // Fill up active tasks
      optimizer['activeTasks'].add('task1');
      optimizer['activeTasks'].add('task2');
      optimizer['activeTasks'].add('task3');

      // Should not be able to execute when at max concurrent tasks
      expect(optimizer.canExecuteTask(task)).toBe(false);
    });

    it('should check memory threshold', () => {
      const task: Task = {
        id: 'task1',
        description: 'Test task',
        type: 'research',
        priority: 5,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Set memory usage above threshold
      optimizer['memoryUsage'] = 100 * 1024 * 1024; // 100MB

      expect(optimizer.canExecuteTask(task)).toBe(false);
    });
  });

  describe('Memory Optimization', () => {
    it('should optimize memory usage', () => {
      const state = {
        episodicMemory: new Array(150).fill({ data: 'test' }),
        evidenceChain: new Array(300).fill({ data: 'evidence' }),
        completedTasks: new Array(150).fill({ data: 'task' }),
        workingMemory: {
          facts: new Array(50).fill('fact'),
          insights: new Array(50).fill('insight'),
          hypotheses: new Array(50).fill('hypothesis')
        }
      };

      const optimized = optimizer.optimizeMemory(state);

      expect(optimized.episodicMemory).toHaveLength(50);
      expect(optimized.evidenceChain).toHaveLength(200);
      expect(optimized.completedTasks).toHaveLength(100);
      expect(optimized.workingMemory.facts).toHaveLength(20);
      expect(optimized.workingMemory.insights).toHaveLength(20);
      expect(optimized.workingMemory.hypotheses).toHaveLength(10);
    });
  });

  describe('Performance Monitoring', () => {
    it('should record and retrieve metrics', () => {
      const metrics = {
        totalCost: 25.50,
        totalDuration: 5000,
        averageTaskDuration: 1000,
        memoryUsage: 1024 * 1024,
        cacheHitRate: 75.5,
        parallelExecutionRate: 60.0,
        errorRate: 5.0,
        throughput: 12.0
      };

      optimizer.recordMetrics(metrics);
      const report = optimizer.getPerformanceReport();

      expect(report.current).toEqual(metrics);
      expect(report.average).toEqual(metrics);
    });

    it('should calculate trends correctly', () => {
      // Record historical data (previous 10 records)
      for (let i = 0; i < 10; i++) {
        optimizer.recordMetrics({
          totalCost: 10 + i,
          totalDuration: 1000 + i * 100,
          averageTaskDuration: 100 + i * 10,
          memoryUsage: 500 + i * 50,
          cacheHitRate: 50 + i,
          parallelExecutionRate: 30 + i,
          errorRate: 10 + i,
          throughput: 5 + i * 0.5
        });
      }

      // Record recent data with improvements (last 10 records)
      for (let i = 0; i < 10; i++) {
        optimizer.recordMetrics({
          totalCost: 8 - i * 0.1, // Decreasing cost
          totalDuration: 800 - i * 50, // Decreasing duration
          averageTaskDuration: 80 - i * 5, // Decreasing task duration
          memoryUsage: 400 - i * 20, // Decreasing memory
          cacheHitRate: 70 + i, // Increasing cache hit rate
          parallelExecutionRate: 50 + i, // Increasing parallel execution
          errorRate: 5 - i * 0.2, // Decreasing error rate
          throughput: 8 + i * 0.3 // Increasing throughput
        });
      }

      const report = optimizer.getPerformanceReport();
      
      // Should show positive trends (improvements)
      expect(report.trends.costTrend).toBeLessThan(0); // Lower cost is better
      expect(report.trends.speedTrend).toBeGreaterThan(0); // Higher throughput is better
      expect(report.trends.memoryTrend).toBeLessThan(0); // Lower memory is better
    });
  });

  describe('Parallel Execution', () => {
    it('should execute tasks in parallel when enabled', async () => {
      const tasks: Task[] = [
        {
          id: 'task1',
          description: 'Task 1',
          type: 'research',
          priority: 5,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task2',
          description: 'Task 2',
          type: 'analysis',
          priority: 5,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      const mockExecutor = jest.fn().mockResolvedValue({
        success: true,
        result: 'test result',
        evidence: [],
        cost: 1,
        duration: 100,
        toolsUsed: [],
        confidence: 0.8
      });

      const results = await optimizer.executeTasksInParallel(tasks, mockExecutor);

      expect(results).toHaveLength(2);
      expect(mockExecutor).toHaveBeenCalledTimes(2);
    });

    it('should execute tasks sequentially when parallel execution is disabled', async () => {
      const sequentialOptimizer = new PerformanceOptimizer({
        enableParallelExecution: false,
        maxConcurrentTasks: 1
      });

      const tasks: Task[] = [
        {
          id: 'task1',
          description: 'Task 1',
          type: 'research',
          priority: 5,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'task2',
          description: 'Task 2',
          type: 'analysis',
          priority: 5,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      const mockExecutor = jest.fn().mockResolvedValue({
        success: true,
        result: 'test result',
        evidence: [],
        cost: 1,
        duration: 100,
        toolsUsed: [],
        confidence: 0.8
      });

      const results = await sequentialOptimizer.executeTasksInParallel(tasks, mockExecutor);

      expect(results).toHaveLength(2);
      expect(mockExecutor).toHaveBeenCalledTimes(2);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all metrics and cache', () => {
      // Add some data
      optimizer.setCachedResult('test', 'value');
      optimizer.recordMetrics({
        totalCost: 10,
        totalDuration: 1000,
        averageTaskDuration: 100,
        memoryUsage: 500,
        cacheHitRate: 50,
        parallelExecutionRate: 30,
        errorRate: 10,
        throughput: 5
      });

      // Reset
      optimizer.reset();

      // Verify reset
      expect(optimizer.getCachedResult('test')).toBeNull();
      const report = optimizer.getPerformanceReport();
      expect(report.current.totalCost).toBe(0);
      expect(optimizer['activeTasks'].size).toBe(0);
      expect(optimizer['memoryUsage']).toBe(0);
    });
  });
});

describe('Performance Optimizer Singleton', () => {
  it('should export singleton instance', () => {
    expect(performanceOptimizer).toBeDefined();
    expect(performanceOptimizer).toBeInstanceOf(PerformanceOptimizer);
  });
});

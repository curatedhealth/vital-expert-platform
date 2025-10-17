import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { toolSchemaRegistry } from '../enhanced-tool-schemas';
import { retryLogicManager, DEFAULT_RETRY_CONFIG, DEFAULT_CIRCUIT_BREAKER_CONFIG } from '../retry-logic';
import { autonomousCacheManager, DEFAULT_CACHE_CONFIG } from '../redis-cache';
import { loadBalancer, DEFAULT_LOAD_BALANCER_CONFIG } from '../load-balancer';
import { analyticsManager } from '../analytics';

describe('Advanced Features Integration Tests', () => {
  beforeEach(() => {
    // Reset any state before each test
    jest.clearAllMocks();
  });

  describe('Enhanced Tool Schemas', () => {
    it('should validate tool configurations correctly', () => {
      const validTool = {
        name: 'pubmed_search',
        description: 'Search PubMed database for medical literature',
        category: 'research',
        tags: ['medical', 'research'],
        estimatedCost: 0.05,
        estimatedDuration: 3000,
        inputs: {
          required: ['query'],
          optional: ['max_results'],
          schema: {
            query: 'test query',
            max_results: 10
          }
        }
      };

      const result = toolSchemaRegistry.validateTool('pubmed_search', validTool);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid tool configurations', () => {
      const invalidTool = {
        name: 'invalid_tool',
        description: 'Invalid tool',
        category: 'invalid_category',
        estimatedCost: -1
      };

      const result = toolSchemaRegistry.validateTool('pubmed_search', invalidTool);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should get tool metadata correctly', () => {
      const metadata = toolSchemaRegistry.getToolMetadata('pubmed_search');
      expect(metadata).toBeDefined();
      expect(metadata.name).toBe('pubmed_search');
      expect(metadata.category).toBe('research');
    });

    it('should get tools by category', () => {
      const researchTools = toolSchemaRegistry.getToolsByCategory('research');
      expect(researchTools).toContain('pubmed_search');
      expect(researchTools).toContain('clinical_trials_search');
    });

    it('should validate tool input correctly', () => {
      const validInput = {
        query: 'diabetes treatment',
        max_results: 5
      };

      const result = toolSchemaRegistry.validateToolInput('pubmed_search', validInput);
      expect(result.valid).toBe(true);
    });
  });

  describe('Retry Logic with Circuit Breaker', () => {
    it('should execute function with retry logic', async () => {
      let attemptCount = 0;
      const failingFunction = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('TEMPORARY_FAILURE');
        }
        return 'success';
      };

      const result = await retryLogicManager.execute(
        'test-context',
        failingFunction,
        { maxAttempts: 5, baseDelay: 10 }
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
    });

    it('should handle non-retryable errors', async () => {
      const nonRetryableFunction = async () => {
        throw new Error('AUTHENTICATION_ERROR');
      };

      const result = await retryLogicManager.execute(
        'test-context',
        nonRetryableFunction,
        { maxAttempts: 5 }
      );

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
    });

    it('should respect max attempts', async () => {
      const alwaysFailingFunction = async () => {
        throw new Error('TEMPORARY_FAILURE');
      };

      const result = await retryLogicManager.execute(
        'test-context',
        alwaysFailingFunction,
        { maxAttempts: 3, baseDelay: 10 }
      );

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3);
    });

    it('should get circuit breaker states', () => {
      const states = retryLogicManager.getAllCircuitBreakerStates();
      expect(states).toBeDefined();
      expect(typeof states).toBe('object');
    });

    it('should reset circuit breakers', () => {
      expect(() => {
        retryLogicManager.resetAllCircuitBreakers();
      }).not.toThrow();
    });
  });

  describe('Redis Cache Integration', () => {
    it('should handle cache operations when Redis is not available', async () => {
      // Test graceful degradation when Redis is not available
      const result = await autonomousCacheManager.cacheAgentResponse(
        'test-agent',
        'test query',
        { response: 'test response' },
        3600
      );

      // Should not throw error even if Redis is not available
      expect(typeof result).toBe('boolean');
    });

    it('should handle cache retrieval when Redis is not available', async () => {
      const result = await autonomousCacheManager.getCachedAgentResponse(
        'test-agent',
        'test query'
      );

      // Should return null when Redis is not available
      expect(result).toBeNull();
    });

    it('should handle task result caching', async () => {
      const result = await autonomousCacheManager.cacheTaskResult(
        'test-task',
        { result: 'test result' },
        7200
      );

      expect(typeof result).toBe('boolean');
    });

    it('should handle evidence caching', async () => {
      const result = await autonomousCacheManager.cacheEvidence(
        'test-evidence',
        { evidence: 'test evidence' },
        86400
      );

      expect(typeof result).toBe('boolean');
    });

    it('should handle metrics caching', async () => {
      const result = await autonomousCacheManager.cacheMetrics(
        'test-execution',
        { metrics: 'test metrics' },
        1800
      );

      expect(typeof result).toBe('boolean');
    });

    it('should get cache statistics', async () => {
      const stats = await autonomousCacheManager.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
    });
  });

  describe('Load Balancer', () => {
    it('should add and remove nodes', () => {
      const node = {
        id: 'test-node-1',
        host: 'localhost',
        port: 3001,
        weight: 1,
        maxConcurrentTasks: 10,
        currentLoad: 0,
        health: 'healthy' as const,
        lastHealthCheck: Date.now(),
        capabilities: ['research', 'analysis']
      };

      loadBalancer.addNode(node);
      const healthyNodes = loadBalancer.getHealthyNodes();
      expect(healthyNodes).toHaveLength(1);
      expect(healthyNodes[0].id).toBe('test-node-1');

      loadBalancer.removeNode('test-node-1');
      const healthyNodesAfterRemoval = loadBalancer.getHealthyNodes();
      expect(healthyNodesAfterRemoval).toHaveLength(0);
    });

    it('should update node configuration', () => {
      const node = {
        id: 'test-node-2',
        host: 'localhost',
        port: 3002,
        weight: 1,
        maxConcurrentTasks: 10,
        currentLoad: 0,
        health: 'healthy' as const,
        lastHealthCheck: Date.now(),
        capabilities: ['research']
      };

      loadBalancer.addNode(node);
      loadBalancer.updateNode('test-node-2', { weight: 2, currentLoad: 5 });

      const healthyNodes = loadBalancer.getHealthyNodes();
      expect(healthyNodes[0].weight).toBe(2);
      expect(healthyNodes[0].currentLoad).toBe(5);
    });

    it('should assign tasks to nodes', async () => {
      const node = {
        id: 'test-node-3',
        host: 'localhost',
        port: 3003,
        weight: 1,
        maxConcurrentTasks: 10,
        currentLoad: 0,
        health: 'healthy' as const,
        lastHealthCheck: Date.now(),
        capabilities: ['research']
      };

      loadBalancer.addNode(node);

      const task = {
        id: 'test-task-1',
        type: 'research',
        priority: 5,
        estimatedDuration: 5000
      };

      const assignment = await loadBalancer.assignTask(task);
      expect(assignment).toBeDefined();
      expect(assignment?.taskId).toBe('test-task-1');
      expect(assignment?.nodeId).toBe('test-node-3');
    });

    it('should handle task assignment when no healthy nodes', async () => {
      const task = {
        id: 'test-task-2',
        type: 'research',
        priority: 5
      };

      const assignment = await loadBalancer.assignTask(task);
      expect(assignment).toBeNull();
    });

    it('should get load balancer statistics', async () => {
      const stats = await loadBalancer.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalNodes).toBe('number');
      expect(typeof stats.healthyNodes).toBe('number');
      expect(typeof stats.totalTasks).toBe('number');
    });
  });

  describe('Analytics Manager', () => {
    it('should track events', () => {
      expect(() => {
        analyticsManager.trackEvent({
          type: 'test_event',
          userId: 'test-user',
          sessionId: 'test-session',
          data: { test: 'data' }
        });
      }).not.toThrow();
    });

    it('should track performance metrics', () => {
      expect(() => {
        analyticsManager.trackPerformance({
          executionId: 'test-execution',
          startTime: Date.now(),
          endTime: Date.now() + 1000,
          duration: 1000,
          totalCost: 0.1,
          tasksCompleted: 5,
          tasksFailed: 0,
          evidenceCollected: 3,
          memoryUsage: 1000000,
          errorRate: 0,
          throughput: 5,
          confidenceScore: 0.9,
          success: true
        });
      }).not.toThrow();
    });

    it('should track usage analytics', () => {
      expect(() => {
        analyticsManager.trackUsage({
          userId: 'test-user',
          sessionId: 'test-session',
          timestamp: Date.now(),
          action: 'test_action',
          duration: 1000,
          cost: 0.1,
          success: true
        });
      }).not.toThrow();
    });

    it('should get system insights', async () => {
      const insights = await analyticsManager.getSystemInsights();
      expect(insights).toBeDefined();
      expect(typeof insights.timestamp).toBe('number');
      expect(typeof insights.totalExecutions).toBe('number');
      expect(typeof insights.successRate).toBe('number');
    });

    it('should get real-time insights', async () => {
      const realtimeInsights = await analyticsManager.getRealTimeInsights();
      expect(realtimeInsights).toBeDefined();
      expect(typeof realtimeInsights.timestamp).toBe('number');
    });

    it('should get user behavior', () => {
      // First track some usage
      analyticsManager.trackUsage({
        userId: 'test-user-behavior',
        sessionId: 'test-session',
        timestamp: Date.now(),
        action: 'test_action',
        success: true
      });

      const behavior = analyticsManager.getUserBehavior('test-user-behavior');
      expect(behavior).toBeDefined();
      expect(behavior?.userId).toBe('test-user-behavior');
    });

    it('should get performance trends', () => {
      const trends = analyticsManager.getPerformanceTrends(7);
      expect(trends).toBeDefined();
      expect(Array.isArray(trends.executionTime)).toBe(true);
      expect(Array.isArray(trends.cost)).toBe(true);
      expect(Array.isArray(trends.successRate)).toBe(true);
    });

    it('should get events by type', () => {
      analyticsManager.trackEvent({
        type: 'test_event_type',
        userId: 'test-user',
        sessionId: 'test-session',
        data: { test: 'data' }
      });

      const events = analyticsManager.getEventsByType('test_event_type', 10);
      expect(Array.isArray(events)).toBe(true);
    });

    it('should get events by user', () => {
      analyticsManager.trackEvent({
        type: 'test_event',
        userId: 'test-user-events',
        sessionId: 'test-session',
        data: { test: 'data' }
      });

      const events = analyticsManager.getEventsByUser('test-user-events', 10);
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete autonomous execution with all features', async () => {
      // This test simulates a complete autonomous execution using all the new features
      
      // 1. Track the start of execution
      analyticsManager.trackEvent({
        type: 'execution_started',
        userId: 'test-user',
        sessionId: 'test-session',
        executionId: 'test-execution',
        data: { goal: 'Test autonomous execution' }
      });

      // 2. Add a node to the load balancer
      const node = {
        id: 'autonomous-node-1',
        host: 'localhost',
        port: 3001,
        weight: 1,
        maxConcurrentTasks: 10,
        currentLoad: 0,
        health: 'healthy' as const,
        lastHealthCheck: Date.now(),
        capabilities: ['research', 'analysis', 'generation']
      };
      loadBalancer.addNode(node);

      // 3. Assign tasks with retry logic
      const task = {
        id: 'autonomous-task-1',
        type: 'research',
        priority: 5,
        estimatedDuration: 5000
      };

      const assignment = await loadBalancer.assignTask(task);
      expect(assignment).toBeDefined();

      // 4. Cache the task result
      const cacheResult = await autonomousCacheManager.cacheTaskResult(
        task.id,
        { result: 'Task completed successfully' },
        7200
      );
      expect(typeof cacheResult).toBe('boolean');

      // 5. Track performance metrics
      analyticsManager.trackPerformance({
        executionId: 'test-execution',
        startTime: Date.now() - 5000,
        endTime: Date.now(),
        duration: 5000,
        totalCost: 0.5,
        tasksCompleted: 1,
        tasksFailed: 0,
        evidenceCollected: 2,
        memoryUsage: 2000000,
        errorRate: 0,
        throughput: 12,
        confidenceScore: 0.95,
        success: true,
        nodeId: node.id
      });

      // 6. Track usage analytics
      analyticsManager.trackUsage({
        userId: 'test-user',
        sessionId: 'test-session',
        timestamp: Date.now(),
        action: 'autonomous_execution',
        duration: 5000,
        cost: 0.5,
        success: true
      });

      // 7. Get final insights
      const insights = await analyticsManager.getSystemInsights();
      expect(insights).toBeDefined();
      expect(insights.totalExecutions).toBeGreaterThan(0);

      // 8. Track completion
      analyticsManager.trackEvent({
        type: 'execution_completed',
        userId: 'test-user',
        sessionId: 'test-session',
        executionId: 'test-execution',
        data: { success: true, duration: 5000 }
      });

      // Clean up
      loadBalancer.removeNode('autonomous-node-1');
    });

    it('should handle error scenarios gracefully', async () => {
      // Test error handling across all components
      
      // 1. Test retry logic with failing function
      const failingFunction = async () => {
        throw new Error('NETWORK_ERROR');
      };

      const retryResult = await retryLogicManager.execute(
        'error-test',
        failingFunction,
        { maxAttempts: 2, baseDelay: 10 }
      );

      expect(retryResult.success).toBe(false);
      expect(retryResult.attempts).toBe(2);

      // 2. Test load balancer with no healthy nodes
      const task = { id: 'error-task', type: 'test' };
      const assignment = await loadBalancer.assignTask(task);
      expect(assignment).toBeNull();

      // 3. Test analytics with invalid data
      expect(() => {
        analyticsManager.trackEvent({
          type: 'error_event',
          userId: 'test-user',
          sessionId: 'test-session',
          data: { error: 'Test error' }
        });
      }).not.toThrow();

      // 4. Test cache operations with invalid data
      const cacheResult = await autonomousCacheManager.cacheAgentResponse(
        'invalid-agent',
        'invalid query',
        null as any,
        -1
      );
      expect(typeof cacheResult).toBe('boolean');
    });
  });
});

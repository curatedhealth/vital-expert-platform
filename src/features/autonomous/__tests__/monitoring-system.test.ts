import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MonitoringSystem, monitoringSystem } from '../monitoring-system';
import { Goal, Task, CompletedTask, Evidence } from '../autonomous-state';

describe('Monitoring System Tests', () => {
  let system: MonitoringSystem;

  beforeEach(() => {
    system = new MonitoringSystem({
      enableAlerts: true,
      enableMetrics: true,
      enableHealthChecks: false, // Disable for testing
      alertThresholds: {
        errorRate: 0.1,
        responseTime: 30000,
        memoryUsage: 100 * 1024 * 1024,
        costPerExecution: 50
      },
      healthCheckInterval: 1000,
      metricsRetentionDays: 1,
      alertChannels: ['console']
    });
  });

  describe('Execution Tracking', () => {
    it('should track execution start', () => {
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const executionId = 'exec-1';
      system.trackExecutionStart(executionId, goal);

      const metrics = system.getPerformanceMetrics(executionId);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].executionId).toBe(executionId);
      expect(metrics[0].goalId).toBe(goal.id);
      expect(metrics[0].success).toBe(false);
    });

    it('should track execution completion', () => {
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const executionId = 'exec-1';
      system.trackExecutionStart(executionId, goal);

      const completedTasks: CompletedTask[] = [
        {
          id: 'task-1',
          type: 'research',
          description: 'Test task',
          status: 'completed',
          success: true,
          result: 'Test result',
          evidence: [],
          cost: 5,
          duration: 1000,
          toolsUsed: ['tool1'],
          confidence: 0.8,
          timestamp: new Date().toISOString()
        }
      ];

      const evidence: Evidence[] = [
        {
          id: 'evidence-1',
          type: 'primary',
          source: 'test-source',
          content: 'Test evidence',
          confidence: 0.9,
          verificationStatus: 'verified',
          timestamp: new Date().toISOString(),
          goalId: 'goal-1',
          taskId: 'task-1',
          hash: 'test-hash'
        }
      ];

      system.trackExecutionComplete(executionId, true, completedTasks, evidence, 10, 0.85);

      const metrics = system.getPerformanceMetrics(executionId);
      expect(metrics[0].success).toBe(true);
      expect(metrics[0].tasksCompleted).toBe(1);
      expect(metrics[0].evidenceCollected).toBe(1);
      expect(metrics[0].totalCost).toBe(10);
      expect(metrics[0].confidenceScore).toBe(0.85);
    });

    it('should track task execution', () => {
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const executionId = 'exec-1';
      system.trackExecutionStart(executionId, goal);

      const task: Task = {
        id: 'task-1',
        description: 'Test task',
        type: 'research',
        priority: 5,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      system.trackTaskExecution(executionId, task, true, 1000, 5);
      system.trackTaskExecution(executionId, task, false, 500, 2, 'Test error');

      const metrics = system.getPerformanceMetrics(executionId);
      expect(metrics[0].tasksCompleted).toBe(1);
      expect(metrics[0].tasksFailed).toBe(1);
      expect(metrics[0].totalCost).toBe(7);
    });
  });

  describe('Alert Management', () => {
    it('should create alerts', () => {
      const alertId = system.createAlert({
        type: 'error',
        severity: 'high',
        title: 'Test Alert',
        message: 'This is a test alert',
        source: 'test'
      });

      expect(alertId).toBeDefined();
      expect(alertId).toMatch(/^alert_\d+_[a-z0-9]+$/);

      const alerts = system.getRecentAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].title).toBe('Test Alert');
      expect(alerts[0].resolved).toBe(false);
    });

    it('should resolve alerts', () => {
      const alertId = system.createAlert({
        type: 'error',
        severity: 'high',
        title: 'Test Alert',
        message: 'This is a test alert',
        source: 'test'
      });

      const resolved = system.resolveAlert(alertId);
      expect(resolved).toBe(true);

      const alerts = system.getRecentAlerts();
      expect(alerts[0].resolved).toBe(true);
      expect(alerts[0].resolvedAt).toBeDefined();
    });

    it('should return false when resolving non-existent alert', () => {
      const resolved = system.resolveAlert('non-existent-id');
      expect(resolved).toBe(false);
    });

    it('should create alerts for high execution cost', () => {
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const executionId = 'exec-1';
      system.trackExecutionStart(executionId, goal);

      // Complete with high cost
      system.trackExecutionComplete(executionId, true, [], [], 60, 0.8);

      const alerts = system.getRecentAlerts();
      const costAlert = alerts.find(a => a.title === 'High Execution Cost');
      expect(costAlert).toBeDefined();
      expect(costAlert?.severity).toBe('medium');
    });

    it('should create alerts for slow execution', () => {
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const executionId = 'exec-1';
      system.trackExecutionStart(executionId, goal);

      // Manually set duration to trigger alert
      const metrics = system.getPerformanceMetrics(executionId);
      metrics[0].duration = 35000; // 35 seconds
      metrics[0].endTime = new Date();
      metrics[0].success = true;

      // Trigger alert check
      system.trackExecutionComplete(executionId, true, [], [], 10, 0.8);

      const alerts = system.getRecentAlerts();
      const slowAlert = alerts.find(a => a.title === 'Slow Execution');
      expect(slowAlert).toBeDefined();
    });
  });

  describe('System Health', () => {
    it('should return system health status', () => {
      const health = system.getSystemHealth();
      
      expect(health).toBeDefined();
      expect(health.status).toMatch(/^(healthy|degraded|unhealthy)$/);
      expect(health.uptime).toBeGreaterThanOrEqual(0);
      expect(health.activeExecutions).toBeGreaterThanOrEqual(0);
      expect(health.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(health.errorRate).toBeGreaterThanOrEqual(0);
      expect(health.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(health.lastHealthCheck).toBeInstanceOf(Date);
    });

    it('should update health status based on metrics', () => {
      // Add some test metrics
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      system.trackExecutionStart('exec-1', goal);
      system.trackExecutionComplete('exec-1', true, [], [], 10, 0.8);

      const health = system.getSystemHealth();
      expect(health.activeExecutions).toBe(0); // Should be 0 after completion
    });
  });

  describe('Performance Metrics', () => {
    it('should return performance metrics', () => {
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      system.trackExecutionStart('exec-1', goal);
      system.trackExecutionComplete('exec-1', true, [], [], 10, 0.8);

      const metrics = system.getPerformanceMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].executionId).toBe('exec-1');
    });

    it('should filter metrics by execution ID', () => {
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      system.trackExecutionStart('exec-1', goal);
      system.trackExecutionStart('exec-2', goal);

      const metrics1 = system.getPerformanceMetrics('exec-1');
      const metrics2 = system.getPerformanceMetrics('exec-2');
      const allMetrics = system.getPerformanceMetrics();

      expect(metrics1).toHaveLength(1);
      expect(metrics2).toHaveLength(1);
      expect(allMetrics).toHaveLength(2);
    });
  });

  describe('Alert Statistics', () => {
    it('should return alert statistics', () => {
      // Create some test alerts
      system.createAlert({
        type: 'error',
        severity: 'high',
        title: 'Error 1',
        message: 'Test error',
        source: 'test'
      });

      system.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'Warning 1',
        message: 'Test warning',
        source: 'test'
      });

      system.createAlert({
        type: 'info',
        severity: 'low',
        title: 'Info 1',
        message: 'Test info',
        source: 'test'
      });

      // Resolve one alert
      const alerts = system.getRecentAlerts();
      system.resolveAlert(alerts[0].id);

      const stats = system.getAlertStatistics();
      
      expect(stats.total).toBe(3);
      expect(stats.resolved).toBe(1);
      expect(stats.unresolved).toBe(2);
      expect(stats.bySeverity.high).toBe(1);
      expect(stats.bySeverity.medium).toBe(1);
      expect(stats.bySeverity.low).toBe(1);
      expect(stats.byType.error).toBe(1);
      expect(stats.byType.warning).toBe(1);
      expect(stats.byType.info).toBe(1);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup old metrics and alerts', () => {
      // Create old metrics and alerts
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2); // 2 days ago

      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: oldDate.toISOString(),
        status: 'active'
      };

      system.trackExecutionStart('exec-1', goal);
      system.trackExecutionComplete('exec-1', true, [], [], 10, 0.8);

      // Create old alert
      const alertId = system.createAlert({
        type: 'error',
        severity: 'high',
        title: 'Old Alert',
        message: 'Old alert message',
        source: 'test'
      });

      // Resolve the alert to make it eligible for cleanup
      system.resolveAlert(alertId);

      // Manually set old timestamp
      const alerts = system.getRecentAlerts();
      const oldAlert = alerts.find(a => a.id === alertId);
      if (oldAlert) {
        oldAlert.resolvedAt = oldDate;
      }

      // Run cleanup
      system.cleanup();

      // Check that old data was removed
      const metrics = system.getPerformanceMetrics();
      const remainingAlerts = system.getRecentAlerts();
      
      expect(metrics).toHaveLength(0);
      expect(remainingAlerts.find(a => a.id === alertId)).toBeUndefined();
    });
  });

  describe('Event Emission', () => {
    it('should emit events for execution tracking', (done) => {
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      system.on('execution:started', (data) => {
        expect(data.executionId).toBe('exec-1');
        expect(data.goal).toBeDefined();
        done();
      });

      system.trackExecutionStart('exec-1', goal);
    });

    it('should emit events for alert creation', (done) => {
      system.on('alert:created', (alert) => {
        expect(alert.title).toBe('Test Alert');
        expect(alert.severity).toBe('high');
        done();
      });

      system.createAlert({
        type: 'error',
        severity: 'high',
        title: 'Test Alert',
        message: 'Test message',
        source: 'test'
      });
    });
  });

  describe('Configuration', () => {
    it('should use custom configuration', () => {
      const customSystem = new MonitoringSystem({
        enableAlerts: false,
        alertThresholds: {
          errorRate: 0.2,
          responseTime: 60000,
          memoryUsage: 200 * 1024 * 1024,
          costPerExecution: 100
        }
      });

      // Should not create alerts when disabled
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      customSystem.trackExecutionStart('exec-1', goal);
      customSystem.trackExecutionComplete('exec-1', true, [], [], 60, 0.8);

      const alerts = customSystem.getRecentAlerts();
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Singleton Instance', () => {
    it('should export singleton instance', () => {
      expect(monitoringSystem).toBeDefined();
      expect(monitoringSystem).toBeInstanceOf(MonitoringSystem);
    });
  });

  describe('Destroy', () => {
    it('should destroy monitoring system', () => {
      const goal: Goal = {
        id: 'goal-1',
        description: 'Test goal',
        successCriteria: [],
        priority: 'high',
        domain: 'clinical',
        estimatedDuration: 30,
        requiredTools: [],
        constraints: [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      system.trackExecutionStart('exec-1', goal);
      system.createAlert({
        type: 'error',
        severity: 'high',
        title: 'Test Alert',
        message: 'Test message',
        source: 'test'
      });

      system.destroy();

      const metrics = system.getPerformanceMetrics();
      const alerts = system.getRecentAlerts();
      
      expect(metrics).toHaveLength(0);
      expect(alerts).toHaveLength(0);
    });
  });
});

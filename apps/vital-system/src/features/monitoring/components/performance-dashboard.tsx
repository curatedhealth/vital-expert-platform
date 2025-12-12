'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { performanceMetricsService, PerformanceSnapshot } from '@/shared/services/monitoring/performance-metrics.service';

interface PerformanceDashboardProps {
  refreshInterval?: number;
  autoRefresh?: boolean;
}

interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'error';
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  refreshInterval = 30000,
  autoRefresh = true
}) => {
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ status: string; issues: string[] }>({ status: 'healthy', issues: [] });
  const [alerts, setAlerts] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<number>(3600000); // 1 hour default

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);

      const newSnapshot = await performanceMetricsService.getPerformanceSnapshot(timeWindow);
      const health = await performanceMetricsService.getHealthStatus();

      setSnapshot(newSnapshot);
      setHealthStatus(health);
    } catch (error) {
      // console.error('Failed to refresh performance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeWindow]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getMetricStatus = (value: number, thresholds: { warning: number; error: number }, invert = false): 'good' | 'warning' | 'error' => {
    if (invert) {
      if (value < thresholds.error) return 'error';
      if (value < thresholds.warning) return 'warning';
      return 'good';
    } else {
      if (value > thresholds.error) return 'error';
      if (value > thresholds.warning) return 'warning';
      return 'good';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const metricCards: MetricCard[] = (() => {
    if (!snapshot) return [];

    return [
      {
        title: 'Total Requests',
        value: snapshot.totalRequests,
        status: 'good'
      },
      {
        title: 'Avg Response Time',
        value: formatDuration(snapshot.averageResponseTime),
        status: getMetricStatus(snapshot.averageResponseTime, { warning: 3000, error: 5000 })
      },
      {
        title: 'Error Rate',
        value: formatPercentage(snapshot.errorRate),
        status: getMetricStatus(snapshot.errorRate, { warning: 0.05, error: 0.1 })
      },
      {
        title: 'RAG Success Rate',
        value: formatPercentage(snapshot.ragPerformance.successRate),
        status: getMetricStatus(snapshot.ragPerformance.successRate, { warning: 0.95, error: 0.9 }, true)
      },
      {
        title: 'RAG Queries',
        value: snapshot.ragPerformance.queries,
        status: 'good'
      },
      {
        title: 'RAG Avg Time',
        value: formatDuration(snapshot.ragPerformance.avgTime),
        status: getMetricStatus(snapshot.ragPerformance.avgTime, { warning: 2000, error: 4000 })
      },
      {
        title: 'Orchestrator Decisions',
        value: snapshot.orchestratorPerformance.decisions,
        status: 'good'
      },
      {
        title: 'Decision Time',
        value: formatDuration(snapshot.orchestratorPerformance.avgDecisionTime),
        status: getMetricStatus(snapshot.orchestratorPerformance.avgDecisionTime, { warning: 1000, error: 2000 })
      },
      {
        title: 'Collaboration Rate',
        value: formatPercentage(snapshot.orchestratorPerformance.collaborationRate),
        status: 'good'
      }
    ];
  })();

  useEffect(() => {
    refreshData();

    // Subscribe to alerts
    const unsubscribe = performanceMetricsService.subscribeToAlerts((alert: any) => {
      setAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep last 10 alerts
    });

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(refreshData, refreshInterval);
    }

    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, [refreshData, refreshInterval, autoRefresh]);

  if (isLoading && !snapshot) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Performance Dashboard</h1>
          <p className="text-neutral-600 mt-1">Real-time system performance monitoring</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Time Window Selector */}
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={300000}>5 minutes</option>
            <option value={900000}>15 minutes</option>
            <option value={3600000}>1 hour</option>
            <option value={21600000}>6 hours</option>
            <option value={86400000}>24 hours</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Health Status */}
      <div className={`p-4 rounded-lg border ${getStatusColor(healthStatus.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              healthStatus.status === 'healthy' ? 'bg-green-500' :
              healthStatus.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="font-semibold text-lg capitalize">{healthStatus.status}</span>
          </div>
          {snapshot && (
            <span className="text-sm text-neutral-600">
              Last updated: {new Date(snapshot.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>

        {healthStatus.issues.length > 0 && (
          <div className="mt-3">
            <p className="font-medium mb-2">Issues:</p>
            <ul className="space-y-1">
              {healthStatus.issues.map((issue, index) => (
                <li key={index} className="text-sm">• {issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-3">Recent Alerts</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div key={index} className="text-sm text-red-700 flex items-center justify-between">
                <span>
                  {alert.metric}: {typeof alert.value === 'number' ? alert.value.toFixed(2) : alert.value}
                  ({alert.condition.replace('_', ' ')} {alert.threshold})
                </span>
                <span className="text-xs text-red-600">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card, index) => (
          <div key={index} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600">{card.title}</h3>
              <div className={`w-3 h-3 rounded-full ${
                card.status === 'good' ? 'bg-green-500' :
                card.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 mt-2">
              {card.value} {card.unit}
            </p>
          </div>
        ))}
      </div>

      {/* Top Agents */}
      {snapshot && snapshot.topAgents.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Performing Agents</h3>
          <div className="space-y-3">
            {snapshot.topAgents.map((agent, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-neutral-500">#{index + 1}</span>
                  <span className="text-sm font-medium text-neutral-900">{agent.agentId}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  <span>{agent.requests} requests</span>
                  <span>{formatDuration(agent.avgTime)} avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Summary */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Error Summary</h3>
        <ErrorSummary timeWindow={timeWindow} />
      </div>
    </div>
  );
};

const ErrorSummary: React.FC<{ timeWindow: number }> = ({ timeWindow }) => {
  const [errorMetrics, setErrorMetrics] = useState<Array<{ operation: string; count: number; lastError: string }>>([]);

  useEffect(() => {
    // Fetch error metrics from the performance metrics service
    const fetchErrors = async () => {
      try {
        const errors = await performanceMetricsService.getErrorMetrics(timeWindow);
        setErrorMetrics(errors);
      } catch (error) {
        // Handle error silently, keep empty array
        setErrorMetrics([]);
      }
    };
    fetchErrors();
  }, [timeWindow]);

  if (errorMetrics.length === 0) {
    return <p className="text-green-600 text-sm">No errors in the selected time window ✓</p>;
  }

  return (
    <div className="space-y-3">
      {errorMetrics.map((error, index) => (
        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-red-800">{error.operation}</span>
            <span className="text-sm text-red-600">{error.count} errors</span>
          </div>
          <p className="text-sm text-red-700">{error.lastError}</p>
        </div>
      ))}
    </div>
  );
};

export default PerformanceDashboard;
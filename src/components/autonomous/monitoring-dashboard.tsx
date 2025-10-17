'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  MemoryStick, 
  Zap,
  RefreshCw,
  Settings,
  Eye,
  Trash2
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  activeExecutions: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  lastHealthCheck: string;
  alerts: MonitoringAlert[];
}

interface MonitoringAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
}

interface PerformanceMetrics {
  executionId: string;
  goalId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  totalCost: number;
  tasksCompleted: number;
  tasksFailed: number;
  evidenceCollected: number;
  memoryUsage: number;
  errorRate: number;
  throughput: number;
  confidenceScore: number;
  success: boolean;
}

interface MonitoringDashboardProps {
  className?: string;
}

export function MonitoringDashboard({ className = '' }: MonitoringDashboardProps) {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/autonomous/monitoring?action=health');
      const data = await response.json();
      
      if (data.success) {
        setHealth(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch health data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/autonomous/monitoring?action=alerts&limit=20');
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/autonomous/monitoring?action=metrics&limit=10');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/autonomous/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve-alert', alertId })
      });
      
      if (response.ok) {
        await fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const cleanup = async () => {
    try {
      const response = await fetch('/api/autonomous/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' })
      });
      
      if (response.ok) {
        await fetchHealth();
        await fetchAlerts();
        await fetchMetrics();
      }
    } catch (err) {
      console.error('Failed to cleanup:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchHealth(), fetchAlerts(), fetchMetrics()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'unhealthy': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && !health) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading monitoring data...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-red-500">
              <XCircle className="w-6 h-6 mr-2" />
              Error: {error}
            </div>
            <Button onClick={refreshAll} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and alerting for autonomous agent system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refreshAll} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={cleanup} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Cleanup
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              {getStatusIcon(health.status)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(health.status)}>
                  {health.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Uptime: {formatUptime(health.uptime)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Executions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health.activeExecutions}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(health.averageResponseTime)}</div>
              <p className="text-xs text-muted-foreground">
                Last 5 minutes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(health.errorRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Task failures
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Monitoring */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Memory Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Usage</span>
                    <span>{formatBytes(health?.memoryUsage || 0)}</span>
                  </div>
                  <Progress 
                    value={(health?.memoryUsage || 0) / (100 * 1024 * 1024) * 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Threshold: 100MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Executions</span>
                    <span>{metrics.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Successful</span>
                    <span>{metrics.filter(m => m.success).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Failed</span>
                    <span>{metrics.filter(m => !m.success).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Cost</span>
                    <span>${metrics.reduce((sum, m) => sum + m.totalCost, 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No alerts found
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        alert.resolved ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">{alert.type}</Badge>
                            {alert.resolved && (
                              <Badge variant="secondary">Resolved</Badge>
                            )}
                          </div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Source: {alert.source}</span>
                            <span>
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No performance data available
                  </div>
                ) : (
                  metrics.map((metric) => (
                    <div key={metric.executionId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{metric.goalId}</h4>
                        <Badge variant={metric.success ? 'default' : 'destructive'}>
                          {metric.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div>{formatDuration(metric.duration || 0)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost:</span>
                          <div>${metric.totalCost.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tasks:</span>
                          <div>{metric.tasksCompleted}/{metric.tasksCompleted + metric.tasksFailed}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <div>{(metric.confidenceScore * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span>{formatBytes(health?.memoryUsage || 0)}</span>
                  </div>
                  <Progress 
                    value={(health?.memoryUsage || 0) / (200 * 1024 * 1024) * 100} 
                    className="h-2" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span>{health?.cpuUsage?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={health?.cpuUsage || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uptime:</span>
                  <span>{formatUptime(health?.uptime || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Health Check:</span>
                  <span>
                    {health?.lastHealthCheck 
                      ? new Date(health.lastHealthCheck).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Executions:</span>
                  <span>{health?.activeExecutions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Error Rate:</span>
                  <span>{(health?.errorRate || 0) * 100}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

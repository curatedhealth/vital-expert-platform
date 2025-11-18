'use client';

import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  Brain,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Progress } from '@vital/ui';
import { ScrollArea } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { cn } from '@/shared/services/utils';

interface MetricsSummary {
  activeSessions: number;
  totalQueries: number;
  avgResponseTime: number;
  avgConfidence: number;
  successRate: number;
  digitalHealthUsage: number;
  multiAgentUsage: number;
  errorRate: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

interface Alert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  resolved: boolean;
}

interface MetricsDashboardProps {
  className?: string;
}

export function MetricsDashboard({ className }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h'>('1h');

  useEffect(() => {
    // Load mock data for now
    loadInitialData();

    // Set up refresh interval
    const refreshInterval = setInterval(() => {
      loadInitialData();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [selectedTimeRange]);

  const loadInitialData = async () => {
    // Mock metrics data
    const mockMetrics: MetricsSummary = {
      activeSessions: Math.floor(Math.random() * 50) + 10,
      totalQueries: Math.floor(Math.random() * 5000) + 1000,
      avgResponseTime: Math.floor(Math.random() * 500) + 200,
      avgConfidence: Math.random() * 0.3 + 0.7,
      successRate: Math.random() * 0.1 + 0.9,
      digitalHealthUsage: Math.random() * 0.4 + 0.5,
      multiAgentUsage: Math.random() * 0.3 + 0.2,
      errorRate: Math.random() * 0.05,
      systemHealth: 'healthy' as const
    };

    setMetrics(mockMetrics);

    // Mock alerts data
    const mockAlerts: Alert[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        severity: 'medium',
        type: 'Performance',
        message: 'Response time increased by 15%',
        resolved: false
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: 'low',
        type: 'Usage',
        message: 'High query volume detected',
        resolved: true
      }
    ];

    setAlerts(mockAlerts);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExportMetrics = () => {
    if (!metrics) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      timeRange: selectedTimeRange,
      metrics,
      alerts
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vital-metrics-${new Date().toISOString().split('T')[0]}.json`;
    
    if (typeof document === 'undefined') {
      console.warn('Metrics export is only available in the browser environment.');
      URL.revokeObjectURL(url);
      return;
    }
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertCircle;
      case 'critical': return XCircle;
      default: return Activity;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (!metrics) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  const HealthIcon = getHealthIcon(metrics.systemHealth);
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMetrics}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Tabs value={selectedTimeRange} onValueChange={(v) => setSelectedTimeRange(v as any)}>
        <TabsList>
          <TabsTrigger value="1h">Last Hour</TabsTrigger>
          <TabsTrigger value="6h">Last 6 Hours</TabsTrigger>
          <TabsTrigger value="24h">Last 24 Hours</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* System Health Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HealthIcon className={cn("h-5 w-5", getHealthColor(metrics.systemHealth))} />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {metrics.systemHealth}
          </div>
          {unresolvedAlerts.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {unresolvedAlerts.length} active alert{unresolvedAlerts.length !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Current active user sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Queries in selected time range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.avgResponseTime)}</div>
            <p className="text-xs text-muted-foreground">
              Average query response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.successRate * 100).toFixed(1)}%</div>
            <Progress value={metrics.successRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.avgConfidence * 100).toFixed(1)}%</div>
            <Progress value={metrics.avgConfidence * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.errorRate * 100).toFixed(2)}%</div>
            <Progress value={metrics.errorRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digital Health Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.digitalHealthUsage * 100).toFixed(1)}%</div>
            <Progress value={metrics.digitalHealthUsage * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multi-Agent Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.multiAgentUsage * 100).toFixed(1)}%</div>
            <Progress value={metrics.multiAgentUsage * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
              {unresolvedAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {unresolvedAlerts.length} Active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      alert.resolved && "opacity-50"
                    )}
                  >
                    <AlertTriangle className={cn(
                      "h-4 w-4 mt-0.5",
                      alert.severity === 'critical' && "text-red-600",
                      alert.severity === 'high' && "text-orange-600",
                      alert.severity === 'medium' && "text-yellow-600",
                      alert.severity === 'low' && "text-blue-600"
                    )} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="text-sm font-medium">{alert.type}</span>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-green-600">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

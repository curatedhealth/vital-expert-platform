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
import React, { useState, useEffect, useRef } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Progress } from '@vital/ui';
import { ScrollArea } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { RealTimeMetrics } from '@/shared/services/monitoring/real-time-metrics';
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
    // Initialize metrics service

    // Set up event listeners
    service.on('metrics', (newMetrics: unknown) => {
      setMetrics(newMetrics);
    });

    service.on('alert', (alert: Alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
    });

    // Load initial data
    loadInitialData();

    // Set up refresh interval

    return () => {
      clearInterval(refreshInterval);
      service.destroy();
    };
  }, []);

    if (currentMetrics) {
      setMetrics(currentMetrics);
    }

    setAlerts(activeAlerts);
  };

    setIsRefreshing(true);
    await loadInitialData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

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

    service.resolveAlert(alertId);
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

    switch (health) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertCircle;
      case 'critical': return XCircle;
      default: return Activity;
    }
  };

    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Metrics</h2>
          <p className="text-muted-foreground">Real-time performance monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HealthIcon className={cn("h-5 w-5 mr-2", getHealthColor(metrics.systemHealth))} />
            System Health: {metrics.systemHealth.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.activeSessions}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.totalQueries}</div>
              <div className="text-sm text-muted-foreground">Total Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatDuration(metrics.avgResponseTime)}</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.avgConfidence}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Success Rate</span>
                <span className="font-semibold">{metrics.successRate}%</span>
              </div>
              <Progress value={metrics.successRate} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Error Rate: {metrics.errorRate}%</span>
                <span className={metrics.successRate >= 95 ? 'text-green-600' : 'text-yellow-600'}>
                  {metrics.successRate >= 95 ? 'Excellent' : 'Good'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Health Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-4 w-4 mr-2 text-blue-500" />
              Digital Health Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Digital Health</span>
                <span className="font-semibold">{metrics.digitalHealthUsage}%</span>
              </div>
              <Progress value={metrics.digitalHealthUsage} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Multi-Agent: {metrics.multiAgentUsage}%</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.digitalHealthUsage > 50 ? 'High' : 'Moderate'} Priority
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-purple-500" />
              Response Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Response Time</span>
                <Badge variant={metrics.avgResponseTime < 2000 ? 'default' : 'destructive'}>
                  {formatDuration(metrics.avgResponseTime)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Confidence</span>
                <Badge variant={metrics.avgConfidence > 80 ? 'default' : 'secondary'}>
                  {metrics.avgConfidence}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {metrics.avgResponseTime < 2000 ? '✅ Excellent performance' :
                 metrics.avgResponseTime < 5000 ? '⚠️ Acceptable performance' :
                 '❌ Performance needs attention'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              System Alerts ({alerts.filter((a: any) => !a.resolved).length} active)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No alerts - system running smoothly</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {alerts.slice(0, 10).map(alert => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start justify-between p-3 rounded-lg border",
                      alert.resolved ? "bg-gray-50 opacity-75" : "bg-background"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={cn("text-xs", getSeverityColor(alert.severity))}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-xs">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    {!alert.resolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Detailed Metrics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Active Users</p>
                      <p className="text-2xl font-bold">{metrics.activeSessions}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Total Queries</p>
                      <p className="text-2xl font-bold">{metrics.totalQueries}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold">{metrics.successRate}%</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Avg Confidence</p>
                      <p className="text-2xl font-bold">{metrics.avgConfidence}%</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Response Time Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average</span>
                      <span>{formatDuration(metrics.avgResponseTime)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target</span>
                      <span className="text-green-600">&lt; 2s</span>
                    </div>
                    <Progress
                      value={Math.min(100, (2000 / Math.max(metrics.avgResponseTime, 1)) * 100)}
                      className="h-2"
                    />
                  </div>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Error Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span className={metrics.errorRate > 5 ? 'text-red-600' : 'text-green-600'}>
                        {metrics.errorRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target</span>
                      <span className="text-green-600">&lt; 5%</span>
                    </div>
                    <Progress
                      value={Math.max(0, 100 - metrics.errorRate * 20)}
                      className="h-2"
                    />
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Digital Health Priority</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Digital Health Queries</span>
                      <span>{metrics.digitalHealthUsage}%</span>
                    </div>
                    <Progress value={metrics.digitalHealthUsage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Percentage of queries utilizing digital health priority routing
                    </p>
                  </div>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Multi-Agent Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Multi-Agent Queries</span>
                      <span>{metrics.multiAgentUsage}%</span>
                    </div>
                    <Progress value={metrics.multiAgentUsage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Percentage of queries requiring multiple expert consultation
                    </p>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

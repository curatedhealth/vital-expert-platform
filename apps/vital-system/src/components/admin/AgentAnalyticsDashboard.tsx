'use client';

/**
 * Agent Analytics Dashboard Component
 * 
 * Comprehensive agent operations analytics view for admin dashboard
 * Integrates with Prometheus metrics and Mode 1 metrics endpoints
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  BarChart3,
  PieChart,
  Clock,
  Target,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Button } from '@vital/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Progress } from '@vital/ui';

interface AgentAnalytics {
  summary: {
    totalSearches: number;
    averageLatency: number;
    p95Latency: number;
    errorRate: number;
    graphragHitRate: number;
    fallbackRate: number;
  };
  searchMetrics: {
    total: number;
    byMethod: Record<string, number>;
    errors: number;
    errorRate: number;
  };
  graphragMetrics: {
    hits: number;
    fallbacks: number;
    hitRate: number;
  };
  selectionMetrics: {
    total: number;
    byConfidence: {
      high: number;
      medium: number;
      low: number;
    };
    averageLatency: number;
  };
  modeMetrics: {
    mode1?: {
      total: number;
      success: number;
      error: number;
      averageLatency: number;
      p95Latency: number;
    };
    mode2: {
      total: number;
      success: number;
      error: number;
      averageLatency: number;
      p95Latency: number;
    };
    mode3: {
      total: number;
      success: number;
      error: number;
      averageLatency: number;
      p95Latency: number;
      averageIterations: number;
    };
  };
  timeRange: {
    from: string;
    to: string;
  };
}

export function AgentAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/agents?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading agent analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
              <p className="text-rose-600 mb-4">{error}</p>
              <Button onClick={fetchAnalytics} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Operations Analytics</h1>
          <p className="text-neutral-600 mt-1">
            Real-time monitoring of agent search, selection, and execution performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last 1 Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalSearches.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Over {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.averageLatency}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              P95: {analytics.summary.p95Latency}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GraphRAG Hit Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.graphragHitRate.toFixed(1)}%</div>
            <Progress 
              value={analytics.summary.graphragHitRate} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Fallback: {analytics.summary.fallbackRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.errorRate.toFixed(2)}%</div>
            <p className={`text-xs mt-1 ${analytics.summary.errorRate > 1 ? 'text-rose-600' : 'text-green-600'}`}>
              {analytics.summary.errorRate > 1 ? 'Above target' : 'Within target'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Search Performance</TabsTrigger>
          <TabsTrigger value="graphrag">GraphRAG Metrics</TabsTrigger>
          <TabsTrigger value="modes">Mode Execution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Search Method Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Search Methods</CardTitle>
                <CardDescription>Distribution of search methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.searchMetrics.byMethod).map(([method, count]) => {
                    const percentage = analytics.searchMetrics.total > 0
                      ? (count / analytics.searchMetrics.total) * 100
                      : 0;
                    return (
                      <div key={method}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{method.replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground">
                            {count.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selection Confidence */}
            <Card>
              <CardHeader>
                <CardTitle>Selection Confidence</CardTitle>
                <CardDescription>Agent selection confidence distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.selectionMetrics.byConfidence).map(([level, count]) => {
                    const percentage = analytics.selectionMetrics.total > 0
                      ? (count / analytics.selectionMetrics.total) * 100
                      : 0;
                    const color = level === 'high' ? 'green' : level === 'medium' ? 'yellow' : 'red';
                    return (
                      <div key={level}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{level}</span>
                          <span className="text-sm text-muted-foreground">
                            {count.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className={color === 'red' ? '[&>div]:bg-rose-500' : color === 'yellow' ? '[&>div]:bg-yellow-500' : ''} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Average Latency</span>
                    <span className="text-sm font-medium">{analytics.summary.averageLatency}ms</span>
                  </div>
                  <Progress value={Math.min((analytics.summary.averageLatency / 1000) * 100, 100)} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">P95 Latency</span>
                    <span className={`text-sm font-medium ${analytics.summary.p95Latency > 1000 ? 'text-rose-600' : 'text-green-600'}`}>
                      {analytics.summary.p95Latency}ms
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((analytics.summary.p95Latency / 2000) * 100, 100)} 
                    className={analytics.summary.p95Latency > 1000 ? '[&>div]:bg-rose-500' : ''}
                  />
                  {analytics.summary.p95Latency > 1000 && (
                    <p className="text-xs text-rose-600 mt-1">⚠️ Exceeds 1s target</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Error Rate</span>
                    <span className={`text-sm font-medium ${analytics.summary.errorRate > 1 ? 'text-rose-600' : 'text-green-600'}`}>
                      {analytics.summary.errorRate.toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={analytics.summary.errorRate * 10} className={analytics.summary.errorRate > 1 ? '[&>div]:bg-rose-500' : '[&>div]:bg-green-500'} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Searches</span>
                  <span className="font-medium">{analytics.searchMetrics.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Errors</span>
                  <span className="font-medium text-rose-600">{analytics.searchMetrics.errors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium text-green-600">
                    {(100 - analytics.searchMetrics.errorRate).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Selection Avg Latency</span>
                  <span className="font-medium">{analytics.selectionMetrics.averageLatency}ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="graphrag" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>GraphRAG Hits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {analytics.graphragMetrics.hits.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Successful GraphRAG searches</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fallbacks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {analytics.graphragMetrics.fallbacks.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Database fallback usage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analytics.graphragMetrics.hitRate.toFixed(1)}%
                </div>
                <Progress 
                  value={analytics.graphragMetrics.hitRate} 
                  className="mt-3"
                />
                <p className={`text-xs mt-2 ${analytics.graphragMetrics.hitRate >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                  {analytics.graphragMetrics.hitRate >= 70 ? '✅ Above target (70%)' : '⚠️ Below target (70%)'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Mode 1 */}
            {analytics.modeMetrics.mode1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mode 1 (Manual)</CardTitle>
                  <CardDescription>Interactive manual agent selection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total</span>
                    <span className="font-medium">{analytics.modeMetrics.mode1.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success</span>
                    <span className="font-medium text-green-600">{analytics.modeMetrics.mode1.success}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Errors</span>
                    <span className="font-medium text-rose-600">{analytics.modeMetrics.mode1.error}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Latency</span>
                    <span className="font-medium">{analytics.modeMetrics.mode1.averageLatency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">P95 Latency</span>
                    <span className="font-medium">{analytics.modeMetrics.mode1.p95Latency}ms</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mode 2 */}
            <Card>
              <CardHeader>
                <CardTitle>Mode 2 (Automatic)</CardTitle>
                <CardDescription>Automatic agent selection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total</span>
                  <span className="font-medium">{analytics.modeMetrics.mode2.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success</span>
                  <span className="font-medium text-green-600">{analytics.modeMetrics.mode2.success}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Errors</span>
                  <span className="font-medium text-rose-600">{analytics.modeMetrics.mode2.error}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Latency</span>
                  <span className="font-medium">{analytics.modeMetrics.mode2.averageLatency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">P95 Latency</span>
                  <span className={`font-medium ${analytics.modeMetrics.mode2.p95Latency > 5000 ? 'text-rose-600' : ''}`}>
                    {analytics.modeMetrics.mode2.p95Latency}ms
                  </span>
                </div>
                {analytics.modeMetrics.mode2.p95Latency > 5000 && (
                  <Badge variant="destructive">⚠️ Exceeds 5s target</Badge>
                )}
              </CardContent>
            </Card>

            {/* Mode 3 */}
            <Card>
              <CardHeader>
                <CardTitle>Mode 3 (Autonomous)</CardTitle>
                <CardDescription>Autonomous automatic with ReAct</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total</span>
                  <span className="font-medium">{analytics.modeMetrics.mode3.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success</span>
                  <span className="font-medium text-green-600">{analytics.modeMetrics.mode3.success}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Errors</span>
                  <span className="font-medium text-rose-600">{analytics.modeMetrics.mode3.error}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Latency</span>
                  <span className="font-medium">{analytics.modeMetrics.mode3.averageLatency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">P95 Latency</span>
                  <span className={`font-medium ${analytics.modeMetrics.mode3.p95Latency > 30000 ? 'text-rose-600' : ''}`}>
                    {analytics.modeMetrics.mode3.p95Latency}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg Iterations</span>
                  <span className="font-medium">{analytics.modeMetrics.mode3.averageIterations}</span>
                </div>
                {analytics.modeMetrics.mode3.p95Latency > 30000 && (
                  <Badge variant="destructive">⚠️ Exceeds 30s target</Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


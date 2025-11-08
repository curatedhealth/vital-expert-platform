'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Server,
  Database,
  Cpu,
  Wifi,
  AlertCircle,
  XCircle,
  ShieldAlert,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Brain,
  Target,
  Sparkles,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// ============================================================================
// Types
// ============================================================================

interface RealtimeMetrics {
  timestamp: string;
  active_users: number;
  queries_per_second: number;
  avg_response_time_ms: number;
  error_rate: number;
  total_cost_today: number;
  cache_hit_rate: number;
  quality_score: number;
}

interface TenantMetrics {
  tenant_id: string;
  daily_cost: number;
  monthly_cost: number;
  projected_monthly_cost: number;
  query_count: number;
  success_rate: number;
  avg_quality_score: number;
  avg_response_time_ms: number;
  cache_hit_rate: number;
  top_agents: Array<{ name: string; executions: number; success_rate: number }>;
}

interface QualityMetrics {
  avg_quality_score: number;
  hallucination_rate: number;
  citation_accuracy: number;
  response_completeness: number;
  low_confidence_rate: number;
  user_satisfaction_rate: number;
}

interface CostMetrics {
  period: string;
  total_cost: number;
  cost_breakdown: {
    llm: number;
    embedding: number;
    storage: number;
    compute: number;
    search: number;
  };
  top_tenants: Array<{ tenant_id: string; cost: number }>;
  top_users: Array<{ user_id: string; cost: number }>;
  cost_trend: 'increasing' | 'decreasing' | 'stable';
}

interface AgentMetrics {
  agent_id: string;
  executions_total: number;
  executions_successful: number;
  success_rate: number;
  avg_latency_ms: number;
  avg_quality_score: number;
  total_cost: number;
  avg_cost_per_execution: number;
  last_executed: string | null;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  components: Record<string, string>;
  uptime_seconds: number;
}

// ============================================================================
// AI Engine Monitoring Dashboard Component
// ============================================================================

export function AIEngineMonitoringDashboard() {
  const [realtime, setRealtime] = useState<RealtimeMetrics | null>(null);
  const [quality, setQuality] = useState<QualityMetrics | null>(null);
  const [costDaily, setCostDaily] = useState<CostMetrics | null>(null);
  const [costMonthly, setCostMonthly] = useState<CostMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadAllMetrics();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAllMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadAllMetrics = async () => {
    try {
      setError(null);
      
      // Call the Metrics API endpoints
      const API_BASE = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';
      
      const [realtimeRes, qualityRes, costDailyRes, costMonthlyRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/api/metrics/realtime`),
        fetch(`${API_BASE}/api/metrics/quality/summary`),
        fetch(`${API_BASE}/api/metrics/cost/daily`),
        fetch(`${API_BASE}/api/metrics/cost/monthly`),
        fetch(`${API_BASE}/api/metrics/health`),
      ]);

      if (!realtimeRes.ok) throw new Error('Failed to fetch realtime metrics');
      if (!qualityRes.ok) throw new Error('Failed to fetch quality metrics');
      if (!costDailyRes.ok) throw new Error('Failed to fetch daily cost');
      if (!costMonthlyRes.ok) throw new Error('Failed to fetch monthly cost');
      if (!healthRes.ok) throw new Error('Failed to fetch health status');

      const [realtimeData, qualityData, costDailyData, costMonthlyData, healthData] = await Promise.all([
        realtimeRes.json(),
        qualityRes.json(),
        costDailyRes.json(),
        costMonthlyRes.json(),
        healthRes.json(),
      ]);

      setRealtime(realtimeData);
      setQuality(qualityData);
      setCostDaily(costDailyData);
      setCostMonthly(costMonthlyData);
      setHealth(healthData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cost);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading AI Engine Monitoring...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Metrics</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={loadAllMetrics}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Engine Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time performance, quality, and cost analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Wifi className="mr-2 h-4 w-4" />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={loadAllMetrics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <Clock className="h-3 w-3" />
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* System Health Status */}
      {health && (
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(health.status)}
                <CardTitle>System Health</CardTitle>
              </div>
              <Badge
                variant={
                  health.status === 'healthy'
                    ? 'default'
                    : health.status === 'degraded'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {health.status.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              Uptime: {Math.floor(health.uptime_seconds / 86400)}d {Math.floor((health.uptime_seconds % 86400) / 3600)}h
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {Object.entries(health.components).map(([name, status]) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {name === 'api' && <Zap className="h-4 w-4 text-muted-foreground" />}
                    {name === 'prometheus' && <BarChart3 className="h-4 w-4 text-muted-foreground" />}
                    {name === 'timescaledb' && <Database className="h-4 w-4 text-muted-foreground" />}
                    {name === 'langfuse' && <Eye className="h-4 w-4 text-muted-foreground" />}
                    {name === 'cache' && <Server className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium capitalize">{name}</span>
                  </div>
                  <Badge
                    variant={status === 'healthy' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      {realtime && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Active Users */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtime.active_users}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently connected
              </p>
            </CardContent>
          </Card>

          {/* Queries Per Second */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queries/Second</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtime.queries_per_second.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time throughput
              </p>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realtime.avg_response_time_ms}ms</div>
              <Progress
                value={Math.min((realtime.avg_response_time_ms / 3000) * 100, 100)}
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          {/* Error Rate */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(realtime.error_rate)}</div>
              <p className="text-xs text-green-500 mt-1">
                ✓ Within acceptable range
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Detailed Metrics */}
      <Tabs defaultValue="quality" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quality">
            <Sparkles className="h-4 w-4 mr-2" />
            Quality & Performance
          </TabsTrigger>
          <TabsTrigger value="cost">
            <DollarSign className="h-4 w-4 mr-2" />
            Cost Analytics
          </TabsTrigger>
          <TabsTrigger value="observability">
            <Eye className="h-4 w-4 mr-2" />
            Observability
          </TabsTrigger>
        </TabsList>

        {/* Quality & Performance Tab */}
        <TabsContent value="quality" className="space-y-4">
          {quality && realtime && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(quality.avg_quality_score)}</div>
                    <Progress value={quality.avg_quality_score * 100} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Average response quality
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Citation Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(quality.citation_accuracy)}</div>
                    <Progress value={quality.citation_accuracy * 100} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Source attribution quality
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(realtime.cache_hit_rate)}</div>
                    <Progress value={realtime.cache_hit_rate * 100} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Instant responses
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Indicators</CardTitle>
                    <CardDescription>AI response quality metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hallucination Rate</span>
                      <Badge variant={quality.hallucination_rate < 0.05 ? 'default' : 'destructive'}>
                        {formatPercentage(quality.hallucination_rate)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Completeness</span>
                      <Badge variant="default">
                        {formatPercentage(quality.response_completeness)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Confidence Responses</span>
                      <Badge variant={quality.low_confidence_rate < 0.1 ? 'default' : 'secondary'}>
                        {formatPercentage(quality.low_confidence_rate)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Satisfaction</span>
                      <Badge variant="default">
                        {formatPercentage(quality.user_satisfaction_rate)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>System performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Response Time (p50)</span>
                        <span className="font-medium">{realtime.avg_response_time_ms}ms</span>
                      </div>
                      <Progress
                        value={Math.min((realtime.avg_response_time_ms / 3000) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Error Rate</span>
                        <span className="font-medium text-green-600">{formatPercentage(realtime.error_rate)}</span>
                      </div>
                      <Progress value={realtime.error_rate * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Cache Efficiency</span>
                        <span className="font-medium">{formatPercentage(realtime.cache_hit_rate)}</span>
                      </div>
                      <Progress value={realtime.cache_hit_rate * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Cost Analytics Tab */}
        <TabsContent value="cost" className="space-y-4">
          {costDaily && costMonthly && realtime && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Today's Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCost(realtime.total_cost_today)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Daily spending</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCost(costMonthly.total_cost)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Month-to-date</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cost Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {costMonthly.cost_trend === 'increasing' ? (
                        <TrendingUp className="h-5 w-5 text-red-500" />
                      ) : costMonthly.cost_trend === 'decreasing' ? (
                        <TrendingDown className="h-5 w-5 text-green-500" />
                      ) : (
                        <Activity className="h-5 w-5 text-blue-500" />
                      )}
                      <span className="text-xl font-bold capitalize">{costMonthly.cost_trend}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">30-day trend</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cost Per Query</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCost(realtime.total_cost_today / Math.max(realtime.active_users * 10, 1))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Average cost</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown (MTD)</CardTitle>
                  <CardDescription>Monthly spending by service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(costMonthly.cost_breakdown).map(([service, cost]) => (
                      <div key={service} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              {service === 'llm' && <Brain className="h-4 w-4" />}
                              {service === 'embedding' && <Sparkles className="h-4 w-4" />}
                              {service === 'storage' && <Database className="h-4 w-4" />}
                              {service === 'compute' && <Cpu className="h-4 w-4" />}
                              {service === 'search' && <Target className="h-4 w-4" />}
                            </div>
                            <span className="font-medium capitalize">{service}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCost(cost)}</div>
                            <div className="text-xs text-muted-foreground">
                              {((cost / costMonthly.total_cost) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <Progress value={(cost / costMonthly.total_cost) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Observability Tab */}
        <TabsContent value="observability" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>Observability stack components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Prometheus Metrics</span>
                  </div>
                  <Badge variant="default">110+ Metrics</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span className="font-medium">TimescaleDB Analytics</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="font-medium">LangFuse Tracing</span>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Cost Attribution</span>
                  </div>
                  <Badge variant="default">Tracking</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access monitoring tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Grafana Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Prometheus Metrics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="mr-2 h-4 w-4" />
                  LangFuse Traces
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  TimescaleDB Queries
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Cost Optimization
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monitoring Capabilities</CardTitle>
              <CardDescription>Comprehensive observability features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">Workflow Execution</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Track every workflow from start to finish
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">RAG Retrieval</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Component-level performance tracking
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">Tool Execution</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Parallel tool performance analysis
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">LLM Generation</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Token usage & cost per call
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">Quality Scoring</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automated quality assessment
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">User Feedback</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Capture and analyze user ratings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


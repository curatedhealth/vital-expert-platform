'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// ============================================================================
// Types
// ============================================================================

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  responseTime: number;
}

interface PlatformMetrics {
  activeUsers: number;
  activeUsersTrend: number;
  totalSessions: number;
  sessionsTrend: number;
  queriesPerSecond: number;
  queriesTrend: number;
  errorRate: number;
  errorRateTrend: number;
}

interface CostMetrics {
  dailyCost: number;
  dailyTrend: number;
  monthlyCost: number;
  monthlyBudget: number;
  topCostDrivers: Array<{ name: string; cost: number }>;
}

interface AgentMetrics {
  totalExecutions: number;
  successRate: number;
  avgLatency: number;
  topAgents: Array<{ name: string; executions: number; successRate: number }>;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  category: string;
}

// ============================================================================
// Executive Dashboard Component
// ============================================================================

export default function ExecutiveDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 99.97,
    cpu: 45,
    memory: 62,
    disk: 38,
    responseTime: 142,
  });

  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>({
    activeUsers: 247,
    activeUsersTrend: 12.5,
    totalSessions: 1842,
    sessionsTrend: 8.3,
    queriesPerSecond: 34.2,
    queriesTrend: -2.1,
    errorRate: 0.23,
    errorRateTrend: -15.4,
  });

  const [costMetrics, setCostMetrics] = useState<CostMetrics>({
    dailyCost: 87.45,
    dailyTrend: 5.2,
    monthlyCost: 2456.78,
    monthlyBudget: 5000,
    topCostDrivers: [
      { name: 'GPT-4', cost: 1245.32 },
      { name: 'Embeddings', cost: 587.21 },
      { name: 'GPT-3.5', cost: 342.15 },
    ],
  });

  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics>({
    totalExecutions: 8742,
    successRate: 96.8,
    avgLatency: 3.4,
    topAgents: [
      { name: 'Ask Expert', executions: 4521, successRate: 97.2 },
      { name: 'Document Analyzer', executions: 2134, successRate: 98.1 },
      { name: 'Workflow Agent', executions: 2087, successRate: 95.3 },
    ],
  });

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      severity: 'warning',
      title: 'High Cost Alert',
      description: 'Daily LLM costs approaching 50% of budget',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      category: 'cost',
    },
    {
      id: '2',
      severity: 'info',
      title: 'Performance Update',
      description: 'Agent success rate improved by 2.3%',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      category: 'performance',
    },
    {
      id: '3',
      severity: 'warning',
      title: 'Rate Limit Alert',
      description: 'User john@example.com nearing query quota',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      category: 'usage',
    },
  ]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshData = () => {
    // In production, fetch real-time data from your analytics service
    setLastUpdate(new Date());
    
    // Simulate minor fluctuations
    setPlatformMetrics((prev) => ({
      ...prev,
      activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
      queriesPerSecond: Math.max(0, prev.queriesPerSecond + Math.random() * 4 - 2),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
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

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cost);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time platform health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Wifi className="mr-2 h-4 w-4" />
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <Activity className="mr-2 h-4 w-4" />
            Refresh Now
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* System Health Status */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(systemHealth.status)}
              <CardTitle>System Health</CardTitle>
            </div>
            <Badge
              variant={
                systemHealth.status === 'healthy'
                  ? 'default'
                  : systemHealth.status === 'degraded'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {systemHealth.status.toUpperCase()}
            </Badge>
          </div>
          <CardDescription>
            Uptime: {systemHealth.uptime}% • Response Time: {systemHealth.responseTime}ms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span>CPU</span>
                </div>
                <span className="font-medium">{systemHealth.cpu}%</span>
              </div>
              <Progress value={systemHealth.cpu} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span>Memory</span>
                </div>
                <span className="font-medium">{systemHealth.memory}%</span>
              </div>
              <Progress value={systemHealth.memory} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>Disk</span>
                </div>
                <span className="font-medium">{systemHealth.disk}%</span>
              </div>
              <Progress value={systemHealth.disk} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span>Response</span>
                </div>
                <span className="font-medium">{systemHealth.responseTime}ms</span>
              </div>
              <Progress
                value={Math.min((systemHealth.responseTime / 1000) * 100, 100)}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformMetrics.activeUsers}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(platformMetrics.activeUsersTrend)}
              <span
                className={
                  platformMetrics.activeUsersTrend > 0 ? 'text-green-500' : 'text-red-500'
                }
              >
                {Math.abs(platformMetrics.activeUsersTrend)}%
              </span>
              <span>from last hour</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformMetrics.totalSessions}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(platformMetrics.sessionsTrend)}
              <span
                className={platformMetrics.sessionsTrend > 0 ? 'text-green-500' : 'text-red-500'}
              >
                {Math.abs(platformMetrics.sessionsTrend)}%
              </span>
              <span>from yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Queries Per Second */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queries/Second</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformMetrics.queriesPerSecond.toFixed(1)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(platformMetrics.queriesTrend)}
              <span
                className={platformMetrics.queriesTrend > 0 ? 'text-green-500' : 'text-red-500'}
              >
                {Math.abs(platformMetrics.queriesTrend)}%
              </span>
              <span>from average</span>
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformMetrics.errorRate}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(-platformMetrics.errorRateTrend)}
              <span className="text-green-500">
                {Math.abs(platformMetrics.errorRateTrend)}% improvement
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Detailed Metrics */}
      <Tabs defaultValue="cost" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cost">Cost Analytics</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        {/* Cost Analytics Tab */}
        <TabsContent value="cost" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Daily Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCost(costMetrics.dailyCost)}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(costMetrics.dailyTrend)}
                  <span className={costMetrics.dailyTrend > 0 ? 'text-red-500' : 'text-green-500'}>
                    {Math.abs(costMetrics.dailyTrend)}% from yesterday
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCost(costMetrics.monthlyCost)}</div>
                <Progress
                  value={(costMetrics.monthlyCost / costMetrics.monthlyBudget) * 100}
                  className="mt-2 h-2"
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {((costMetrics.monthlyCost / costMetrics.monthlyBudget) * 100).toFixed(1)}% of
                  budget
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCost(costMetrics.monthlyBudget - costMetrics.monthlyCost)}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {formatCost(costMetrics.monthlyBudget)} total
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Cost Drivers</CardTitle>
              <CardDescription>Breakdown by service (MTD)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costMetrics.topCostDrivers.map((driver, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      <span className="font-medium">{driver.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCost(driver.cost)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((driver.cost / costMetrics.monthlyCost) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Performance Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentMetrics.totalExecutions.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Last 24 hours</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agentMetrics.successRate}%</div>
                <Progress value={agentMetrics.successRate} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agentMetrics.avgLatency}s</div>
                <div className="text-xs text-muted-foreground">95th percentile</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Agents</CardTitle>
              <CardDescription>By execution volume (24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentMetrics.topAgents.map((agent, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{agent.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {agent.executions.toLocaleString()} executions
                        </span>
                        <Badge variant={agent.successRate > 95 ? 'default' : 'secondary'}>
                          {agent.successRate}% success
                        </Badge>
                      </div>
                    </div>
                    <Progress value={agent.successRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
                  <p className="text-lg font-medium">No Active Alerts</p>
                  <p className="text-sm text-muted-foreground">All systems operating normally</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                  <div className="flex items-start gap-3">
                    {alert.severity === 'critical' ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : alert.severity === 'warning' ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <AlertTitle className="mb-0">{alert.title}</AlertTitle>
                        <Badge variant="outline" className="ml-2">
                          {alert.category}
                        </Badge>
                      </div>
                      <AlertDescription>{alert.description}</AlertDescription>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{alert.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access key monitoring and management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Grafana
            </Button>
            <Button variant="outline" className="justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Prometheus
            </Button>
            <Button variant="outline" className="justify-start">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Alertmanager
            </Button>
            <Button variant="outline" className="justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Cost Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


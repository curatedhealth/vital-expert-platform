"use client";

import {
  Activity,
  Users,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { RAGPerformanceSummary } from '@/components/rag/RAGPerformanceSummary';

interface KPIMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  unit?: string;
  description?: string;
}

interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'gauge';
  data: unknown[];
  timeRange: string;
  status: 'loading' | 'ready' | 'error';
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    responseTime?: number;
    uptime?: number;
  }[];
}

const MOCK_KPI_DATA: KPIMetric[] = [
  {
    id: 'active_users',
    title: 'Active Users',
    value: 2847,
    change: 12.3,
    changeType: 'increase',
    icon: Users,
    description: 'Daily active users across all platforms'
  },
  {
    id: 'success_rate',
    title: 'Success Rate',
    value: '97.8%',
    change: 0.5,
    changeType: 'increase',
    icon: CheckCircle,
    description: 'Agent execution success rate'
  },
  {
    id: 'avg_response_time',
    title: 'Response Time',
    value: '245ms',
    change: -8.2,
    changeType: 'decrease',
    icon: Clock,
    description: 'Average orchestration response time'
  },
  {
    id: 'ai_interactions',
    title: 'AI Interactions',
    value: '15.2K',
    change: 23.7,
    changeType: 'increase',
    icon: Brain,
    description: 'Total AI agent interactions today'
  }
];

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    severity: 'warning',
    title: 'High Memory Usage',
    message: 'System memory utilization is at 87%. Consider scaling up.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    acknowledged: false
  },
  {
    id: '2',
    severity: 'info',
    title: 'Scheduled Maintenance',
    message: 'Database maintenance scheduled for tonight at 2:00 AM UTC.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    acknowledged: true
  },
  {
    id: '3',
    severity: 'error',
    title: 'Agent Failure Rate Spike',
    message: 'Clinical Trial Designer agent showing increased failure rate (8.2%).',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    acknowledged: false
  }
];

const MOCK_SYSTEM_HEALTH: SystemHealth = {
  overall: 'healthy',
  components: [
    { name: 'Master Orchestrator', status: 'healthy', responseTime: 98, uptime: 99.97 },
    { name: 'Agent Router', status: 'healthy', responseTime: 156, uptime: 99.94 },
    { name: 'Prompt Engine', status: 'warning', responseTime: 234, uptime: 99.85 },
    { name: 'Database', status: 'healthy', responseTime: 23, uptime: 99.99 },
    { name: 'Cache Layer', status: 'healthy', responseTime: 12, uptime: 99.98 },
    { name: 'Monitoring', status: 'healthy', responseTime: 78, uptime: 100 }
  ]
};

const KPICard: React.FC<{ metric: KPIMetric }> = ({ metric }) => {

                     metric.changeType === 'decrease' ? 'text-red-600' : 'text-neutral-600';

                    metric.changeType === 'decrease' ? '↘' : '→';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <div className={`text-xs ${changeColor} flex items-center gap-1`}>
          <span>{changeIcon}</span>
          <span>{Math.abs(metric.change)}% from last period</span>
        </div>
        {metric.description && (
          <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const AlertItem: React.FC<{ alert: Alert; onAcknowledge: (id: string) => void }> = ({
  alert,
  onAcknowledge
}) => {
  const alertConfig: Record<string, { color: string; icon: string }> = {
    info: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '💡' },
    warning: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚠️' },
    error: { color: 'bg-red-100 text-red-800 border-red-200', icon: '❌' },
    critical: { color: 'bg-red-200 text-red-900 border-red-300', icon: '🚨' }
  };

  const config = alertConfig[alert.type] || alertConfig.info;

  return (
    <div className={`p-3 rounded-lg border ${config.color} ${alert.acknowledged ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-lg">{config.icon}</span>
          <div>
            <h4 className="font-medium text-sm">{alert.title}</h4>
            <p className="text-xs mt-1">{alert.message}</p>
            <p className="text-xs opacity-70 mt-1">
              {alert.timestamp.toLocaleString()}
            </p>
          </div>
        </div>
        {!alert.acknowledged && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAcknowledge(alert.id)}
            className="text-xs"
          >
            Acknowledge
          </Button>
        )}
      </div>
    </div>
  );
};

const SystemHealthPanel: React.FC<{ health: SystemHealth }> = ({ health }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
          {getStatusBadge(health.overall)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {health.components.map((component, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  component.status === 'healthy' ? 'bg-green-500' :
                  component.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="font-medium">{component.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                {component.responseTime && (
                  <span>{component.responseTime}ms</span>
                )}
                {component.uptime && (
                  <span>{component.uptime}% uptime</span>
                )}
                {getStatusBadge(component.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ChartWidget: React.FC<{ data: ChartData }> = ({ data }) => {
  const [isLoading, setIsLoading] = useState(false);

  const refreshChart = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <Card className="h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {data.type === 'line' && <LineChart className="h-5 w-5" />}
            {data.type === 'bar' && <BarChart3 className="h-5 w-5" />}
            {data.type === 'pie' && <PieChart className="h-5 w-5" />}
            {data.title}
          </CardTitle>
          <CardDescription>{data.timeRange}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshChart}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] flex items-center justify-center bg-neutral-50 rounded-lg">
          {data.status === 'loading' || isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-neutral-600">Loading chart data...</span>
            </div>
          ) : data.status === 'error' ? (
            <div className="flex flex-col items-center gap-2 text-red-600">
              <AlertTriangle className="h-8 w-8" />
              <span className="text-sm">Failed to load chart data</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              {data.type === 'line' && <LineChart className="h-16 w-16" />}
              {data.type === 'bar' && <BarChart3 className="h-16 w-16" />}
              {data.type === 'pie' && <PieChart className="h-16 w-16" />}
              <span className="text-sm">Chart visualization would render here</span>
              <span className="text-xs">({data.data.length} data points)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardMain: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIMetric[]>(MOCK_KPI_DATA);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(MOCK_SYSTEM_HEALTH);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate data updates
      setKpiData(prev => prev.map(metric => ({
        ...metric,
        change: Math.random() * 30 - 15 // Random change between -15 and +15
      })));
      setLastRefresh(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const mockChartData: ChartData[] = [
    {
      id: 'user_activity',
      title: 'User Activity Trends',
      type: 'line',
      data: Array.from({ length: 24 }, (_, i) => ({ hour: i, users: Math.floor(Math.random() * 1000) })),
      timeRange: selectedTimeRange,
      status: 'ready'
    },
    {
      id: 'agent_performance',
      title: 'Agent Performance Metrics',
      type: 'bar',
      data: [
        { agent: 'Clinical Trial Designer', success: 97.8, failures: 2.2 },
        { agent: 'Regulatory Strategist', success: 95.4, failures: 4.6 },
        { agent: 'Market Access', success: 98.1, failures: 1.9 }
      ],
      timeRange: selectedTimeRange,
      status: 'ready'
    },
    {
      id: 'usage_distribution',
      title: 'Usage Distribution',
      type: 'pie',
      data: [
        { category: 'Clinical Trials', value: 45 },
        { category: 'Regulatory', value: 30 },
        { category: 'Market Access', value: 25 }
      ],
      timeRange: selectedTimeRange,
      status: 'ready'
    },
    {
      id: 'system_performance',
      title: 'System Performance',
      type: 'line',
      data: Array.from({ length: 60 }, (_, i) => ({
        minute: i,
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        response_time: Math.random() * 500
      })),
      timeRange: selectedTimeRange,
      status: 'ready'
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">VITAL Path Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
            {criticalAlerts.length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Auto-refresh:</label>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'On' : 'Off'}
            </Button>
          </div>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-md bg-canvas-surface text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((metric) => (
          <KPICard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {unacknowledgedAlerts.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockChartData.slice(0, 2).map((chart) => (
              <ChartWidget key={chart.id} data={chart} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartWidget data={mockChartData[3]} />
            </div>
            <div className="space-y-6">
              <SystemHealthPanel health={systemHealth} />
              <RAGPerformanceSummary />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget data={mockChartData[1]} />
            <Card>
              <CardHeader>
                <CardTitle>Agent Status</CardTitle>
                <CardDescription>Current status of all AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Clinical Trial Designer', status: 'active', load: 78 },
                    { name: 'Regulatory Strategist', status: 'active', load: 65 },
                    { name: 'Market Access Strategist', status: 'active', load: 43 },
                    { name: 'Virtual Advisory Board', status: 'idle', load: 12 }
                  ].map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          agent.status === 'active' ? 'bg-green-500' : 'bg-neutral-400'
                        }`} />
                        <span className="font-medium">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-600">Load:</span>
                          <Progress value={agent.load} className="w-20" />
                          <span className="text-sm font-medium">{agent.load}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
                <CardDescription>Currently running workflow instances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'WF-001', name: 'Drug Development Pipeline', stage: 'Phase II Analysis', progress: 65 },
                    { id: 'WF-002', name: 'Regulatory Submission', stage: 'Document Review', progress: 23 },
                    { id: 'WF-003', name: 'Market Access Strategy', stage: 'Payer Analysis', progress: 87 }
                  ].map((workflow, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-neutral-600">{workflow.id} • {workflow.stage}</p>
                        </div>
                        <Badge variant={workflow.progress > 80 ? "default" : workflow.progress > 50 ? "secondary" : "outline"}>
                          {workflow.progress}%
                        </Badge>
                      </div>
                      <Progress value={workflow.progress} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <SystemHealthPanel health={systemHealth} />
            <ChartWidget data={mockChartData[3]} />
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Alerts</span>
                    <Badge variant="outline">
                      {unacknowledgedAlerts.length} unacknowledged
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <AlertItem
                        key={alert.id}
                        alert={alert}
                        onAcknowledge={handleAcknowledgeAlert}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Alert Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { severity: 'Critical', count: criticalAlerts.length, color: 'text-red-600' },
                      { severity: 'Error', count: alerts.filter((a: any) => a.severity === 'error' && !a.acknowledged).length, color: 'text-red-500' },
                      { severity: 'Warning', count: alerts.filter((a: any) => a.severity === 'warning' && !a.acknowledged).length, color: 'text-yellow-600' },
                      { severity: 'Info', count: alerts.filter((a: any) => a.severity === 'info' && !a.acknowledged).length, color: 'text-blue-600' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.severity}</span>
                        <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardMain;
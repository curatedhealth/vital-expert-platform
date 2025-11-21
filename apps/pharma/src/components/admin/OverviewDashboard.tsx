'use client';

import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Layers,
  TrendingUp,
  Users,
  Zap,
  Database,
  Server,
  HardDrive,
  RefreshCw,
  Plus,
  AlertCircle,
  Shield,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Progress } from '@vital/ui';
import { ScrollArea } from '@vital/ui';
import { createClient } from '@vital/sdk/client';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalAgents: number;
  activeAgents: number;
  draftAgents: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  monthlyCost: number;
  errorRate: number;
  uptime: number;
}

interface SystemStatus {
  database: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  llmProviders: 'healthy' | 'degraded' | 'down';
  storage: number; // percentage used
  queueHealth: 'healthy' | 'degraded' | 'down';
}

interface ActivityItem {
  id: string;
  type: 'user_login' | 'agent_deploy' | 'system_event' | 'admin_action';
  message: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'error';
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

export function OverviewDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load metrics
      await Promise.all([
        loadMetrics(),
        loadSystemStatus(),
        loadRecentActivity(),
        loadCriticalAlerts(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    // Get user count from Supabase auth
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    
    // Get agent count
    const { data: agentsData, error: agentsError } = await supabase
      .from('agents')
      .select('id, status', { count: 'exact' })
      .eq('tenant_id', STARTUP_TENANT_ID);

    const totalUsers = usersData?.users?.length || 0;
    const totalAgents = agentsData?.length || 0;
    const activeAgents = agentsData?.filter(a => a.status === 'active').length || 0;
    const draftAgents = agentsData?.filter(a => a.status === 'draft').length || 0;

    setMetrics({
      totalUsers,
      activeUsers: Math.floor(totalUsers * 0.7), // Mock: 70% active
      totalAgents,
      activeAgents,
      draftAgents,
      systemHealth: 'healthy',
      monthlyCost: 1247.50,
      errorRate: 0.02,
      uptime: 99.9,
    });
  };

  const loadSystemStatus = async () => {
    // Mock system status - in production, this would call health check endpoints
    setSystemStatus({
      database: 'healthy',
      api: 'healthy',
      llmProviders: 'healthy',
      storage: 45, // 45% used
      queueHealth: 'healthy',
    });
  };

  const loadRecentActivity = async () => {
    // Mock recent activity - in production, this would come from audit logs
    setRecentActivity([
      {
        id: '1',
        type: 'admin_action',
        message: 'New agent "Clinical Advisor" deployed',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        severity: 'info',
      },
      {
        id: '2',
        type: 'user_login',
        message: 'User john@example.com logged in',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        severity: 'info',
      },
      {
        id: '3',
        type: 'system_event',
        message: 'System backup completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        severity: 'info',
      },
    ]);
  };

  const loadCriticalAlerts = async () => {
    // Mock alerts - in production, this would come from monitoring system
    setCriticalAlerts([
      {
        id: '1',
        title: 'High LLM Cost',
        message: 'Monthly cost approaching budget limit (85% used)',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ]);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded':
      case 'warning': return 'text-yellow-600';
      case 'down':
      case 'critical': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return CheckCircle;
      case 'degraded':
      case 'warning': return AlertCircle;
      case 'down':
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge>Info</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading || !metrics || !systemStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const HealthIcon = getHealthIcon(metrics.systemHealth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Command Center</h1>
          <p className="text-muted-foreground mt-1">
            System overview and management dashboard
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeAgents} active, {metrics.draftAgents} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <HealthIcon className={`h-4 w-4 ${getHealthColor(metrics.systemHealth)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.systemHealth}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.uptime}% uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {(metrics.errorRate * 100).toFixed(2)}% error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Deploy Agent
            </Button>
            <Button className="w-full" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Alerts
            </Button>
            <Button className="w-full" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              System Check
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Database</span>
              </div>
              <Badge className={systemStatus.database === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {systemStatus.database}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">API</span>
              </div>
              <Badge className={systemStatus.api === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {systemStatus.api}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">LLM Providers</span>
              </div>
              <Badge className={systemStatus.llmProviders === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {systemStatus.llmProviders}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Storage</span>
                </div>
                <span className="text-sm text-muted-foreground">{systemStatus.storage}%</span>
              </div>
              <Progress value={systemStatus.storage} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Queue Health</span>
              </div>
              <Badge className={systemStatus.queueHealth === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {systemStatus.queueHealth}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {criticalAlerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criticalAlerts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p>No critical alerts</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {criticalAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm">{alert.title}</span>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(alert.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg">
                  <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}


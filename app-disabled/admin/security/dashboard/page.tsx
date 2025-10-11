'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Globe, 
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react';
import { MetricsCard } from '@/components/security/MetricsCard';
import { ThreatTimeline } from '@/components/security/ThreatTimeline';
import { LiveActivityFeed } from '@/components/security/LiveActivityFeed';
import { SecurityScore } from '@/components/security/SecurityScore';
import { ThreatAnalytics } from '@/components/security/ThreatAnalytics';
import { ComplianceStatus } from '@/components/security/ComplianceStatus';

interface SecurityMetrics {
  activeThreats: number;
  failedAuthAttempts: number;
  rateLimitViolations: number;
  securityScore: number;
  totalUsers: number;
  totalOrganizations: number;
  lastThreatTime: string;
  threatsResolved: number;
}

interface ThreatEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  resolved: boolean;
  falsePositive: boolean;
}

interface SecurityTrend {
  hour: string;
  threatCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [trends, setTrends] = useState<SecurityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch security metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/security/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    }
  };

  // Fetch recent threats
  const fetchThreats = async () => {
    try {
      const response = await fetch('/api/admin/security/threats?limit=50');
      if (response.ok) {
        const data = await response.json();
        setThreats(data.threats || []);
      }
    } catch (error) {
      console.error('Error fetching threats:', error);
    }
  };

  // Fetch security trends
  const fetchTrends = async () => {
    try {
      const response = await fetch('/api/admin/security/trends?hours=24');
      if (response.ok) {
        const data = await response.json();
        setTrends(data.trends || []);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMetrics(),
      fetchThreats(),
      fetchTrends()
    ]);
    setLastRefresh(new Date());
    setLoading(false);
  };

  // Auto-refresh effect
  useEffect(() => {
    refreshData();

    if (autoRefresh) {
      const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  // Get threat type icon
  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return <Ban className="h-4 w-4" />;
      case 'sql_injection': return <AlertTriangle className="h-4 w-4" />;
      case 'credential_stuffing': return <Users className="h-4 w-4" />;
      case 'unusual_access': return <Eye className="h-4 w-4" />;
      case 'geographic_anomaly': return <Globe className="h-4 w-4" />;
      case 'rate_limit_abuse': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading security dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security threats, analyze patterns, and track compliance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
        </div>
      </div>

      {/* Last refresh indicator */}
      <div className="text-sm text-muted-foreground">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>

      {/* Critical alerts */}
      {threats.some(t => t.severity === 'critical' && !t.resolved) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical threats detected!</strong> Immediate attention required.
            {threats.filter(t => t.severity === 'critical' && !t.resolved).length} critical threats need investigation.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Active Threats"
          value={metrics?.activeThreats || 0}
          icon={<Shield className="h-4 w-4" />}
          trend={trends.length > 1 ? 
            (trends[0]?.threatCount || 0) - (trends[1]?.threatCount || 0) : 0
          }
          description="Threats requiring attention"
        />
        <MetricsCard
          title="Security Score"
          value={`${metrics?.securityScore || 0}/100`}
          icon={<CheckCircle className="h-4 w-4" />}
          trend={0}
          description="Overall security posture"
        />
        <MetricsCard
          title="Failed Auth Attempts"
          value={metrics?.failedAuthAttempts || 0}
          icon={<Users className="h-4 w-4" />}
          trend={0}
          description="Last 24 hours"
        />
        <MetricsCard
          title="Rate Limit Violations"
          value={metrics?.rateLimitViolations || 0}
          icon={<Activity className="h-4 w-4" />}
          trend={0}
          description="Last 24 hours"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Score</CardTitle>
                <CardDescription>
                  Overall security posture based on multiple factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityScore score={metrics?.securityScore || 0} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Timeline</CardTitle>
                <CardDescription>
                  Recent security events over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThreatTimeline threats={threats.slice(0, 20)} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Threats</CardTitle>
              <CardDescription>
                Latest security threats requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.slice(0, 10).map((threat) => (
                  <div
                    key={threat.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getThreatIcon(threat.type)}
                      <div>
                        <div className="font-medium capitalize">
                          {threat.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {threat.ipAddress} • {new Date(threat.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                      {threat.resolved && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                      {threat.falsePositive && (
                        <Badge variant="outline">
                          False Positive
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Threats</CardTitle>
              <CardDescription>
                Complete list of security threats and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.map((threat) => (
                  <div
                    key={threat.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      {getThreatIcon(threat.type)}
                      <div>
                        <div className="font-medium capitalize">
                          {threat.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {threat.ipAddress} • {threat.endpoint} • {new Date(threat.timestamp).toLocaleString()}
                        </div>
                        {threat.userAgent && (
                          <div className="text-xs text-muted-foreground">
                            {threat.userAgent}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                      {threat.resolved && (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                      {threat.falsePositive && (
                        <Badge variant="outline">
                          False Positive
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <ThreatAnalytics trends={trends} threats={threats} />
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <ComplianceStatus />
        </TabsContent>

        {/* Live Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <LiveActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}

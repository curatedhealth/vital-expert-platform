'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Activity, 
  Eye, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { RateLimitManager } from './RateLimitManager';
import { AbuseDetection } from './AbuseDetection';
import { IPManagement } from './IPManagement';
import { SecurityIncidents } from './SecurityIncidents';

interface SecurityStats {
  totalViolations: number;
  activeIncidents: number;
  blockedIPs: number;
  violationsToday: number;
  topViolatingIPs: Array<{ ip: string; count: number }>;
  violationsByType: Array<{ type: string; count: number }>;
}

export function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/security/stats');
      if (!response.ok) throw new Error('Failed to fetch security stats');
      
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching security stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (count: number) => {
    if (count === 0) return 'bg-green-100 text-green-800';
    if (count < 10) return 'bg-yellow-100 text-yellow-800';
    if (count < 50) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading security data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViolations || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time violations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeIncidents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Open security incidents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.blockedIPs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Violations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.violationsToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common security management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All Incidents
            </Button>
            <Button variant="outline" size="sm">
              <Ban className="h-4 w-4 mr-2" />
              Block IP Address
            </Button>
            <Button variant="outline" size="sm" onClick={fetchStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top Violating IPs */}
      {stats?.topViolatingIPs && stats.topViolatingIPs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Violating IPs</CardTitle>
            <CardDescription>
              IP addresses with the most rate limit violations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topViolatingIPs.slice(0, 5).map((item, index) => (
                <div key={item.ip} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{item.ip}</span>
                    <Badge variant="outline">{item.count} violations</Badge>
                  </div>
                  <Badge 
                    className={getSeverityColor(item.count)}
                    variant="secondary"
                  >
                    {index === 0 ? 'Most Active' : `#${index + 1}`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Violations by Type */}
      {stats?.violationsByType && stats.violationsByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Violations by Endpoint Type</CardTitle>
            <CardDescription>
              Distribution of violations across different API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.violationsByType.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{item.type}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Main Security Management Tabs */}
      <Tabs defaultValue="rate-limits" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="abuse-detection">Abuse Detection</TabsTrigger>
          <TabsTrigger value="ip-management">IP Management</TabsTrigger>
          <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="rate-limits" className="mt-6">
          <RateLimitManager />
        </TabsContent>

        <TabsContent value="abuse-detection" className="mt-6">
          <AbuseDetection />
        </TabsContent>

        <TabsContent value="ip-management" className="mt-6">
          <IPManagement />
        </TabsContent>

        <TabsContent value="incidents" className="mt-6">
          <SecurityIncidents />
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Search,
  RefreshCw,
  AlertCircle,
  Ban,
  Users,
  Clock,
  Eye,
  Download,
  Filter,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vital/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@vital/ui';
import { createClient } from '@vital/sdk/client';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

interface AnomalyEvent {
  id: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  anomaly_type: 'spike' | 'unusual_pattern' | 'quota_abuse' | 'suspicious_ip';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  request_count: number;
  ip_address?: string;
  user_agent?: string;
  cost_impact?: number;
  metadata: any;
}

interface AbuseStats {
  totalAnomalies: number;
  criticalAnomalies: number;
  suspiciousIPs: number;
  blockedRequests: number;
}

const supabase = createClient();

export function AbuseDetectionDashboard() {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState<AnomalyEvent[]>([]);
  const [stats, setStats] = useState<AbuseStats>({
    totalAnomalies: 0,
    criticalAnomalies: 0,
    suspiciousIPs: 0,
    blockedRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadAnomalies();
    const interval = setInterval(loadAnomalies, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  useEffect(() => {
    filterAnomalies();
  }, [searchQuery, typeFilter, severityFilter, anomalies]);

  const loadAnomalies = async () => {
    try {
      setLoading(true);

      // Get time range
      const timeRangeMap: { [key: string]: number } = {
        '1h': 1,
        '24h': 24,
        '7d': 168,
        '30d': 720,
      };
      const hoursAgo = timeRangeMap[timeRange] || 24;
      const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

      // Query audit events for anomalies
      // In production, this would query the analytics.platform_events table
      // For now, we'll simulate with audit_events
      const { data: auditData, error: auditError } = await supabase
        .from('audit_events')
        .select('*')
        .gte('created_at', startTime)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (auditError) throw auditError;

      // Detect anomalies from audit data
      const detectedAnomalies = detectAnomalies(auditData || []);
      setAnomalies(detectedAnomalies);
      calculateStats(detectedAnomalies);
    } catch (error) {
      console.error('Error loading anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectAnomalies = (auditEvents: any[]): AnomalyEvent[] => {
    const anomalies: AnomalyEvent[] = [];
    const ipCounts: { [key: string]: number } = {};
    const userCounts: { [key: string]: number } = {};
    const sessionCounts: { [key: string]: number } = {};

    // Analyze patterns
    auditEvents.forEach(event => {
      // Count by IP
      if (event.ip_address) {
        ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1;
      }

      // Count by user
      if (event.user_id) {
        userCounts[event.user_id] = (userCounts[event.user_id] || 0) + 1;
      }

      // Count by session
      if (event.session_id) {
        sessionCounts[event.session_id] = (sessionCounts[event.session_id] || 0) + 1;
      }
    });

    // Detect IP spikes (>100 requests from single IP)
    Object.entries(ipCounts).forEach(([ip, count]) => {
      if (count > 100) {
        anomalies.push({
          id: `ip-spike-${ip}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          anomaly_type: 'spike',
          severity: count > 500 ? 'critical' : count > 200 ? 'high' : 'medium',
          description: `Suspicious spike detected from IP ${ip}`,
          request_count: count,
          ip_address: ip,
          metadata: { ipCounts },
        });
      }
    });

    // Detect user abuse (>50 requests from single user)
    Object.entries(userCounts).forEach(([userId, count]) => {
      if (count > 50) {
        anomalies.push({
          id: `user-abuse-${userId}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user_id: userId,
          anomaly_type: 'quota_abuse',
          severity: count > 200 ? 'high' : 'medium',
          description: `Excessive usage detected from user`,
          request_count: count,
          metadata: { userCounts },
        });
      }
    });

    // Detect unusual session patterns (>30 requests in single session)
    Object.entries(sessionCounts).forEach(([sessionId, count]) => {
      if (count > 30) {
        anomalies.push({
          id: `session-pattern-${sessionId}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          session_id: sessionId,
          anomaly_type: 'unusual_pattern',
          severity: count > 100 ? 'high' : 'medium',
          description: `Unusual activity pattern in session`,
          request_count: count,
          metadata: { sessionCounts },
        });
      }
    });

    return anomalies.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const calculateStats = (anomalyList: AnomalyEvent[]) => {
    const totalAnomalies = anomalyList.length;
    const criticalAnomalies = anomalyList.filter(a => a.severity === 'critical').length;
    const suspiciousIPs = new Set(anomalyList.map(a => a.ip_address).filter(Boolean)).size;
    const blockedRequests = anomalyList
      .filter(a => a.severity === 'critical')
      .reduce((sum, a) => sum + a.request_count, 0);

    setStats({ totalAnomalies, criticalAnomalies, suspiciousIPs, blockedRequests });
  };

  const filterAnomalies = () => {
    let filtered = anomalies;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        anomaly =>
          anomaly.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (anomaly.ip_address && anomaly.ip_address.includes(searchQuery)) ||
          (anomaly.user_id && anomaly.user_id.includes(searchQuery))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.anomaly_type === typeFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.severity === severityFilter);
    }

    setFilteredAnomalies(filtered);
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      critical: { className: 'bg-red-100 text-red-800', icon: Ban },
      high: { className: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      medium: { className: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      low: { className: 'bg-blue-100 text-blue-800', icon: Activity },
    };

    const { className, icon: Icon } = config[severity as keyof typeof config] || config.low;

    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = {
      spike: { label: 'Traffic Spike', color: 'bg-purple-100 text-purple-800' },
      unusual_pattern: { label: 'Unusual Pattern', color: 'bg-blue-100 text-blue-800' },
      quota_abuse: { label: 'Quota Abuse', color: 'bg-orange-100 text-orange-800' },
      suspicious_ip: { label: 'Suspicious IP', color: 'bg-red-100 text-red-800' },
    };

    const { label, color } = config[type as keyof typeof config] || {
      label: type,
      color: 'bg-neutral-100 text-neutral-800'
    };

    return <Badge className={color}>{label}</Badge>;
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const exportAnomalies = () => {
    const csv = [
      ['Timestamp', 'Type', 'Severity', 'Description', 'Request Count', 'IP Address', 'User ID'],
      ...filteredAnomalies.map(a => [
        a.timestamp,
        a.anomaly_type,
        a.severity,
        a.description,
        a.request_count.toString(),
        a.ip_address || '',
        a.user_id || '',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anomalies-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Abuse Detection & Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time anomaly detection and usage pattern analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnomalies}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadAnomalies}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnomalies}</div>
            <p className="text-xs text-muted-foreground">
              Detected in {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalAnomalies}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious IPs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.suspiciousIPs}</div>
            <p className="text-xs text-muted-foreground">
              Unique addresses flagged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.blockedRequests.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Potentially malicious
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search anomalies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Anomaly Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="spike">Traffic Spike</SelectItem>
                <SelectItem value="unusual_pattern">Unusual Pattern</SelectItem>
                <SelectItem value="quota_abuse">Quota Abuse</SelectItem>
                <SelectItem value="suspicious_ip">Suspicious IP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnomalies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No anomalies detected
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnomalies.map(anomaly => (
                  <TableRow key={anomaly.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatTimestamp(anomaly.timestamp)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(anomaly.anomaly_type)}</TableCell>
                    <TableCell>{getSeverityBadge(anomaly.severity)}</TableCell>
                    <TableCell className="max-w-xs truncate">{anomaly.description}</TableCell>
                    <TableCell className="font-mono">
                      {anomaly.request_count.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {anomaly.ip_address && (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {anomaly.ip_address}
                        </code>
                      )}
                      {anomaly.user_id && !anomaly.ip_address && (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          User: {anomaly.user_id.substring(0, 8)}...
                        </code>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAnomaly(anomaly);
                          setDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Anomaly Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Anomaly Details</DialogTitle>
            <DialogDescription>
              Detailed information about this security event
            </DialogDescription>
          </DialogHeader>
          {selectedAnomaly && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  <div className="mt-1">{getTypeBadge(selectedAnomaly.anomaly_type)}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Severity</span>
                  <div className="mt-1">{getSeverityBadge(selectedAnomaly.severity)}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Timestamp</span>
                  <div className="mt-1 text-sm">
                    {new Date(selectedAnomaly.timestamp).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Request Count</span>
                  <div className="mt-1 text-sm font-mono">
                    {selectedAnomaly.request_count.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <p className="mt-1 text-sm">{selectedAnomaly.description}</p>
              </div>

              {selectedAnomaly.ip_address && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">IP Address</span>
                  <code className="block mt-1 text-sm bg-muted px-3 py-2 rounded">
                    {selectedAnomaly.ip_address}
                  </code>
                </div>
              )}

              {selectedAnomaly.user_id && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">User ID</span>
                  <code className="block mt-1 text-sm bg-muted px-3 py-2 rounded font-mono">
                    {selectedAnomaly.user_id}
                  </code>
                </div>
              )}

              {selectedAnomaly.metadata && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Metadata</span>
                  <pre className="mt-1 text-xs bg-muted px-3 py-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedAnomaly.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


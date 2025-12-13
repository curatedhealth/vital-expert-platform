'use client';

import {
  Gauge,
  AlertTriangle,
  TrendingUp,
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import { Progress } from '@vital/ui';
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
import { createClient } from '@vital/sdk/client';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

interface UsageQuota {
  id: string;
  entity_type: string;
  entity_id?: string;
  quota_type: string;
  quota_period: string;
  quota_limit: number;
  current_usage: number;
  period_start: string;
  period_end: string;
  alert_threshold_percent: number;
  hard_limit: boolean;
  grace_requests: number;
  is_active: boolean;
  last_reset: string;
  next_reset: string;
}

interface QuotaStats {
  totalQuotas: number;
  activeQuotas: number;
  violatedQuotas: number;
  atRiskQuotas: number;
}

const supabase = createClient();

export function RateLimitMonitoring() {
  const [quotas, setQuotas] = useState<UsageQuota[]>([]);
  const [filteredQuotas, setFilteredQuotas] = useState<UsageQuota[]>([]);
  const [stats, setStats] = useState<QuotaStats>({
    totalQuotas: 0,
    activeQuotas: 0,
    violatedQuotas: 0,
    atRiskQuotas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [quotaTypeFilter, setQuotaTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadQuotas();
    const interval = setInterval(loadQuotas, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterQuotas();
  }, [searchQuery, entityTypeFilter, quotaTypeFilter, statusFilter, quotas]);

  const loadQuotas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usage_quotas')
        .select('*')
        .eq('is_active', true)
        .order('current_usage', { ascending: false });

      if (error) throw error;

      if (data) {
        setQuotas(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading quotas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (quotaList: UsageQuota[]) => {
    const totalQuotas = quotaList.length;
    const activeQuotas = quotaList.filter(q => q.is_active).length;
    const violatedQuotas = quotaList.filter(
      q => q.current_usage >= q.quota_limit
    ).length;
    const atRiskQuotas = quotaList.filter(q => {
      const utilizationPct = (q.current_usage / q.quota_limit) * 100;
      return utilizationPct >= q.alert_threshold_percent && utilizationPct < 100;
    }).length;

    setStats({ totalQuotas, activeQuotas, violatedQuotas, atRiskQuotas });
  };

  const filterQuotas = () => {
    let filtered = quotas;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        quota =>
          quota.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quota.quota_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (quota.entity_id && quota.entity_id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Entity type filter
    if (entityTypeFilter !== 'all') {
      filtered = filtered.filter(quota => quota.entity_type === entityTypeFilter);
    }

    // Quota type filter
    if (quotaTypeFilter !== 'all') {
      filtered = filtered.filter(quota => quota.quota_type === quotaTypeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quota => {
        const utilizationPct = (quota.current_usage / quota.quota_limit) * 100;
        switch (statusFilter) {
          case 'violated':
            return utilizationPct >= 100;
          case 'at_risk':
            return utilizationPct >= quota.alert_threshold_percent && utilizationPct < 100;
          case 'healthy':
            return utilizationPct < quota.alert_threshold_percent;
          default:
            return true;
        }
      });
    }

    setFilteredQuotas(filtered);
  };

  const getUtilizationPercent = (quota: UsageQuota): number => {
    return Math.min((quota.current_usage / quota.quota_limit) * 100, 100);
  };

  const getStatusBadge = (quota: UsageQuota) => {
    const utilizationPct = getUtilizationPercent(quota);
    
    if (utilizationPct >= 100) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <Ban className="h-3 w-3 mr-1" />
          Violated
        </Badge>
      );
    } else if (utilizationPct >= quota.alert_threshold_percent) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          At Risk
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Healthy
        </Badge>
      );
    }
  };

  const getProgressColor = (utilizationPct: number, threshold: number): string => {
    if (utilizationPct >= 100) return 'bg-red-600';
    if (utilizationPct >= threshold) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const formatTimeUntilReset = (nextReset: string): string => {
    const now = new Date();
    const reset = new Date(nextReset);
    const diffMs = reset.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const uniqueEntityTypes = Array.from(new Set(quotas.map(q => q.entity_type)));
  const uniqueQuotaTypes = Array.from(new Set(quotas.map(q => q.quota_type)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading rate limits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rate Limit Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Track quota usage, violations, and consumption patterns
          </p>
        </div>
        <Button variant="outline" onClick={loadQuotas}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotas</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuotas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeQuotas} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violated</CardTitle>
            <XCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{stats.violatedQuotas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalQuotas > 0
                ? ((stats.violatedQuotas / stats.totalQuotas) * 100).toFixed(1)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.atRiskQuotas}</div>
            <p className="text-xs text-muted-foreground">
              Above alert threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalQuotas - stats.violatedQuotas - stats.atRiskQuotas}
            </div>
            <p className="text-xs text-muted-foreground">
              Below threshold
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
                placeholder="Search quotas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entity Types</SelectItem>
                {uniqueEntityTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={quotaTypeFilter} onValueChange={setQuotaTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Quota Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quota Types</SelectItem>
                {uniqueQuotaTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="violated">Violated</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotas Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity</TableHead>
                <TableHead>Quota Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hard Limit</TableHead>
                <TableHead>Reset In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No quotas found
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotas.map(quota => {
                  const utilizationPct = getUtilizationPercent(quota);
                  return (
                    <TableRow key={quota.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{quota.entity_type}</span>
                          {quota.entity_id && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {quota.entity_id.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{quota.quota_type}</Badge>
                      </TableCell>
                      <TableCell>{quota.quota_period}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{utilizationPct.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={utilizationPct} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {quota.current_usage.toLocaleString()} / {quota.quota_limit.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(quota)}</TableCell>
                      <TableCell>
                        {quota.hard_limit ? (
                          <Badge className="bg-red-100 text-red-800">
                            <Ban className="h-3 w-3 mr-1" />
                            Enforced
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Soft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatTimeUntilReset(quota.next_reset)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Consumers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Consumers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuotas
              .sort((a, b) => getUtilizationPercent(b) - getUtilizationPercent(a))
              .slice(0, 5)
              .map((quota, index) => {
                const utilizationPct = getUtilizationPercent(quota);
                return (
                  <div key={quota.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {quota.entity_type} - {quota.quota_type}
                        </span>
                        <span className="text-sm font-medium">{utilizationPct.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={utilizationPct} 
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


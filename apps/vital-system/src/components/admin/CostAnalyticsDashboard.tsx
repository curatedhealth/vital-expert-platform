'use client';

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  RefreshCw,
  AlertCircle,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Target,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { createClient } from '@vital/sdk/client';
import { STARTUP_TENANT_ID } from '@/lib/constants/tenant';

interface CostBreakdown {
  service: string;
  cost_type: string;
  total_cost: number;
  transaction_count: number;
  avg_cost: number;
}

interface CostStats {
  totalCost: number;
  dailyBurnRate: number;
  monthlyProjection: number;
  costChange: number;
}

interface CostAlert {
  id: string;
  type: 'budget_exceeded' | 'unusual_spike' | 'optimization_opportunity';
  severity: 'low' | 'medium' | 'high';
  message: string;
  amount: number;
  timestamp: string;
}

const supabase = createClient();

export function CostAnalyticsDashboard() {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [stats, setStats] = useState<CostStats>({
    totalCost: 0,
    dailyBurnRate: 0,
    monthlyProjection: 0,
    costChange: 0,
  });
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [groupBy, setGroupBy] = useState<string>('service');

  useEffect(() => {
    loadCostData();
    const interval = setInterval(loadCostData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange, groupBy]);

  const loadCostData = async () => {
    try {
      setLoading(true);

      // Calculate time range
      const timeRangeMap: { [key: string]: number } = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
      };
      const daysAgo = timeRangeMap[timeRange] || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // In production, this would query analytics.tenant_cost_events
      // For now, we'll simulate with llm_usage_logs
      const { data: usageData, error } = await supabase
        .from('llm_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data
      const breakdown = processUsageData(usageData || []);
      setCostBreakdown(breakdown);
      
      const calculatedStats = calculateStats(usageData || []);
      setStats(calculatedStats);

      const detectedAlerts = detectCostAlerts(breakdown, calculatedStats);
      setAlerts(detectedAlerts);
    } catch (error) {
      console.error('Error loading cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processUsageData = (data: any[]): CostBreakdown[] => {
    const breakdown: { [key: string]: CostBreakdown } = {};

    data.forEach(log => {
      // Estimate cost based on token usage
      // GPT-4: $0.03/1K prompt tokens, $0.06/1K completion tokens
      // GPT-3.5: $0.001/1K prompt tokens, $0.002/1K completion tokens
      const model = log.model || 'gpt-3.5-turbo';
      const isGPT4 = model.includes('gpt-4');
      
      const promptCost = isGPT4 
        ? (log.prompt_tokens || 0) * 0.03 / 1000
        : (log.prompt_tokens || 0) * 0.001 / 1000;
      
      const completionCost = isGPT4
        ? (log.completion_tokens || 0) * 0.06 / 1000
        : (log.completion_tokens || 0) * 0.002 / 1000;
      
      const totalCost = promptCost + completionCost;

      const key = groupBy === 'service' 
        ? 'openai'
        : groupBy === 'model'
        ? model
        : log.agent_id || 'unknown';

      if (!breakdown[key]) {
        breakdown[key] = {
          service: key,
          cost_type: 'llm',
          total_cost: 0,
          transaction_count: 0,
          avg_cost: 0,
        };
      }

      breakdown[key].total_cost += totalCost;
      breakdown[key].transaction_count += 1;
    });

    // Calculate averages
    Object.values(breakdown).forEach(item => {
      item.avg_cost = item.total_cost / item.transaction_count;
    });

    return Object.values(breakdown).sort((a, b) => b.total_cost - a.total_cost);
  };

  const calculateStats = (data: any[]): CostStats => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Calculate today's cost
    const todayCost = data
      .filter(log => new Date(log.created_at) >= oneDayAgo)
      .reduce((sum, log) => {
        const model = log.model || 'gpt-3.5-turbo';
        const isGPT4 = model.includes('gpt-4');
        const promptCost = isGPT4 
          ? (log.prompt_tokens || 0) * 0.03 / 1000
          : (log.prompt_tokens || 0) * 0.001 / 1000;
        const completionCost = isGPT4
          ? (log.completion_tokens || 0) * 0.06 / 1000
          : (log.completion_tokens || 0) * 0.002 / 1000;
        return sum + promptCost + completionCost;
      }, 0);

    // Calculate yesterday's cost
    const yesterdayCost = data
      .filter(log => {
        const date = new Date(log.created_at);
        return date >= twoDaysAgo && date < oneDayAgo;
      })
      .reduce((sum, log) => {
        const model = log.model || 'gpt-3.5-turbo';
        const isGPT4 = model.includes('gpt-4');
        const promptCost = isGPT4 
          ? (log.prompt_tokens || 0) * 0.03 / 1000
          : (log.prompt_tokens || 0) * 0.001 / 1000;
        const completionCost = isGPT4
          ? (log.completion_tokens || 0) * 0.06 / 1000
          : (log.completion_tokens || 0) * 0.002 / 1000;
        return sum + promptCost + completionCost;
      }, 0);

    const dailyBurnRate = todayCost;
    const monthlyProjection = dailyBurnRate * 30;
    const costChange = yesterdayCost > 0
      ? ((todayCost - yesterdayCost) / yesterdayCost) * 100
      : 0;

    // Total cost in period
    const totalCost = data.reduce((sum, log) => {
      const model = log.model || 'gpt-3.5-turbo';
      const isGPT4 = model.includes('gpt-4');
      const promptCost = isGPT4 
        ? (log.prompt_tokens || 0) * 0.03 / 1000
        : (log.prompt_tokens || 0) * 0.001 / 1000;
      const completionCost = isGPT4
        ? (log.completion_tokens || 0) * 0.06 / 1000
        : (log.completion_tokens || 0) * 0.002 / 1000;
      return sum + promptCost + completionCost;
    }, 0);

    return {
      totalCost,
      dailyBurnRate,
      monthlyProjection,
      costChange,
    };
  };

  const detectCostAlerts = (breakdown: CostBreakdown[], stats: CostStats): CostAlert[] => {
    const alerts: CostAlert[] = [];

    // Budget exceeded alert
    const monthlyBudget = 1000; // $1000 example budget
    if (stats.monthlyProjection > monthlyBudget) {
      alerts.push({
        id: 'budget-exceeded',
        type: 'budget_exceeded',
        severity: 'high',
        message: `Projected monthly cost ($${stats.monthlyProjection.toFixed(2)}) exceeds budget ($${monthlyBudget})`,
        amount: stats.monthlyProjection - monthlyBudget,
        timestamp: new Date().toISOString(),
      });
    }

    // Unusual spike alert
    if (Math.abs(stats.costChange) > 50) {
      alerts.push({
        id: 'unusual-spike',
        type: 'unusual_spike',
        severity: stats.costChange > 0 ? 'medium' : 'low',
        message: `Daily cost ${stats.costChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(stats.costChange).toFixed(1)}%`,
        amount: Math.abs(stats.costChange),
        timestamp: new Date().toISOString(),
      });
    }

    // Optimization opportunities
    breakdown.forEach(item => {
      if (item.avg_cost > 0.10) {
        alerts.push({
          id: `optimize-${item.service}`,
          type: 'optimization_opportunity',
          severity: 'low',
          message: `High average cost for ${item.service} ($${item.avg_cost.toFixed(4)}). Consider optimization.`,
          amount: item.avg_cost,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      high: { className: 'bg-red-100 text-red-800', icon: AlertCircle },
      medium: { className: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      low: { className: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    };

    const { className, icon: Icon } = config[severity as keyof typeof config] || config.low;

    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const exportCostData = () => {
    const csv = [
      ['Service', 'Cost Type', 'Total Cost', 'Transactions', 'Avg Cost'],
      ...costBreakdown.map(item => [
        item.service,
        item.cost_type,
        item.total_cost.toFixed(4),
        item.transaction_count.toString(),
        item.avg_cost.toFixed(6),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-analytics-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading cost analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cost Analytics & Optimization</h1>
          <p className="text-muted-foreground mt-1">
            Track spending, identify trends, and optimize costs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCostData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadCostData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Burn Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.dailyBurnRate.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {stats.costChange >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-rose-600" />
                  <span className="text-rose-600">+{stats.costChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">{stats.costChange.toFixed(1)}%</span>
                </>
              )}
              <span className="text-muted-foreground">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Projection</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyProjection.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current burn rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === 'high').length} high priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Cost Alerts & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getSeverityBadge(alert.severity)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger>
                <SelectValue placeholder="Group By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">By Service</SelectItem>
                <SelectItem value="model">By Model</SelectItem>
                <SelectItem value="agent">By Agent</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Set Budget
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service/Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Avg Cost</TableHead>
                <TableHead>% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costBreakdown.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No cost data available
                  </TableCell>
                </TableRow>
              ) : (
                costBreakdown.map((item, index) => {
                  const percentOfTotal = (item.total_cost / stats.totalCost) * 100;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.service}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.cost_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        ${item.total_cost.toFixed(4)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {item.transaction_count.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        ${item.avg_cost.toFixed(6)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{percentOfTotal.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentOfTotal} className="h-2" />
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
    </div>
  );
}


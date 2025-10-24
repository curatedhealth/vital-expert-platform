'use client';

import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Download,
  Activity
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PromptPerformanceMonitor from '@/lib/services/prompt-performance-monitor';

interface PromptPerformanceDashboardProps {
  className?: string;
}

interface PerformanceMetrics {
  prompt_id: string;
  usage_count: number;
  success_rate: number;
  average_rating: number;
  average_response_time: number;
  last_used: string | null;
  total_tokens_used: number;
  cost_per_query: number;
  user_satisfaction: number;
  error_rate: number;
  most_common_errors: string[];
  usage_by_agent: Record<string, number>;
  usage_by_domain: Record<string, number>;
  peak_usage_hours: number[];
  seasonal_trends: Record<string, number>;
}

export function PromptPerformanceDashboard({ className = '' }: PromptPerformanceDashboardProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'usage_count' | 'success_rate' | 'average_rating' | 'response_time'>('usage_count');
  const [activeTab, setActiveTab] = useState('overview');

  // Load performance data
  const loadPerformanceData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PromptPerformanceMonitor.getAllPromptsPerformance(timeRange);
      setPerformanceData(data);
      
      const dashboard = await PromptPerformanceMonitor.getDashboardData();
      setDashboardData(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when time range changes
  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  // Sort performance data
  const sortedData = [...performanceData].sort((a, b) => {
    switch (sortBy) {
      case 'usage_count':
        return b.usage_count - a.usage_count;
      case 'success_rate':
        return b.success_rate - a.success_rate;
      case 'average_rating':
        return b.average_rating - a.average_rating;
      case 'response_time':
        return a.average_response_time - b.average_response_time;
      default:
        return 0;
    }
  });

  // Get performance alerts
  const getPerformanceAlerts = () => {
    const alerts = [];
    
    performanceData.forEach(metrics => {
      if (metrics.error_rate > 20) {
        alerts.push({
          type: 'error_rate_high',
          prompt_id: metrics.prompt_id,
          message: `Error rate is ${metrics.error_rate.toFixed(1)}%`,
          severity: metrics.error_rate > 50 ? 'high' : 'medium'
        });
      }
      
      if (metrics.usage_count < 5) {
        alerts.push({
          type: 'low_usage',
          prompt_id: metrics.prompt_id,
          message: `Only ${metrics.usage_count} uses in the last ${timeRange}`,
          severity: 'low'
        });
      }
      
      if (metrics.average_rating > 0 && metrics.average_rating < 3) {
        alerts.push({
          type: 'poor_rating',
          prompt_id: metrics.prompt_id,
          message: `Average rating is ${metrics.average_rating.toFixed(1)}/5`,
          severity: 'medium'
        });
      }
      
      if (metrics.average_response_time > 5000) {
        alerts.push({
          type: 'slow_response',
          prompt_id: metrics.prompt_id,
          message: `Average response time is ${(metrics.average_response_time / 1000).toFixed(1)}s`,
          severity: 'medium'
        });
      }
    });
    
    return alerts;
  };

  const alerts = getPerformanceAlerts();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and analyze prompt performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadPerformanceData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active prompts in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.reduce((sum, p) => sum + p.usage_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Times used this {timeRange}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.length > 0 
                    ? (performanceData.reduce((sum, p) => sum + p.success_rate, 0) / performanceData.length).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData.length > 0 
                    ? (performanceData.reduce((sum, p) => sum + p.average_rating, 0) / performanceData.length).toFixed(1)
                    : 0}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  User satisfaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Prompts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Prompts</CardTitle>
              <CardDescription>
                Most used prompts this {timeRange}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedData.slice(0, 5).map((metrics, index) => (
                  <div key={metrics.prompt_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">Prompt {metrics.prompt_id.substring(0, 8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {metrics.usage_count} uses • {metrics.success_rate.toFixed(1)}% success
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {metrics.average_rating.toFixed(1)}/5 rating
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {metrics.average_response_time.toFixed(0)}ms avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium">Sort by</label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usage_count">Usage Count</SelectItem>
                      <SelectItem value="success_rate">Success Rate</SelectItem>
                      <SelectItem value="average_rating">Average Rating</SelectItem>
                      <SelectItem value="response_time">Response Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((metrics) => (
                    <TableRow key={metrics.prompt_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">Prompt {metrics.prompt_id.substring(0, 8)}</div>
                          <div className="text-sm text-muted-foreground">
                            Last used: {metrics.last_used ? new Date(metrics.last_used).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{metrics.usage_count}</div>
                        <div className="text-xs text-muted-foreground">
                          {metrics.total_tokens_used} tokens
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">{metrics.success_rate.toFixed(1)}%</div>
                          <Progress value={metrics.success_rate} className="w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{metrics.average_rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {metrics.average_response_time.toFixed(0)}ms
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          ${metrics.cost_per_query.toFixed(4)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            metrics.success_rate > 80 ? 'default' : 
                            metrics.success_rate > 60 ? 'secondary' : 'destructive'
                          }
                        >
                          {metrics.success_rate > 80 ? 'Excellent' : 
                           metrics.success_rate > 60 ? 'Good' : 'Needs Attention'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Usage Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>
                  Prompt usage over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>Usage trends chart will be implemented here</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>
                  Success rate distribution across prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Excellent (80%+)</span>
                    <span className="text-sm font-medium">
                      {performanceData.filter(p => p.success_rate >= 80).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Good (60-79%)</span>
                    <span className="text-sm font-medium">
                      {performanceData.filter(p => p.success_rate >= 60 && p.success_rate < 80).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Needs Attention (&lt;60%)</span>
                    <span className="text-sm font-medium">
                      {performanceData.filter(p => p.success_rate < 60).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
              <CardDescription>
                Issues and recommendations for prompt performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map((alert, index) => (
                    <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-muted-foreground">
                          Prompt {alert.prompt_id.substring(0, 8)} • {alert.type.replace('_', ' ')}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>No performance alerts at this time</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Performance Data</CardTitle>
              <CardDescription>
                Download performance metrics and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF Report
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Export includes all performance metrics, usage statistics, and trend data for the selected time range.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PromptPerformanceDashboard;

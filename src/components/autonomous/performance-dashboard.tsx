'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  MemoryStick, 
  Zap, 
  AlertCircle,
  RefreshCw,
  Settings
} from 'lucide-react';

interface PerformanceMetrics {
  totalCost: number;
  totalDuration: number;
  averageTaskDuration: number;
  memoryUsage: number;
  cacheHitRate: number;
  parallelExecutionRate: number;
  errorRate: number;
  throughput: number;
}

interface PerformanceReport {
  current: PerformanceMetrics;
  average: PerformanceMetrics;
  trends: {
    costTrend: number;
    speedTrend: number;
    memoryTrend: number;
  };
}

interface PerformanceDashboardProps {
  className?: string;
}

export function PerformanceDashboard({ className = '' }: PerformanceDashboardProps) {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/autonomous/performance?action=report');
      const data = await response.json();
      
      if (data.success) {
        setReport(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch performance data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const resetMetrics = async () => {
    try {
      const response = await fetch('/api/autonomous/performance?action=reset');
      const data = await response.json();
      
      if (data.success) {
        await fetchPerformanceData();
      } else {
        setError(data.error || 'Failed to reset metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading performance data...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-red-500">
              <AlertCircle className="w-6 h-6 mr-2" />
              Error: {error}
            </div>
            <Button onClick={fetchPerformanceData} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              No performance data available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics for autonomous agent system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchPerformanceData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={resetMetrics} variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${report.current.totalCost.toFixed(2)}</div>
            <div className={`flex items-center text-xs ${getTrendColor(report.trends.costTrend)}`}>
              {getTrendIcon(report.trends.costTrend)}
              <span className="ml-1">
                {report.trends.costTrend > 0 ? '+' : ''}{report.trends.costTrend.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.current.throughput.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">tasks/min</p>
            <div className={`flex items-center text-xs ${getTrendColor(report.trends.speedTrend)}`}>
              {getTrendIcon(report.trends.speedTrend)}
              <span className="ml-1">
                {report.trends.speedTrend > 0 ? '+' : ''}{report.trends.speedTrend.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(report.current.memoryUsage)}</div>
            <div className={`flex items-center text-xs ${getTrendColor(report.trends.memoryTrend)}`}>
              {getTrendIcon(report.trends.memoryTrend)}
              <span className="ml-1">
                {report.trends.memoryTrend > 0 ? '+' : ''}{report.trends.memoryTrend.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(report.current.averageTaskDuration)}</div>
            <p className="text-xs text-muted-foreground">per task</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Cache Hit Rate</span>
                <span>{report.current.cacheHitRate.toFixed(1)}%</span>
              </div>
              <Progress value={report.current.cacheHitRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Parallel Execution Rate</span>
                <span>{report.current.parallelExecutionRate.toFixed(1)}%</span>
              </div>
              <Progress value={report.current.parallelExecutionRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Error Rate</span>
                <span>{report.current.errorRate.toFixed(1)}%</span>
              </div>
              <Progress value={report.current.errorRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Comparison with Averages */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Cost vs Average</span>
              <Badge variant={report.current.totalCost < report.average.totalCost ? 'default' : 'destructive'}>
                {report.current.totalCost < report.average.totalCost ? 'Better' : 'Worse'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Speed vs Average</span>
              <Badge variant={report.current.throughput > report.average.throughput ? 'default' : 'destructive'}>
                {report.current.throughput > report.average.throughput ? 'Faster' : 'Slower'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Memory vs Average</span>
              <Badge variant={report.current.memoryUsage < report.average.memoryUsage ? 'default' : 'destructive'}>
                {report.current.memoryUsage < report.average.memoryUsage ? 'Lower' : 'Higher'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {report.current.cacheHitRate < 50 && (
              <div className="flex items-center text-yellow-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Low cache hit rate - consider enabling more caching
              </div>
            )}
            {report.current.parallelExecutionRate < 30 && (
              <div className="flex items-center text-yellow-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Low parallel execution - consider increasing concurrent tasks
              </div>
            )}
            {report.current.errorRate > 10 && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                High error rate - check task dependencies and resource limits
              </div>
            )}
            {report.current.memoryUsage > 100 * 1024 * 1024 && (
              <div className="flex items-center text-yellow-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                High memory usage - consider enabling memory optimization
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import {
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Calendar,
  Server
} from 'lucide-react';
import React, { useState } from 'react';

import { Alert, AlertDescription } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Progress } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { useUsageMetrics, useCostBreakdown } from '@/hooks/useUsageData';

interface UsageAnalyticsDashboardProps {
  className?: string;
}

export const UsageAnalyticsDashboard: React.FC<UsageAnalyticsDashboardProps> = ({
  className
}) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
    refresh: refreshMetrics
  } = useUsageMetrics();

  const {
    data: costData,
    loading: costLoading,
    error: costError,
    refresh: refreshCost
  } = useCostBreakdown(dateRange.start, dateRange.end);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (metricsError || costError) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertDescription>
          Error loading usage data: {metricsError || costError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usage Analytics</h1>
          <p className="text-gray-600 mt-1">
            Real-time LLM usage tracking and cost monitoring
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshMetrics();
              refreshCost();
            }}
            disabled={metricsLoading || costLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(metricsLoading || costLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : metrics?.activeProviders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Providers handling requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : formatNumber(metrics?.totalRequestsToday || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total API calls made today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : formatCurrency(metrics?.totalCostToday || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total spend across all providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : `${metrics?.averageLatency || 0}ms`}
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : `${Math.round(metrics?.successRate || 0)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful requests today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">By Provider</TabsTrigger>
          <TabsTrigger value="models">By Model</TabsTrigger>
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total Usage Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Summary (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {costLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                ) : costData ? (
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(costData.total_cost)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Tokens</p>
                        <p className="font-semibold">{formatNumber(costData.total_tokens)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Requests</p>
                        <p className="font-semibold">{formatNumber(costData.total_requests)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No usage data available</p>
                )}
              </CardContent>
            </Card>

            {/* Cost Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cost Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                {costLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                ) : costData && costData.total_requests > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Cost per Request</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(costData.total_cost / costData.total_requests)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost per 1K Tokens</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency((costData.total_cost / costData.total_tokens) * 1000)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No efficiency data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Provider</CardTitle>
            </CardHeader>
            <CardContent>
              {costLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : costData?.by_provider && costData.by_provider.length > 0 ? (
                <div className="space-y-4">
                  {costData.by_provider.map((provider, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{provider.provider_name}</span>
                        <div className="text-right">
                          <span className="font-bold">{formatCurrency(provider.cost)}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({provider.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={provider.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No provider data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Model</CardTitle>
            </CardHeader>
            <CardContent>
              {costLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : costData?.by_model && costData.by_model.length > 0 ? (
                <div className="space-y-4">
                  {costData.by_model.map((model, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{model.model}</span>
                        <div className="text-right">
                          <span className="font-bold">{formatCurrency(model.cost)}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({model.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={model.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No model data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {costLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : costData?.daily && costData.daily.length > 0 ? (
                <div className="space-y-2">
                  {costData.daily.slice(-7).map((day, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-bold">{formatCurrency(day.cost)}</div>
                        <div className="text-xs text-gray-600">
                          {formatNumber(day.requests)} requests • {formatNumber(day.tokens)} tokens
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No daily data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
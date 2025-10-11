'use client';

import { DollarSign, TrendingUp, AlertTriangle, Users, BarChart3, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { costAnalyticsService, CostOverview } from '@/services/cost-analytics.service';

import { BudgetManager } from './BudgetManager';
import { CostAllocation } from './CostAllocation';
import { CostAnomalies } from './CostAnomalies';
import { CostByTenant } from './CostByTenant';
import { UsageForecast } from './UsageForecast';



export function CostDashboard() {
  const [overview, setOverview] = useState<CostOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    try {
      const data = await costAnalyticsService.getCostOverview();
      setOverview(data);
    } catch (error) {
      console.error('Error fetching cost overview:', error);
      toast.error('Failed to load cost overview');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load cost data</p>
        <Button onClick={handleRefresh} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.currentDailyCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {overview.requestsToday} requests today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Projection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.monthlyProjection.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Based on current usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.budgetUsed.toFixed(1)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  overview.budgetUsed > 90 ? 'bg-red-500' : 
                  overview.budgetUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(overview.budgetUsed, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {overview.cacheHitRate.toFixed(1)}% cache hit rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {overview.budgetUsed > 80 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Budget Alert: {overview.budgetUsed.toFixed(1)}% of daily budget used
                </p>
                <p className="text-sm text-yellow-700">
                  Consider implementing cost controls or reviewing usage patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Models */}
      <Card>
        <CardHeader>
          <CardTitle>Top Models by Cost</CardTitle>
          <CardDescription>Most expensive models used today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview.topModels.map((model, index) => (
              <div key={model.model} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{model.model}</p>
                    <p className="text-sm text-gray-500">{model.requests} requests</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${model.cost.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{model.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">By Tenant</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
              ) : (
                'Refresh'
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Average Latency</span>
                  <span className="text-sm">{overview.averageLatency.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cache Hit Rate</span>
                  <span className="text-sm">{overview.cacheHitRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-sm">{overview.errorRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly Cost Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overview.hourlyData.slice(-6).map((hour, index) => (
                    <div key={hour.hour} className="flex items-center justify-between">
                      <span className="text-sm">{hour.hour}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min((hour.cost / Math.max(...overview.hourlyData.map(h => h.cost))) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">${hour.cost.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenants">
          <CostByTenant />
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetManager />
        </TabsContent>

        <TabsContent value="anomalies">
          <CostAnomalies />
        </TabsContent>

        <TabsContent value="forecast">
          <UsageForecast />
        </TabsContent>

        <TabsContent value="allocation">
          <CostAllocation />
        </TabsContent>
      </Tabs>
    </div>
  );
}

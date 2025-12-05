'use client';

import {
  DollarSign,
  Activity,
  Zap,
  TrendingUp,
  RefreshCw,
  Calendar,
  Brain,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Progress } from '@vital/ui';

interface OpenAICurrentUsage {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  byModel: Record<string, { tokens: number; cost: number; requests: number }>;
}

interface OpenAIBilling {
  object: string;
  has_payment_method: boolean;
  soft_limit_usd: number;
  hard_limit_usd: number;
  system_hard_limit_usd: number;
  access_until: number;
}

interface ConnectivityTest {
  success: boolean;
  message: string;
  latency?: number;
}

export const OpenAIUsageDashboard: React.FC = () => {
  const [currentUsage, setCurrentUsage] = useState<OpenAICurrentUsage | null>(null);
  const [billingInfo, setBillingInfo] = useState<OpenAIBilling | null>(null);
  const [connectivity, setConnectivity] = useState<ConnectivityTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);

      // Fetch current usage
      const usageResponse = await fetch('/api/llm/providers/openai/usage?action=current');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setCurrentUsage(usageData);
      } else {
        throw new Error(`Usage fetch failed: ${usageResponse.status}`);
      }

      // Fetch billing info (optional, may not be available via API key)
      try {
        const billingResponse = await fetch('/api/llm/providers/openai/usage?action=billing');
        if (billingResponse.ok) {
          const billingData = await billingResponse.json();
          if (billingData && !billingData.error) {
            setBillingInfo(billingData);
          }
        }
      } catch (error) {
        console.warn('Billing data not available via API key');
      }

      // Test connectivity
      const connectivityResponse = await fetch('/api/llm/providers/openai/usage?action=test');
      if (connectivityResponse.ok) {
        const connectivityData = await connectivityResponse.json();
        setConnectivity(connectivityData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch OpenAI data';
      setError(errorMessage);
      console.error('Error fetching OpenAI data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">OpenAI Usage Dashboard</h2>
            <p className="text-neutral-600">Loading real-time usage data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i: any) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">OpenAI Usage Dashboard</h2>
            <p className="text-neutral-600">Real-time usage and billing information</p>
          </div>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error loading OpenAI data:</strong> {error}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      </div>
    );
  }

  const usagePercentage = billingInfo ?
    Math.min((currentUsage?.totalCost || 0) / billingInfo.soft_limit_usd * 100, 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">OpenAI Usage Dashboard</h2>
            <p className="text-neutral-600">Real-time usage and billing information</p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Connectivity Status */}
      {connectivity && (
        <Alert className={connectivity.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {connectivity.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={connectivity.success ? 'text-green-800' : 'text-red-800'}>
            <strong>API Status:</strong> {connectivity.message}
            {connectivity.latency && ` (${connectivity.latency}ms)`}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(currentUsage?.totalCost || 0)}
            </div>
            {billingInfo && (
              <p className="text-xs text-muted-foreground">
                of {formatCurrency(billingInfo.soft_limit_usd)} limit
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(currentUsage?.totalTokens || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tokens processed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(currentUsage?.totalRequests || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total API calls made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Cost/Request</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentUsage && currentUsage.totalRequests > 0
                ? formatCurrency(currentUsage.totalCost / currentUsage.totalRequests)
                : '$0.0000'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Cost efficiency metric
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      {billingInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Monthly Usage</span>
                <span className="text-sm text-neutral-600">
                  {formatCurrency(currentUsage?.totalCost || 0)} / {formatCurrency(billingInfo.soft_limit_usd)}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {usagePercentage.toFixed(1)}% of soft limit used
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-600">Hard Limit</p>
                <p className="font-semibold">{formatCurrency(billingInfo.hard_limit_usd)}</p>
              </div>
              <div>
                <p className="text-neutral-600">Payment Method</p>
                <Badge variant={billingInfo.has_payment_method ? 'default' : 'destructive'}>
                  {billingInfo.has_payment_method ? 'Active' : 'Not Set'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage by Model */}
      {currentUsage && Object.keys(currentUsage.byModel).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Usage by Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(currentUsage.byModel)
                .sort(([,a], [,b]) => b.cost - a.cost)
                .map(([model, data]) => (
                <div key={model} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{model}</span>
                    <div className="text-right">
                      <span className="font-bold">{formatCurrency(data.cost)}</span>
                      <span className="text-sm text-neutral-600 ml-2">
                        ({formatNumber(data.requests)} requests)
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-600">
                    {formatNumber(data.tokens)} tokens processed
                  </div>
                  <Progress
                    value={(data.cost / (currentUsage.totalCost || 1)) * 100}
                    className="h-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-neutral-500 text-center">
        <Calendar className="h-3 w-3 inline mr-1" />
        Data refreshed: {new Date().toLocaleString()}
      </div>
    </div>
  );
};
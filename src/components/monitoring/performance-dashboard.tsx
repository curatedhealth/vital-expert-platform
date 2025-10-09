'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface SystemStatus {
  redis: 'connected' | 'disconnected' | 'unknown';
  supabase: 'connected' | 'disconnected' | 'unknown';
  langsmith: 'enabled' | 'disabled' | 'unknown';
  openai: 'connected' | 'disconnected' | 'unknown';
  lastUpdate: string;
}

interface PerformanceMetrics {
  avgResponseTime: number;
  totalRequests: number;
  errorRate: number;
  cacheHitRate: number;
  activeSessions: number;
}

export function PerformanceDashboard() {
  const [status, setStatus] = useState<SystemStatus>({
    redis: 'unknown',
    supabase: 'unknown',
    langsmith: 'unknown',
    openai: 'unknown',
    lastUpdate: new Date().toISOString()
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    avgResponseTime: 0,
    totalRequests: 0,
    errorRate: 0,
    cacheHitRate: 0,
    activeSessions: 0
  });

  const [loading, setLoading] = useState(true);

  const checkSystemStatus = async () => {
    try {
      setLoading(true);
      
      // Check Redis status
      const redisStatus = process.env.UPSTASH_REDIS_REST_URL ? 'connected' : 'disconnected';
      
      // Check Supabase status
      const supabaseStatus = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'connected' : 'disconnected';
      
      // Check LangSmith status
      const langsmithStatus = process.env.LANGCHAIN_TRACING_V2 === 'true' ? 'enabled' : 'disabled';
      
      // Check OpenAI status
      const openaiStatus = process.env.OPENAI_API_KEY ? 'connected' : 'disconnected';

      setStatus({
        redis: redisStatus,
        supabase: supabaseStatus,
        langsmith: langsmithStatus,
        openai: openaiStatus,
        lastUpdate: new Date().toISOString()
      });

      // Fetch performance metrics
      try {
        const response = await fetch('/api/monitoring/performance');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.warn('Failed to fetch performance metrics:', error);
      }

    } catch (error) {
      console.error('Failed to check system status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'enabled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
      case 'disabled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'enabled':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
      case 'disabled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Performance Dashboard</h2>
        <Button 
          onClick={checkSystemStatus} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
            {getStatusIcon(status.redis)}
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(status.redis)}>
              {status.redis}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {status.redis === 'connected' ? 'Caching enabled' : 'Caching disabled'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supabase</CardTitle>
            {getStatusIcon(status.supabase)}
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(status.supabase)}>
              {status.supabase}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Database connection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LangSmith</CardTitle>
            {getStatusIcon(status.langsmith)}
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(status.langsmith)}>
              {status.langsmith}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              AI monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OpenAI</CardTitle>
            {getStatusIcon(status.openai)}
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(status.openai)}>
              {status.openai}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              AI provider
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              API response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Failed requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Cache efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Current users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://console.upstash.com/', '_blank')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Setup Redis
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://smith.langchain.com/', '_blank')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Setup LangSmith
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              <Database className="h-4 w-4 mr-2" />
              Supabase Dashboard
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(status.lastUpdate).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

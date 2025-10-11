'use client';

import { 
  BarChart3, 
  Eye, 
  Globe, 
  Smartphone, 
  Monitor, 
  ExternalLink,
  TrendingUp,
  MapPin,
  Browser
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VercelAnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueVisitors: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserBreakdown: Array<{
    browser: string;
    percentage: number;
  }>;
  geographicData: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
  realTimeVisitors: number;
  lastUpdated: string;
}

interface VercelAnalyticsDashboardProps {
  className?: string;
}

export function VercelAnalyticsDashboard({ className = '' }: VercelAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<VercelAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Mock data for demonstration - in production, this would fetch from Vercel Analytics API
  const mockAnalyticsData: VercelAnalyticsData = {
    pageViews: 1247,
    uniqueVisitors: 892,
    bounceRate: 34.2,
    avgSessionDuration: 3.2,
    topPages: [
      { path: '/', views: 456, uniqueVisitors: 312 },
      { path: '/dashboard', views: 234, uniqueVisitors: 189 },
      { path: '/ask-expert', views: 198, uniqueVisitors: 156 },
      { path: '/agents', views: 156, uniqueVisitors: 134 },
      { path: '/knowledge', views: 98, uniqueVisitors: 78 },
    ],
    trafficSources: [
      { source: 'Direct', visitors: 456, percentage: 51.1 },
      { source: 'Google', visitors: 234, percentage: 26.2 },
      { source: 'LinkedIn', visitors: 123, percentage: 13.8 },
      { source: 'Twitter', visitors: 56, percentage: 6.3 },
      { source: 'Other', visitors: 23, percentage: 2.6 },
    ],
    deviceBreakdown: {
      desktop: 68.4,
      mobile: 28.7,
      tablet: 2.9,
    },
    browserBreakdown: [
      { browser: 'Chrome', percentage: 45.2 },
      { browser: 'Safari', percentage: 28.7 },
      { browser: 'Firefox', percentage: 12.3 },
      { browser: 'Edge', percentage: 8.9 },
      { browser: 'Other', percentage: 4.9 },
    ],
    geographicData: [
      { country: 'United States', visitors: 456, percentage: 51.1 },
      { country: 'Canada', visitors: 123, percentage: 13.8 },
      { country: 'United Kingdom', visitors: 89, percentage: 10.0 },
      { country: 'Germany', visitors: 67, percentage: 7.5 },
      { country: 'Australia', visitors: 45, percentage: 5.0 },
      { country: 'Other', visitors: 112, percentage: 12.6 },
    ],
    realTimeVisitors: 12,
    lastUpdated: new Date().toISOString(),
  };

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In production, this would make an API call to fetch real Vercel Analytics data
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setAnalyticsData(mockAnalyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange]);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <Badge className="bg-green-100 text-green-800">Good</Badge>;
    if (value >= thresholds.warning) return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vercel Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading analytics data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vercel Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Vercel Analytics
            </CardTitle>
            <div className="flex items-center gap-2">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://vercel.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  View in Vercel
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.pageViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Page Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analyticsData.uniqueVisitors.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Unique Visitors</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStatusColor(analyticsData.bounceRate, { good: 30, warning: 50 })}`}>
                {analyticsData.bounceRate}%
              </div>
              <div className="text-sm text-gray-600">Bounce Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analyticsData.avgSessionDuration}m</div>
              <div className="text-sm text-gray-600">Avg Session</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Real-time Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">{analyticsData.realTimeVisitors} visitors online</span>
              </div>
              <div className="text-sm text-gray-600">
                Last updated: {new Date(analyticsData.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
            {getStatusBadge(analyticsData.bounceRate, { good: 30, warning: 50 })}
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Top Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.topPages.map((page, index) => (
              <div key={page.path} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <span className="font-mono text-sm">{page.path}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{page.views} views</span>
                  <span>{page.uniqueVisitors} unique</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Traffic Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.trafficSources.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <span className="font-medium">{source.source}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {source.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device & Browser Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>Desktop</span>
                </div>
                <span className="font-medium">{analyticsData.deviceBreakdown.desktop}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile</span>
                </div>
                <span className="font-medium">{analyticsData.deviceBreakdown.mobile}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>Tablet</span>
                </div>
                <span className="font-medium">{analyticsData.deviceBreakdown.tablet}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Browser className="h-5 w-5" />
              Browser Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.browserBreakdown.map((browser) => (
                <div key={browser.browser} className="flex items-center justify-between">
                  <span>{browser.browser}</span>
                  <span className="font-medium">{browser.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.geographicData.map((country) => (
              <div key={country.country} className="flex items-center justify-between">
                <span className="font-medium">{country.country}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {country.visitors} ({country.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

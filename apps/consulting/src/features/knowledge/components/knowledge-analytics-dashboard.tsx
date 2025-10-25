'use client';

import {
  Database,
  FileText,
  Brain,
  BarChart3,
  TrendingUp,
  Upload,
  Users,
  Shield,
  Stethoscope,
  FlaskConical,
  CreditCard,
  Monitor,
  Clock,
  HardDrive,
  Activity,
  Zap,
  Eye,
  Globe,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

import { Badge } from '@vital/ui/components/badge';
import { Button } from '@vital/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@vital/ui/components/dropdown-menu';
import { Separator } from '@vital/ui/components/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@vital/ui/components/table';

// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@vital/ui/components/tooltip';

interface AnalyticsData {
  ragCategories: {
    clinical: { documents: number; chunks: number; size: number };
    regulatory: { documents: number; chunks: number; size: number };
    research: { documents: number; chunks: number; size: number };
    reimbursement: { documents: number; chunks: number; size: number };
    technology: { documents: number; chunks: number; size: number };
    other: { documents: number; chunks: number; size: number };
  };
  agentStats: Record<string, {
    documents: number;
    chunks: number;
    domains: string[];
  }>;
  contentStats: {
    totalDocuments: number;
    totalChunks: number;
    totalSize: number;
    avgDocumentSize: number;
    avgChunksPerDocument: number;
    avgChunkQuality: number;
    domains: string[];
    categories: string[];
    filteredBy?: {
      category?: string;
      agent?: string;
    };
  };
  recentActivity: {
    todayUploads: number;
    last24hUploads: number;
    last7dUploads: number;
    timeSeriesData: Array<{
      date: string;
      uploads: number;
      chunks: number;
      day: number;
      month: string;
    }>;
    recentDocuments: Array<{
      id: string;
      name: string;
      title?: string;
      size: number;
      chunks: number;
      uploadedAt: string;
      category?: string;
      domain?: string;
      status?: string;
    }>;
  };
  documents?: Array<{
    id: string;
    name: string;
    title?: string;
    description?: string;
    size: number;
    chunks: number;
    uploadedAt: string;
    category?: string;
    domain?: string;
    status?: string;
    tags?: string[];
    file_type?: string;
    url?: string;
    is_public?: boolean;
  }>;
}

const ragCategoryIcons = {
  clinical: Stethoscope,
  regulatory: Shield,
  research: FlaskConical,
  reimbursement: CreditCard,
  technology: Monitor,
  other: FileText
};

const ragCategoryColors = {
  clinical: 'text-green-600 bg-green-100',
  regulatory: 'text-blue-600 bg-blue-100',
  research: 'text-purple-600 bg-purple-100',
  reimbursement: 'text-orange-600 bg-orange-100',
  technology: 'text-indigo-600 bg-indigo-100',
  other: 'text-gray-600 bg-gray-100'
};

const CHART_COLORS = {
  clinical: 'hsl(var(--chart-2))',
  regulatory: 'hsl(var(--chart-1))',
  research: 'hsl(var(--chart-3))',
  reimbursement: 'hsl(var(--chart-4))',
  technology: 'hsl(var(--chart-5))',
  other: 'hsl(var(--muted-foreground))'
};

const getChartData = (ragCategories: unknown) => {
  return Object.entries(ragCategories).map(([category, stats]: [string, any]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    documents: stats.documents,
    chunks: stats.chunks,
    size: stats.size,
    color: CHART_COLORS[category as keyof typeof CHART_COLORS]
  })).filter(item => item.documents > 0);
};

interface KnowledgeAnalyticsDashboardProps {
  categoryFilter?: string;
  agentFilter?: string;
}

export function KnowledgeAnalyticsDashboard({
  categoryFilter,
  agentFilter
}: KnowledgeAnalyticsDashboardProps = { /* TODO: implement */ }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [categoryFilter, agentFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Build URL with filters
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (agentFilter) params.append('agent', agentFilter);

      const url = `/api/knowledge/analytics${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError('Error fetching analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // eslint-disable-next-line security/detect-object-injection
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-700">Error loading analytics: {error}</p>
          <button onClick={fetchAnalytics} className="mt-2 text-red-600 underline">
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  const chartData = getChartData(analytics.ragCategories);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Knowledge Analytics</h2>
            {(categoryFilter || agentFilter) && (
              <div className="flex items-center gap-2">
                {categoryFilter && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Category
                  </Badge>
                )}
                {agentFilter && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {agentFilter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Agent
                  </Badge>
                )}
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            {(categoryFilter || agentFilter)
              ? 'Filtered view of your knowledge base performance'
              : 'Overview of your knowledge base and RAG system performance'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="ml-2">
            <Activity className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Documents</p>
                  <p className="text-3xl font-bold text-blue-900">{analytics.contentStats.totalDocuments}</p>
                  <p className="text-xs text-blue-700 mt-1">+{analytics.recentActivity.last7dUploads} this week</p>
                </div>
                <div className="relative">
                  <Database className="w-10 h-10 text-blue-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Knowledge Chunks</p>
                  <p className="text-3xl font-bold text-green-900">{analytics.contentStats.totalChunks}</p>
                  <p className="text-xs text-green-700 mt-1">Avg {Math.round(analytics.contentStats.avgChunksPerDocument)}/doc</p>
                </div>
                <div className="relative">
                  <Brain className="w-10 h-10 text-green-500" />
                  <Zap className="w-4 h-4 text-green-600 absolute -top-1 -right-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Size</p>
                  <p className="text-3xl font-bold text-purple-900">{formatBytes(analytics.contentStats.totalSize)}</p>
                  <p className="text-xs text-purple-700 mt-1">Avg {formatBytes(analytics.contentStats.avgDocumentSize)}/doc</p>
                </div>
                <div className="relative">
                  <HardDrive className="w-10 h-10 text-purple-500" />
                  <Activity className="w-4 h-4 text-purple-600 absolute -top-1 -right-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Today's Uploads</p>
                  <p className="text-3xl font-bold text-orange-900">{analytics.recentActivity.todayUploads}</p>
                  <p className="text-xs text-orange-700 mt-1">{analytics.recentActivity.last24hUploads} in 24h</p>
                </div>
                <div className="relative">
                  <Upload className="w-10 h-10 text-orange-500" />
                  {analytics.recentActivity.todayUploads > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Series Chart */}
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Upload Trends (Last 30 Days)
                <Badge variant="secondary" className="ml-2">Time Series</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.recentActivity.timeSeriesData}>
                    <defs>
                      <linearGradient id="uploadsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="chunksGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="day"
                      fontSize={12}
                      tickFormatter={(value, index) => {
                        // eslint-disable-next-line security/detect-object-injection
                        const dataPoint = analytics.recentActivity.timeSeriesData[index];
                        return dataPoint ? `${dataPoint.month} ${value}` : value;
                      }}
                    />
                    <YAxis fontSize={12} />
                    <Area
                      type="monotone"
                      dataKey="uploads"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      fill="url(#uploadsGradient)"
                      name="Documents"
                    />
                    <Area
                      type="monotone"
                      dataKey="chunks"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      fill="url(#chunksGradient)"
                      name="Chunks"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span>Documents Uploaded</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span>Knowledge Chunks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* RAG Categories Chart */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Knowledge Distribution by Category
                <Badge variant="secondary" className="ml-2">Live Data</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Bar
                      dataKey="chunks"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Most Active Category</p>
                  <p className="font-semibold">
                    {chartData.length > 0 ? chartData.reduce((prev, current) =>
                      (prev.chunks > current.chunks) ? prev : current
                    ).name : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Categories</p>
                  <p className="font-semibold">{chartData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart for Document Distribution */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Document Distribution
                <Badge variant="outline" className="ml-2">
                  <Eye className="w-3 h-3 mr-1" />
                  Overview
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="documents"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                {chartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="capitalize">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.documents} docs</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RAG Categories and Agent Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Enhanced RAG Categories */}
          <Card className="col-span-4 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Knowledge by Category
                <Badge variant="outline" className="ml-2">{Object.keys(analytics.ragCategories).filter(key => analytics.ragCategories[key as keyof typeof analytics.ragCategories].documents > 0).length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analytics.ragCategories).map(([category, stats]) => {
                const Icon = ragCategoryIcons[category as keyof typeof ragCategoryIcons];
                const colorClass = ragCategoryColors[category as keyof typeof ragCategoryColors];

                if (stats.documents === 0) return null;

                return (
                  <div key={category} className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${colorClass} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{category}</p>
                        <p className="text-sm text-gray-600">{stats.documents} docs • {formatBytes(stats.size)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{stats.chunks}</p>
                      <p className="text-xs text-gray-500">chunks</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Enhanced Agent Statistics */}
          <Card className="col-span-3 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Agent Knowledge Access
                <Badge variant="secondary" className="ml-2">{Object.keys(analytics.agentStats).length} Agents</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analytics.agentStats).map(([agent, stats]) => (
                <div key={agent} className="group flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100 group-hover:bg-green-200 group-hover:scale-110 transition-all duration-200">
                      <Brain className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{agent}</p>
                      <p className="text-sm text-gray-600">{stats.domains.join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{stats.documents} docs</p>
                    <p className="text-xs text-gray-500">{stats.chunks} chunks</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Content Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Recent Activity */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Activity
                <Badge variant="outline" className="ml-2">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:scale-105 transition-transform duration-200">
                  <p className="text-2xl font-bold text-blue-600">{analytics.recentActivity.todayUploads}</p>
                  <p className="text-xs text-blue-600">Today</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:scale-105 transition-transform duration-200">
                  <p className="text-2xl font-bold text-green-600">{analytics.recentActivity.last24hUploads}</p>
                  <p className="text-xs text-green-600">24 Hours</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:scale-105 transition-transform duration-200">
                  <p className="text-2xl font-bold text-purple-600">{analytics.recentActivity.last7dUploads}</p>
                  <p className="text-xs text-purple-600">7 Days</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Recent Documents</h4>
                  <Badge variant="secondary" className="text-xs">
                    {analytics.recentActivity.recentDocuments.length} items
                  </Badge>
                </div>
                {analytics.recentActivity.recentDocuments.map((doc) => (
                  <div key={doc.id} className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-blue-600 transition-colors">{doc.name}</p>
                        <p className="text-sm text-gray-600">{formatBytes(doc.size)} • {doc.chunks} chunks</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2 group-hover:border-gray-400 transition-colors">
                      {formatTimeAgo(doc.uploadedAt)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Content Quality Stats */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Content Quality Analytics
                <Badge variant="secondary" className="ml-2">
                  {(analytics.contentStats.avgChunkQuality * 100).toFixed(0)}% Quality
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:scale-105 transition-transform duration-200">
                  <p className="text-xl font-bold text-blue-600">{formatBytes(analytics.contentStats.avgDocumentSize)}</p>
                  <p className="text-xs text-blue-600">Avg Doc Size</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:scale-105 transition-transform duration-200">
                  <p className="text-xl font-bold text-green-600">{Math.round(analytics.contentStats.avgChunksPerDocument)}</p>
                  <p className="text-xs text-green-600">Avg Chunks/Doc</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Content Quality Score
                  </span>
                  <span className="font-bold text-lg">{(analytics.contentStats.avgChunkQuality * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${analytics.contentStats.avgChunkQuality * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">Based on semantic coherence and chunk optimization</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Knowledge Domains
                  </h4>
                  <Badge variant="outline">{analytics.contentStats.domains.length} domains</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analytics.contentStats.domains.map((domain) => (
                    <Badge key={domain} variant="outline" className="capitalize hover:bg-gray-100 transition-colors">
                      {domain.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtered Documents Table */}
        {(categoryFilter || agentFilter) && analytics.documents && analytics.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Filtered Documents
                <Badge variant="outline" className="ml-2">
                  {analytics.documents.length} documents
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Chunks</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{doc.title || doc.name}</div>
                            {doc.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {doc.description}
                              </div>
                            )}
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {doc.tags.slice(0, 2).map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{doc.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={doc.status === 'processed' ? 'default' : 'secondary'}
                            className={
                              doc.status === 'processed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {doc.status || 'processed'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{doc.domain || 'General'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">{formatBytes(doc.size)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{doc.chunks}</span>
                            <span className="text-xs text-muted-foreground">chunks</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              {doc.url && (
                                <DropdownMenuItem>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open Link
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
'use client';

import { 
  TrendingUp, 
  Star, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Download,
  Plus,
  Edit,
  Copy,
  Trash2,
  Search,
  Database,
  LineChart
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Progress } from '@vital/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { Textarea } from '@vital/ui';
import usePromptEnhancement from '@/hooks/usePromptEnhancement';
import { PromptStarter } from '@/lib/services/prompt-enhancement-service';
import PromptPerformanceMonitor from '@/lib/services/prompt-performance-monitor';

interface EnhancedPromptAdminDashboardProps {
  className?: string;
}

export function EnhancedPromptAdminDashboard({ className = '' }: EnhancedPromptAdminDashboardProps) {
  const {
    prompts,
    isLoading,
    error,
    loadPrompts,
    createPrompt,
    updatePrompt,
    duplicatePrompt
  } = usePromptEnhancement();

  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterComplexity, setFilterComplexity] = useState('all');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [sortBy, setSortBy] = useState<'usage_count' | 'success_rate' | 'average_rating' | 'response_time'>('usage_count');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptStarter | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load performance data
  const loadPerformanceData = async () => {
    try {
      const data = await PromptPerformanceMonitor.getAllPromptsPerformance(timeRange);
      setPerformanceData(data);
      
      const dashboard = await PromptPerformanceMonitor.getDashboardData();
      setDashboardMetrics(dashboard);
    } catch (err) {
      console.error('Failed to load performance data:', err);
    }
  };

  // Load data on mount and when time range changes
  useEffect(() => {
    loadPrompts();
    loadPerformanceData();
  }, [timeRange]);

  // Filter prompts based on search and filters
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'all' || prompt.domain === filterDomain;
    const matchesComplexity = filterComplexity === 'all' || prompt.complexity_level === filterComplexity;
    
    return matchesSearch && matchesDomain && matchesComplexity;
  });

  // Get unique domains and complexity levels for filters
  const domains = [...new Set(prompts.map(p => p.domain))];
  const complexityLevels = [...new Set(prompts.map(p => p.complexity_level))];

  // Get performance metrics for a specific prompt
  const getPromptMetrics = (promptId: string) => {
    return performanceData.find(p => p.prompt_id === promptId) || {
      usage_count: 0,
      success_rate: 0,
      average_rating: 0,
      average_response_time: 0,
      total_tokens_used: 0,
      cost_per_query: 0,
      error_rate: 0
    };
  };

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

  // Sort performance data
  const sortedPerformanceData = [...performanceData].sort((a, b) => {
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

  const handleCreatePrompt = async (promptData: Partial<PromptStarter>) => {
    const result = await createPrompt(promptData);
    if (result) {
      setIsCreateDialogOpen(false);
      setSelectedPrompt(null);
    }
  };

  const handleUpdatePrompt = async (promptId: string, updates: Partial<PromptStarter>) => {
    const result = await updatePrompt(promptId, updates);
    if (result) {
      setIsEditDialogOpen(false);
      setSelectedPrompt(null);
    }
  };

  const handleDuplicatePrompt = async (prompt: PromptStarter) => {
    const newName = `${prompt.name}-copy-${Date.now()}`;
    await duplicatePrompt(prompt.id, newName);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Prompt Management & Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive prompt management with real-time performance tracking
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
          <Button onClick={() => { loadPrompts(); loadPerformanceData(); }} disabled={isLoading} variant="outline">
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{prompts.length}</div>
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

          {/* Performance Overview */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Prompts</CardTitle>
                <CardDescription>
                  Most used prompts this {timeRange}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedPerformanceData.slice(0, 5).map((metrics, index) => (
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

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>
                  Performance issues and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.slice(0, 3).map((alert, index) => (
                    <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-muted-foreground">
                          Prompt {alert.prompt_id.substring(0, 8)} • {alert.type.replace('_', ' ')}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No alerts at this time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          {/* Prompt Management Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Prompt Management</h3>
              <p className="text-muted-foreground">
                Create, edit, and manage PRISM prompts
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Prompt
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search prompts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterDomain} onValueChange={setFilterDomain}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {domains.map(domain => (
                      <SelectItem key={domain} value={domain}>
                        {domain.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterComplexity} onValueChange={setFilterComplexity}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {complexityLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Prompts Table with Performance Data */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Complexity</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrompts.map((prompt) => {
                    const metrics = getPromptMetrics(prompt.id);
                    return (
                      <TableRow key={prompt.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{prompt.display_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {prompt.description.substring(0, 60)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {prompt.domain.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {prompt.complexity_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{metrics.usage_count}</div>
                            <div className="text-muted-foreground">
                              {metrics.total_tokens_used} tokens
                            </div>
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPrompt(prompt);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicatePrompt(prompt)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => console.log('Delete prompt:', prompt.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                  {sortedPerformanceData.map((metrics) => (
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
                  <LineChart className="h-12 w-12 mx-auto mb-4" />
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

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prompt System Settings</CardTitle>
              <CardDescription>
                Configure prompt system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Default Time Range</label>
                    <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Last Day</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Default Sort</label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
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
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Additional settings and configuration options will be available here.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Prompt Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>
              Create a new PRISM prompt with all required fields
            </DialogDescription>
          </DialogHeader>
          <PromptForm
            onSubmit={handleCreatePrompt}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Prompt Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Update the selected prompt
            </DialogDescription>
          </DialogHeader>
          <PromptForm
            prompt={selectedPrompt}
            onSubmit={(data) => selectedPrompt && handleUpdatePrompt(selectedPrompt.id, data)}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Prompt Form Component
function PromptForm({ 
  prompt, 
  onSubmit, 
  onCancel 
}: { 
  prompt?: PromptStarter | null; 
  onSubmit: (data: Partial<PromptStarter>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: prompt?.name || '',
    display_name: prompt?.display_name || '',
    description: prompt?.description || '',
    domain: prompt?.domain || '',
    complexity_level: prompt?.complexity_level || 'simple',
    system_prompt: prompt?.system_prompt || '',
    user_prompt_template: prompt?.user_prompt_template || '',
    prompt_starter: prompt?.prompt_starter || '',
    compliance_tags: prompt?.compliance_tags || [],
    estimated_tokens: prompt?.estimated_tokens || 1000
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="prompt-name"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Display Name</label>
          <Input
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="Prompt Display Name"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this prompt does..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Domain</label>
          <Input
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="regulatory_affairs"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Complexity Level</label>
          <Select
            value={formData.complexity_level}
            onValueChange={(value) => setFormData({ ...formData, complexity_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="complex">Complex</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">System Prompt</label>
        <Textarea
          value={formData.system_prompt}
          onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
          placeholder="You are a..."
          className="min-h-[100px]"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">User Prompt Template</label>
        <Textarea
          value={formData.user_prompt_template}
          onChange={(e) => setFormData({ ...formData, user_prompt_template: e.target.value })}
          placeholder="Create a {document_type} for {product}..."
          className="min-h-[100px]"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Prompt Starter</label>
        <Textarea
          value={formData.prompt_starter}
          onChange={(e) => setFormData({ ...formData, prompt_starter: e.target.value })}
          placeholder="Create a regulatory document for {product_name}..."
          className="min-h-[80px]"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {prompt ? 'Update' : 'Create'} Prompt
        </Button>
      </div>
    </form>
  );
}

export default EnhancedPromptAdminDashboard;

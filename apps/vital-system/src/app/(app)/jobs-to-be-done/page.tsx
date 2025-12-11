'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/page-header';
import {
  Search,
  Target,
  CheckCircle2,
  TrendingUp,
  Zap,
  AlertCircle,
  Layers,
  BarChart3,
  Shield,
  Clock,
} from 'lucide-react';

interface JTBD {
  id: string;
  code?: string;
  job_statement: string;
  description?: string;
  category?: string;
  functional_area?: string;
  job_type?: string;
  job_category?: string;
  complexity?: string;
  frequency?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'active' | 'planned' | 'completed' | 'draft';
  // ODI scores
  importance_score?: number;
  satisfaction_score?: number;
  opportunity_score?: number;
  odi_tier?: string;
  // Additional attributes
  work_pattern?: string;
  jtbd_type?: string;
  impact_level?: string;
  compliance_sensitivity?: string;
  recommended_service_layer?: string;
  validation_score?: number;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export default function JTBDPage() {
  const [jtbds, setJTBDs] = useState<JTBD[]>([]);
  const [filteredJTBDs, setFilteredJTBDs] = useState<JTBD[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {} as Record<string, number>,
    byPriority: {
      high: 0,
      medium: 0,
      low: 0,
    },
    byStatus: {
      active: 0,
      planned: 0,
      completed: 0,
      draft: 0,
    },
    byComplexity: {} as Record<string, number>,
    byJobCategory: {} as Record<string, number>,
    byOdiTier: {} as Record<string, number>,
    avgOpportunityScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedJTBD, setSelectedJTBD] = useState<JTBD | null>(null);

  useEffect(() => {
    loadJTBDs();
  }, []);

  useEffect(() => {
    filterJTBDs();
  }, [searchQuery, selectedCategory, selectedPriority, selectedStatus, jtbds]);

  const loadJTBDs = async () => {
    try {
      setLoading(true);
      console.log('JTBD page: Loading jobs-to-be-done for current tenant...');

      // Fetch from API endpoint
      const response = await fetch('/api/jtbd');

      if (!response.ok) {
        throw new Error(`Failed to fetch JTBD: ${response.statusText}`);
      }

      const data = await response.json();
      const allJTBDs = data.jtbd || [];
      const apiStats = data.stats || {};

      console.log('JTBD page: Loaded', allJTBDs.length, 'jobs-to-be-done');
      console.log('JTBD stats:', apiStats);

      setJTBDs(allJTBDs);

      // Use stats from API or calculate locally
      setStats({
        total: apiStats.total || allJTBDs.length,
        byCategory: apiStats.byCategory || {},
        byPriority: apiStats.byPriority || { high: 0, medium: 0, low: 0 },
        byStatus: apiStats.byStatus || { active: 0, planned: 0, completed: 0, draft: 0 },
        byComplexity: apiStats.byComplexity || {},
        byJobCategory: apiStats.byJobCategory || {},
        byOdiTier: apiStats.byOdiTier || {},
        avgOpportunityScore: apiStats.avgOpportunityScore || 0,
      });
    } catch (error) {
      console.error('Error loading JTBD:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJTBDs = () => {
    let filtered = [...jtbds];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(jtbd =>
        jtbd.job_statement.toLowerCase().includes(query) ||
        jtbd.description?.toLowerCase().includes(query) ||
        jtbd.category?.toLowerCase().includes(query) ||
        jtbd.persona?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(jtbd => jtbd.category === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(jtbd => jtbd.priority === selectedPriority);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(jtbd => jtbd.status === selectedStatus);
    }

    setFilteredJTBDs(filtered);
  };

  const getUniqueCategories = () => {
    const categories = new Set(jtbds.map(j => j.category).filter(Boolean));
    return Array.from(categories).sort();
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={Target}
        title="Jobs to Be Done"
        description={`${stats.total} user jobs across categories and priorities`}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-neutral-600 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Total Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-red-800 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  High Priority
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.byPriority.high}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-green-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.byStatus.active}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-purple-800 flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.byCategory).length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Avg Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.avgOpportunityScore > 0 ? stats.avgOpportunityScore.toFixed(1) : '—'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority/Status Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Priority</span>
                    <Badge className="bg-red-100 text-red-800">{stats.byPriority.high}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Priority</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats.byPriority.medium}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Priority</span>
                    <Badge className="bg-blue-100 text-blue-800">{stats.byPriority.low}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active</span>
                    <Badge className="bg-green-100 text-green-800">{stats.byStatus.active}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Planned</span>
                    <Badge className="bg-blue-100 text-blue-800">{stats.byStatus.planned}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <Badge className="bg-purple-100 text-purple-800">{stats.byStatus.completed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search jobs by statement, category, or persona..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-800"
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Priority Filter */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-800"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-800"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Reset */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedPriority('all');
                    setSelectedStatus('all');
                  }}
                >
                  Reset
                </Button>
              </div>

              <div className="mt-4 text-sm text-neutral-500">
                Showing {filteredJTBDs.length} of {stats.total} jobs
              </div>
            </CardContent>
          </Card>

          {/* JTBD Grid */}
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJTBDs.map((jtbd) => (
                  <JTBDCard key={jtbd.id} jtbd={jtbd} onClick={setSelectedJTBD} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {filteredJTBDs.map((jtbd) => (
                  <JTBDListItem key={jtbd.id} jtbd={jtbd} onClick={setSelectedJTBD} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="space-y-8">
                {getUniqueCategories().map(category => {
                  const categoryJTBDs = filteredJTBDs.filter(j => j.category === category);
                  if (categoryJTBDs.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <Target className="h-6 w-6" />
                        <h2 className="text-2xl font-bold">{category}</h2>
                        <Badge variant="secondary">{categoryJTBDs.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryJTBDs.map((jtbd) => (
                          <JTBDCard key={jtbd.id} jtbd={jtbd} compact onClick={setSelectedJTBD} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {filteredJTBDs.length === 0 && !loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-neutral-500">No jobs found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function JTBDCard({ jtbd, compact = false, onClick, getPriorityColor, getStatusColor }: {
  jtbd: JTBD;
  compact?: boolean;
  onClick?: (jtbd: JTBD) => void;
  getPriorityColor: (priority?: string) => string;
  getStatusColor: (status?: string) => string;
}) {
  const getComplexityColor = (complexity?: string) => {
    switch (complexity?.toLowerCase()) {
      case 'very_high':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getOdiTierColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'extreme':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onClick?.(jtbd)}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              {jtbd.code && (
                <span className="text-xs font-mono text-neutral-500">{jtbd.code}</span>
              )}
            </div>
            <CardTitle className="text-base line-clamp-2">{jtbd.job_statement}</CardTitle>
          </div>
          {jtbd.odi_tier && (
            <Badge className={`ml-2 ${getOdiTierColor(jtbd.odi_tier)}`}>
              {jtbd.odi_tier}
            </Badge>
          )}
        </div>
        {!compact && jtbd.description && (
          <CardDescription className="line-clamp-2 mt-2">
            {jtbd.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Primary Badges */}
          <div className="flex flex-wrap gap-2">
            {jtbd.priority && (
              <Badge className={getPriorityColor(jtbd.priority)}>
                {jtbd.priority.toUpperCase()}
              </Badge>
            )}

            {jtbd.status && (
              <Badge className={getStatusColor(jtbd.status)}>
                {jtbd.status}
              </Badge>
            )}

            {jtbd.complexity && (
              <Badge className={getComplexityColor(jtbd.complexity)}>
                {jtbd.complexity.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Category & Type */}
          <div className="flex flex-wrap gap-2">
            {jtbd.category && (
              <Badge variant="outline" className="text-xs">
                {jtbd.category}
              </Badge>
            )}
            {jtbd.job_category && jtbd.job_category !== jtbd.category && (
              <Badge variant="outline" className="text-xs bg-blue-50">
                {jtbd.job_category}
              </Badge>
            )}
            {jtbd.recommended_service_layer && (
              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                {jtbd.recommended_service_layer}
              </Badge>
            )}
          </div>

          {/* ODI Scores */}
          {!compact && (jtbd.opportunity_score || jtbd.importance_score) && (
            <div className="space-y-2 pt-2 border-t">
              {jtbd.opportunity_score && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Opportunity
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min((jtbd.opportunity_score / 20) * 100, 100)} className="w-16 h-1.5" />
                    <span className="font-medium">{jtbd.opportunity_score}</span>
                  </div>
                </div>
              )}
              {jtbd.importance_score && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Importance
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={(jtbd.importance_score / 10) * 100} className="w-16 h-1.5" />
                    <span className="font-medium">{jtbd.importance_score}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Metadata */}
          {!compact && (
            <div className="text-xs text-neutral-500 space-y-1 pt-2">
              {jtbd.frequency && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{jtbd.frequency}</span>
                </div>
              )}
              {jtbd.compliance_sensitivity && (
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Compliance: {jtbd.compliance_sensitivity}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function JTBDListItem({ jtbd, onClick, getPriorityColor, getStatusColor }: {
  jtbd: JTBD;
  onClick?: (jtbd: JTBD) => void;
  getPriorityColor: (priority?: string) => string;
  getStatusColor: (status?: string) => string;
}) {
  return (
    <Card className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-gray-800/50" onClick={() => onClick?.(jtbd)}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {jtbd.code && (
                  <span className="text-xs font-mono text-neutral-500">{jtbd.code}</span>
                )}
                {jtbd.category && (
                  <Badge variant="outline" className="text-xs">
                    {jtbd.category}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold line-clamp-1">{jtbd.job_statement}</h3>
              {jtbd.description && (
                <p className="text-sm text-neutral-500 line-clamp-1">
                  {jtbd.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {jtbd.opportunity_score && (
              <div className="text-xs text-right">
                <span className="text-neutral-500">ODI</span>
                <div className="font-bold text-blue-600">{jtbd.opportunity_score}</div>
              </div>
            )}
            
            {jtbd.priority && (
              <Badge className={getPriorityColor(jtbd.priority)}>
                {jtbd.priority}
              </Badge>
            )}

            {jtbd.status && (
              <Badge className={getStatusColor(jtbd.status)}>
                {jtbd.status}
              </Badge>
            )}

            {jtbd.odi_tier && (
              <Badge className={
                jtbd.odi_tier === 'extreme' ? 'bg-red-500 text-white' :
                jtbd.odi_tier === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-neutral-100 text-neutral-800'
              }>
                {jtbd.odi_tier}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}










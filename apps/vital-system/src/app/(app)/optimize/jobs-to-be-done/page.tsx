'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { AssetLoadingSkeleton } from '@/components/shared/AssetLoadingSkeleton';
import { AssetEmptyState } from '@/components/shared/AssetEmptyState';
import { AssetResultsCount } from '@/components/shared/AssetResultsCount';
import {
  JTBDCard,
  JTBDListItem,
  type JTBD,
  type JTBDStats,
} from '@/components/jtbd';
import {
  Search,
  Target,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Layers,
  Plus,
  RefreshCw,
} from 'lucide-react';

type ViewMode = 'grid' | 'list' | 'categories';
type SortKey = 'priority' | 'opportunity' | 'name' | 'status';

const defaultStats: JTBDStats = {
  total: 0,
  byCategory: {},
  byPriority: { high: 0, medium: 0, low: 0 },
  byStatus: { active: 0, planned: 0, completed: 0, draft: 0 },
  byComplexity: {},
  byJobCategory: {},
  byOdiTier: {},
  avgOpportunityScore: 0,
};

export default function JTBDPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-based state
  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';
  const sortKey = (searchParams.get('sort') as SortKey) || 'priority';

  // Local state
  const [jtbds, setJTBDs] = useState<JTBD[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState<JTBDStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [selectedJTBD, setSelectedJTBD] = useState<JTBD | null>(null);

  // URL update helper
  const updateURL = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      const newURL = newParams.toString() ? `?${newParams.toString()}` : '';
      router.replace(`/optimize/jobs-to-be-done${newURL}`, { scroll: false });
    },
    [router, searchParams]
  );

  const loadJTBDs = useCallback(async () => {
    try {
      setLoading(true);
      console.log('JTBD page: Loading jobs-to-be-done for current tenant...');

      const response = await fetch('/api/jtbd');

      if (!response.ok) {
        throw new Error(`Failed to fetch JTBD: ${response.statusText}`);
      }

      const data = await response.json();
      const allJTBDs = data.jtbd || [];
      const apiStats = data.stats || {};

      console.log('JTBD page: Loaded', allJTBDs.length, 'jobs-to-be-done');

      setJTBDs(allJTBDs);
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
  }, []);

  useEffect(() => {
    loadJTBDs();
  }, [loadJTBDs]);

  // Memoized filtering and sorting
  const filteredJTBDs = useMemo(() => {
    let filtered = [...jtbds];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (jtbd) =>
          jtbd.job_statement.toLowerCase().includes(query) ||
          jtbd.description?.toLowerCase().includes(query) ||
          jtbd.category?.toLowerCase().includes(query) ||
          jtbd.functional_area?.toLowerCase().includes(query) ||
          jtbd.code?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((jtbd) => jtbd.category === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter((jtbd) => jtbd.priority === selectedPriority);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((jtbd) => jtbd.status === selectedStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortKey) {
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority || 'low'] || 2) - (priorityOrder[b.priority || 'low'] || 2);
        }
        case 'opportunity':
          return (b.opportunity_score || 0) - (a.opportunity_score || 0);
        case 'name':
          return a.job_statement.localeCompare(b.job_statement);
        case 'status': {
          const statusOrder = { active: 0, planned: 1, draft: 2, completed: 3 };
          return (statusOrder[a.status || 'draft'] || 2) - (statusOrder[b.status || 'draft'] || 2);
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [jtbds, searchQuery, selectedCategory, selectedPriority, selectedStatus, sortKey]);

  // Unique categories from data
  const uniqueCategories = useMemo(() => {
    const categories = new Set(jtbds.map((j) => j.category).filter(Boolean));
    return Array.from(categories).sort() as string[];
  }, [jtbds]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
  }, []);

  // Handle JTBD click
  const handleJTBDClick = useCallback((jtbd: JTBD) => {
    setSelectedJTBD(jtbd);
    // TODO: Open edit modal when created
  }, []);

  // Handle create new JTBD
  const handleCreate = useCallback(() => {
    // TODO: Open create modal
    console.log('Create new JTBD');
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={Target}
        title="Jobs to Be Done"
        description={`${stats.total} user jobs across categories and priorities`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadJTBDs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create JTBD
            </Button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search jobs by statement, category, or code..."
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
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
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
                  <option value="draft">Draft</option>
                </select>

                {/* Sort */}
                <select
                  value={sortKey}
                  onChange={(e) => updateURL({ sort: e.target.value })}
                  className="px-4 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-800"
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="opportunity">Sort by Opportunity</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                </select>

                {/* Reset */}
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <AssetResultsCount count={filteredJTBDs.length} singular="job" plural="jobs" />
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && <AssetLoadingSkeleton variant={viewMode === 'list' ? 'list' : 'grid'} count={9} />}

          {/* JTBD Views */}
          {!loading && (
            <Tabs
              value={viewMode}
              onValueChange={(v) => updateURL({ view: v })}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="categories">By Category</TabsTrigger>
              </TabsList>

              <TabsContent value="grid">
                {filteredJTBDs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJTBDs.map((jtbd) => (
                      <JTBDCard key={jtbd.id} jtbd={jtbd} onClick={handleJTBDClick} />
                    ))}
                  </div>
                ) : (
                  <AssetEmptyState
                    icon={Target}
                    title="No jobs found"
                    description="No jobs match your current filters. Try adjusting your search criteria."
                    actionLabel="Create JTBD"
                    onAction={handleCreate}
                  />
                )}
              </TabsContent>

              <TabsContent value="list">
                {filteredJTBDs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredJTBDs.map((jtbd) => (
                      <JTBDListItem key={jtbd.id} jtbd={jtbd} onClick={handleJTBDClick} />
                    ))}
                  </div>
                ) : (
                  <AssetEmptyState
                    icon={Target}
                    title="No jobs found"
                    description="No jobs match your current filters. Try adjusting your search criteria."
                    actionLabel="Create JTBD"
                    onAction={handleCreate}
                  />
                )}
              </TabsContent>

              <TabsContent value="categories">
                {uniqueCategories.length > 0 ? (
                  <div className="space-y-8">
                    {uniqueCategories.map((category) => {
                      const categoryJTBDs = filteredJTBDs.filter((j) => j.category === category);
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
                              <JTBDCard key={jtbd.id} jtbd={jtbd} compact onClick={handleJTBDClick} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <AssetEmptyState
                    icon={Target}
                    title="No jobs found"
                    description="No jobs match your current filters. Try adjusting your search criteria."
                    actionLabel="Create JTBD"
                    onAction={handleCreate}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

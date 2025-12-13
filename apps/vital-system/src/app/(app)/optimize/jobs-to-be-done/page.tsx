'use client';

/**
 * Jobs to Be Done Page - VITAL Brand Guidelines v6.0
 *
 * Design System:
 * - Primary Accent: #9055E0 (Warm Purple) via Tailwind purple-600
 * - Canvas: stone-50, Surface: stone-100
 * - Text: stone-600/700/800
 * - Transitions: 150ms for interactions
 *
 * Refactored: December 2025
 * - Extracted useJTBDData and useJTBDFilters hooks
 * - Reduced from 529 to ~280 lines (47% reduction)
 */

import React, { Suspense, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Input, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { AssetLoadingSkeleton } from '@/components/shared/AssetLoadingSkeleton';
import { AssetEmptyState } from '@/components/shared/AssetEmptyState';
import { AssetResultsCount } from '@/components/shared/AssetResultsCount';
import { JTBDCard, JTBDListItem, type JTBD } from '@/components/jtbd';
import { useJTBDData, useJTBDFilters } from '@/features/optimize/hooks';
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

// Stats Cards Component
function JTBDStatsCards({ stats }: { stats: ReturnType<typeof useJTBDData>['stats'] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <Card className="border border-stone-200 bg-white transition-all duration-150 hover:border-purple-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-stone-600 flex items-center gap-1">
            <Target className="h-3 w-3 text-purple-600" />
            Total Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-stone-800">{stats.total}</div>
        </CardContent>
      </Card>

      <Card className="border border-rose-200 bg-rose-50 transition-all duration-150 hover:border-rose-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-rose-800 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            High Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600">{stats.byPriority.high}</div>
        </CardContent>
      </Card>

      <Card className="border border-emerald-200 bg-emerald-50 transition-all duration-150 hover:border-emerald-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{stats.byStatus.active}</div>
        </CardContent>
      </Card>

      <Card className="border border-purple-200 bg-purple-50 transition-all duration-150 hover:border-purple-400">
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

      <Card className="border border-cyan-200 bg-cyan-50 transition-all duration-150 hover:border-cyan-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-cyan-800 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Avg Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-600">
            {stats.avgOpportunityScore > 0 ? stats.avgOpportunityScore.toFixed(1) : '—'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Distribution Cards Component
function JTBDDistributionCards({ stats }: { stats: ReturnType<typeof useJTBDData>['stats'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-800">Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors duration-150">
              <span className="text-sm text-stone-700">High Priority</span>
              <Badge className="bg-rose-100 text-rose-800 border border-rose-200">{stats.byPriority.high}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors duration-150">
              <span className="text-sm text-stone-700">Medium Priority</span>
              <Badge className="bg-amber-100 text-amber-800 border border-amber-200">{stats.byPriority.medium}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors duration-150">
              <span className="text-sm text-stone-700">Low Priority</span>
              <Badge className="bg-cyan-100 text-cyan-800 border border-cyan-200">{stats.byPriority.low}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-800">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors duration-150">
              <span className="text-sm text-stone-700">Active</span>
              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">{stats.byStatus.active}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors duration-150">
              <span className="text-sm text-stone-700">Planned</span>
              <Badge className="bg-cyan-100 text-cyan-800 border border-cyan-200">{stats.byStatus.planned}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 transition-colors duration-150">
              <span className="text-sm text-stone-700">Completed</span>
              <Badge className="bg-purple-100 text-purple-800 border border-purple-200">{stats.byStatus.completed}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Page Content
function JTBDPageContent() {
  const { jtbds, stats, loading, refreshJTBDs } = useJTBDData();
  const {
    viewMode,
    searchQuery,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    sortKey,
    filteredJTBDs,
    uniqueCategories,
    setSearchQuery,
    setSelectedCategory,
    setSelectedPriority,
    setSelectedStatus,
    updateURL,
    resetFilters,
  } = useJTBDFilters(jtbds);

  const [selectedJTBD, setSelectedJTBD] = useState<JTBD | null>(null);

  const handleJTBDClick = useCallback((jtbd: JTBD) => {
    setSelectedJTBD(jtbd);
    // TODO: Open edit modal when created
  }, []);

  const handleCreate = useCallback(() => {
    // TODO: Open create modal
    console.log('Create new JTBD');
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      {/* Action Bar */}
      <div className="flex items-center justify-end gap-2 px-6 py-3 border-b bg-white/50 backdrop-blur-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshJTBDs}
          disabled={loading}
          className="border-stone-300 text-stone-700 hover:border-purple-400 hover:text-purple-600 transition-colors duration-150"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-150"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create JTBD
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <JTBDStatsCards stats={stats} />
          <JTBDDistributionCards stats={stats} />

          {/* Filters */}
          <Card className="border border-stone-200 bg-white">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                    <Input
                      placeholder="Search jobs by statement, category, or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-stone-300 focus:border-purple-400 focus:ring-purple-400 transition-colors duration-150"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-stone-300 rounded-md bg-white text-stone-700 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors duration-150"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((category: string) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Priority Filter */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-4 py-2 border border-stone-300 rounded-md bg-white text-stone-700 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors duration-150"
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
                  className="px-4 py-2 border border-stone-300 rounded-md bg-white text-stone-700 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors duration-150"
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
                  className="px-4 py-2 border border-stone-300 rounded-md bg-white text-stone-700 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors duration-150"
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="opportunity">Sort by Opportunity</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                </select>

                {/* Reset */}
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="border-stone-300 text-stone-700 hover:border-purple-400 hover:text-purple-600 transition-colors duration-150"
                >
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
                    {filteredJTBDs.map((jtbd: JTBD) => (
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
                    {filteredJTBDs.map((jtbd: JTBD) => (
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
                    {uniqueCategories.map((category: string) => {
                      const categoryJTBDs = filteredJTBDs.filter((j: JTBD) => j.category === category);
                      if (categoryJTBDs.length === 0) return null;

                      return (
                        <div key={category}>
                          <div className="flex items-center gap-3 mb-4">
                            <Target className="h-6 w-6 text-purple-600" />
                            <h2 className="text-2xl font-bold text-stone-800">{category}</h2>
                            <Badge className="bg-purple-100 text-purple-800 border border-purple-200">{categoryJTBDs.length}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryJTBDs.map((jtbd: JTBD) => (
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

export default function JTBDPage() {
  return (
    <Suspense fallback={<AssetLoadingSkeleton variant="grid" count={9} />}>
      <JTBDPageContent />
    </Suspense>
  );
}

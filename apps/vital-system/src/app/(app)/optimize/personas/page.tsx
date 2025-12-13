'use client';

/**
 * Personas List Page - VITAL Brand Guidelines v6.0
 *
 * Refactored to use extracted hooks and components
 * Reduced from 611 lines to ~180 lines
 */

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { Users, Plus, RefreshCw } from 'lucide-react';
import {
  PersonaCard,
  PersonaListItem,
  PersonaStatsCards,
  type Persona,
} from '@/components/personas';
import { AssetLoadingSkeleton } from '@/components/shared/AssetLoadingSkeleton';
import { AssetEmptyState } from '@/components/shared/AssetEmptyState';
import { AssetResultsCount } from '@/components/shared/AssetResultsCount';

// Feature imports
import { usePersonaData, usePersonaFilters } from '@/features/personas/hooks';
import {
  PersonaArchetypeView,
  PersonaDepartmentView,
  PersonaFocusView,
} from '@/features/personas/components/views';

// View types for URL persistence
type ViewMode = 'grid' | 'list' | 'archetypes' | 'departments' | 'focus';

export default function PersonasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-based state
  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';
  const urlSortKey = searchParams.get('sort') || 'priority';

  // Data and filters from hooks
  const { personas, allDepartments, stats, loading, error, reload } = usePersonaData();
  const { sortedPersonas, setSortKey } = usePersonaFilters(personas, urlSortKey as any);

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // URL update helper
  const updateURL = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'grid' && value !== 'priority') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    const newURL = newParams.toString() ? `?${newParams.toString()}` : '';
    router.replace(`/optimize/personas${newURL}`, { scroll: false });
  }, [router, searchParams]);

  // Handle view change
  const handleViewChange = (newView: string) => {
    updateURL({ view: newView });
  };

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortKey(newSort as any);
    updateURL({ sort: newSort });
  };

  // Navigate to persona detail
  const handlePersonaClick = (persona: Persona) => {
    router.push(`/optimize/personas/${persona.slug}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      {/* Action Bar */}
      <div className="flex items-center justify-end gap-2 px-6 py-3 border-b bg-white/50 backdrop-blur-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={reload}
          disabled={loading}
          className="border-stone-300 text-stone-700 hover:border-purple-400 hover:text-purple-600 transition-colors duration-150"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-150"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Persona
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Results Count & Sort */}
          {!loading && !error && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <AssetResultsCount count={sortedPersonas.length} singular="persona" />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500">Sort by</span>
                <select
                  value={urlSortKey}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-canvas-surface dark:bg-neutral-900 text-sm"
                >
                  <option value="priority">Priority (AI + Work + JTBDs)</option>
                  <option value="ai">AI Readiness</option>
                  <option value="work">Work Complexity</option>
                  <option value="jtbd">JTBD Count</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="font-semibold">Error:</span>
                    <span>{error}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={reload}>Retry</Button>
                    {error.includes('Authentication') && (
                      <Button onClick={() => window.location.href = '/auth/signin'}>Sign In</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && <AssetLoadingSkeleton variant={viewMode === 'list' ? 'list' : 'grid'} />}

          {/* Stats Cards */}
          {!loading && !error && <PersonaStatsCards stats={stats} />}

          {/* Empty State */}
          {!loading && !error && sortedPersonas.length === 0 && (
            <AssetEmptyState
              icon={Users}
              title="No personas found"
              description="Try adjusting your filters or create a new persona."
              actionLabel="Create Persona"
              onAction={() => setShowCreateModal(true)}
              showAction={true}
            />
          )}

          {/* Personas Views */}
          {!loading && !error && sortedPersonas.length > 0 && (
            <Tabs value={viewMode} onValueChange={handleViewChange} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="archetypes">By Archetype</TabsTrigger>
                <TabsTrigger value="departments">By Department</TabsTrigger>
                <TabsTrigger value="focus">Focus</TabsTrigger>
              </TabsList>

              {/* Grid View */}
              <TabsContent value="grid">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPersonas.map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      onClick={handlePersonaClick}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* List View */}
              <TabsContent value="list">
                <div className="space-y-4">
                  {sortedPersonas.map((persona) => (
                    <PersonaListItem
                      key={persona.id}
                      persona={persona}
                      onClick={handlePersonaClick}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* By Archetype View */}
              <TabsContent value="archetypes">
                <PersonaArchetypeView
                  personas={sortedPersonas}
                  onPersonaClick={handlePersonaClick}
                />
              </TabsContent>

              {/* By Department View */}
              <TabsContent value="departments">
                <PersonaDepartmentView
                  personas={sortedPersonas}
                  allDepartments={allDepartments}
                  onPersonaClick={handlePersonaClick}
                />
              </TabsContent>

              {/* Focus View */}
              <TabsContent value="focus">
                <PersonaFocusView
                  personas={sortedPersonas}
                  onPersonaClick={handlePersonaClick}
                  onResetSort={() => handleSortChange('priority')}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* TODO: Add PersonaEditModalV2 when showCreateModal is true */}
    </div>
  );
}

'use client';

/**
 * Missions Page - Brand Guidelines v6.0
 *
 * Design System:
 * - Primary Accent: #9055E0 (Warm Purple) via Tailwind purple-600
 * - Canvas: stone-50, Surface: white with stone-200 border
 * - Text: stone-600/700/800
 * - Transitions: 150ms for interactions
 *
 * Layout matches /discover/skills exactly using shared VitalAssetView
 */

import React, { useMemo, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { DEFAULT_MISSION_TEMPLATES } from '@/features/ask-expert/types/mission-runners';
import { ActiveFiltersBar } from '@/components/shared/ActiveFiltersBar';

// Import shared asset view from @vital/ai-ui
import {
  VitalAssetView,
  type VitalAsset,
  type VitalMissionAsset,
} from '@vital/ai-ui';

// Convert mission template to VitalAsset format
function missionToAsset(template: typeof DEFAULT_MISSION_TEMPLATES[number]): VitalMissionAsset {
  return {
    id: template.id || '',
    name: template.name || 'Untitled Mission',
    slug: template.id, // Use id as slug for URL
    description: template.description || 'Mission template',
    category: template.category || 'General',
    tags: template.tags || [],
    is_active: true,
    asset_type: 'mission',
    family: template.family || 'GENERIC',
    complexity: template.complexity || 'medium',
    estimated_duration_min: template.estimatedDurationMin || 0,
    estimated_duration_max: template.estimatedDurationMax || 0,
    estimated_cost_min: template.estimatedCostMin || 0,
    estimated_cost_max: template.estimatedCostMax || 0,
    min_agents: template.minAgents,
    max_agents: template.maxAgents,
    example_queries: template.exampleQueries,
    metadata: {
      popularityScore: (template as any).popularityScore,
    },
  };
}

function MissionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  // Get filters from URL params (synced with sidebar)
  const viewParam = searchParams.get('view') || 'grid';
  const familyParam = searchParams.get('family') || '';
  const complexityParam = searchParams.get('complexity') || '';

  const [searchQuery, setSearchQuery] = useState('');

  // Handle view mode change - update URL
  const handleViewModeChange = useCallback((mode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`/missions?${params.toString()}`);
  }, [router, searchParams]);

  // Format family name for display
  const formatFamilyName = (family: string) => {
    return family
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Build active filters for display
  const activeFilters = useMemo(() => {
    const filters: Array<{ key: string; label: string; value: string }> = [];
    if (familyParam) {
      filters.push({
        key: 'family',
        label: 'Family',
        value: formatFamilyName(familyParam),
      });
    }
    if (complexityParam) {
      filters.push({
        key: 'complexity',
        label: 'Complexity',
        value: complexityParam.charAt(0).toUpperCase() + complexityParam.slice(1),
      });
    }
    return filters;
  }, [familyParam, complexityParam]);

  // Remove a single filter
  const removeFilter = useCallback((key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/missions?${params.toString()}`);
  }, [router, searchParams]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    const view = searchParams.get('view');
    if (view) params.set('view', view);
    router.push(`/missions?${params.toString()}`);
  }, [router, searchParams]);

  // Convert templates to assets
  const assets = useMemo(() => {
    return (DEFAULT_MISSION_TEMPLATES || [])
      .filter((t) => t && t.id && t.name)
      .map(missionToAsset);
  }, []);

  // Filter by URL params and search
  const filteredAssets = useMemo(() => {
    let filtered = assets;

    // Filter by family
    if (familyParam) {
      filtered = filtered.filter((a) => a.family === familyParam);
    }

    // Filter by complexity
    if (complexityParam) {
      filtered = filtered.filter((a) => a.complexity === complexityParam);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query) ||
          a.category?.toLowerCase().includes(query) ||
          a.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [assets, familyParam, complexityParam, searchQuery]);

  // Navigate to mission detail page
  const handleAssetClick = (asset: VitalAsset) => {
    router.push(`/missions/${asset.id}`);
  };

  // Edit handler (for admin)
  const handleEdit = (asset: VitalAsset) => {
    router.push(`/missions/${asset.id}?edit=true`);
  };

  // Delete handler (for admin)
  const handleDelete = (asset: VitalAsset) => {
    router.push(`/missions/${asset.id}?delete=true`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      {/* Action Bar - matches /discover/skills */}
      <div className="flex items-center gap-4 px-6 py-2 border-b border-stone-200 bg-white">
        <div className="flex-1" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">
                Admin mode: You can edit and delete mission templates
              </span>
            </div>
          )}

          {/* Active Filters Bar */}
          <ActiveFiltersBar
            filters={activeFilters}
            filteredCount={filteredAssets.length}
            totalCount={assets.length}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            colorScheme="purple"
          />

          {/* Shared Asset View */}
          <VitalAssetView
            assets={filteredAssets}
            viewMode={viewParam as 'grid' | 'list' | 'table'}
            onViewModeChange={handleViewModeChange}
            showViewToggle={false}
            availableViews={['grid', 'list', 'table']}
            showSearch
            searchPlaceholder="Search missions by name, description, or category..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showCategoryFilter={false}
            showSort
            isAdmin={isAdmin}
            cardVariant="rich"
            gridColumns={{ sm: 1, md: 2, lg: 3 }}
            onAssetClick={handleAssetClick}
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
          />
        </div>
      </div>
    </div>
  );
}

// Loading fallback - Brand v6.0
function MissionsPageLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      <div className="flex items-center gap-4 px-6 py-2 border-b border-stone-200 bg-white">
        <div className="flex-1" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    </div>
  );
}

export default function MissionsPage() {
  return (
    <Suspense fallback={<MissionsPageLoading />}>
      <MissionsPageContent />
    </Suspense>
  );
}

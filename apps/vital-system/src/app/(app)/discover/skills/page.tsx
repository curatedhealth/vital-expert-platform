/**
 * Skills Registry - Brand Guidelines v6.0
 *
 * Design System:
 * - Primary Accent: #9055E0 (Warm Purple) via Tailwind purple-600
 * - Canvas: stone-50, Surface: white with stone-200 border
 * - Text: stone-600/700/800
 * - Transitions: 150ms for interactions
 *
 * Refactored: December 2025
 * - Extracted useSkillsData and useSkillsCRUD hooks
 */
'use client';

import React, { useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssetOverviewStats, StatCardConfig } from '@/components/shared/AssetOverviewStats';
import { RecentAssetsCard, RecentAssetItem } from '@/components/shared/RecentAssetsCard';
import { ActiveFiltersBar } from '@/components/shared/ActiveFiltersBar';
import { useAssetFilters } from '@/hooks/useAssetFilters';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useSkillsData, useSkillsCRUD, filterSkillsByParams, type Skill } from '@/features/discover/hooks';
import {
  Sparkles,
  CheckCircle2,
  Zap,
  Database,
  Shield,
  Cog,
  Plus,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';

// Import shared asset view and skill constants from @vital/ai-ui
import {
  VitalAssetView,
  type VitalAsset,
  COMPLEXITY_BADGES,
  getComplexityLevel,
} from '@vital/ai-ui';

// Import V2 modals with Vital Forms Library
import {
  SkillEditModalV2,
  SkillDeleteModalV2,
  SkillBatchDeleteModal,
  DEFAULT_SKILL_VALUES,
} from '@/features/skills/components';

// Import Skill type from schema for consistency
import type { Skill as SkillSchema } from '@/lib/forms/schemas';

// Convert skill to VitalAsset format
function skillToAsset(skill: Skill): VitalAsset {
  return {
    ...skill,
    asset_type: 'skill',
  } as VitalAsset;
}

function SkillsPageContent() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  // Data hook
  const { skills, stats, loading, loadSkills } = useSkillsData();

  // CRUD hook
  const {
    isModalOpen,
    editingSkill,
    isSaving,
    deleteConfirmOpen,
    skillToDelete,
    isDeleting,
    error,
    selectedIds,
    isSelectionMode,
    batchDeleteConfirmOpen,
    handleCreateSkill,
    handleEditSkill,
    handleSaveSkill,
    handleDeleteConfirm,
    handleDeleteSkill,
    closeModals,
    setError,
    exitSelectionMode,
    handleSelectAll,
    setSelectedIds,
    setBatchDeleteConfirmOpen,
    handleBatchDelete,
  } = useSkillsCRUD();

  // Use shared filter hook
  const {
    viewParam,
    isOverviewMode,
    handleViewModeChange,
    searchParam,
    handleSearchChange,
    getFilterParam,
    activeFilters,
    removeFilter,
    clearAllFilters,
  } = useAssetFilters({
    basePath: '/discover/skills',
    filterKeys: ['category', 'complexity', 'type'],
  });

  const categoryParam = getFilterParam('category');
  const complexityParam = getFilterParam('complexity');
  const typeParam = getFilterParam('type');

  // Filter and convert skills
  const filteredSkills = useMemo(
    () => filterSkillsByParams(skills, categoryParam, complexityParam, typeParam),
    [skills, categoryParam, complexityParam, typeParam]
  );
  const assets = useMemo(() => filteredSkills.map(skillToAsset), [filteredSkills]);

  // Stats cards configuration - Brand v6.0 colors
  const statsCards: StatCardConfig[] = [
    { label: 'Total', value: stats.total },
    { label: 'Active', value: stats.active, icon: CheckCircle2, variant: 'success' },
    { label: 'Built-in', value: stats.builtin, icon: Cog, variant: 'purple' },
    { label: 'Custom', value: stats.custom, icon: Sparkles, variant: 'info' },
    {
      label: 'Advanced',
      value: (stats.byComplexity['advanced'] || 0) + (stats.byComplexity['expert'] || 0),
      icon: Zap,
      variant: 'orange',
    },
    {
      label: 'Categories',
      value: Object.keys(stats.byCategory).length,
      icon: Database,
      variant: 'cyan',
    },
  ];

  // Recent skills for overview
  const recentSkills: RecentAssetItem[] = filteredSkills.slice(0, 6).map((skill) => ({
    id: skill.id || '',
    name: skill.name,
    description: skill.description,
    category: skill.category || 'General',
    badges: [
      {
        label: COMPLEXITY_BADGES[getComplexityLevel(skill.complexity_score || 5)].label,
        className: `${COMPLEXITY_BADGES[getComplexityLevel(skill.complexity_score || 5)].bgColor} ${COMPLEXITY_BADGES[getComplexityLevel(skill.complexity_score || 5)].color}`,
      },
    ],
  }));

  // Navigation handlers
  const handleSkillClick = (asset: VitalAsset) => {
    const skill = skills.find((s) => s.id === asset.id);
    if (skill?.slug) {
      router.push(`/discover/skills/${skill.slug}`);
    }
  };

  // Wrap CRUD handlers to work with assets
  const onEditSkill = (asset: VitalAsset) => {
    const skill = skills.find((s) => s.id === asset.id);
    if (skill) handleEditSkill(skill);
  };

  const onDeleteConfirm = (asset: VitalAsset) => {
    const skill = skills.find((s) => s.id === asset.id);
    if (skill) handleDeleteConfirm(skill);
  };

  const onSaveSkill = async (data: SkillSchema) => {
    await handleSaveSkill(data, loadSkills);
  };

  const onDeleteSkill = async () => {
    await handleDeleteSkill(loadSkills);
  };

  const onBatchDelete = async () => {
    await handleBatchDelete(loadSkills);
  };

  const onSelectAll = () => {
    handleSelectAll(filteredSkills.map((s) => s.id).filter(Boolean) as string[]);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      {/* Action Bar */}
      <div className="flex items-center gap-4 px-6 py-2 border-b border-stone-200 bg-white">
        <div className="flex-1" />

        {/* Batch Selection Controls */}
        {isSelectionMode ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-600">{selectedIds.size} selected</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="border-stone-300 hover:border-purple-400"
            >
              {selectedIds.size === filteredSkills.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBatchDeleteConfirmOpen(true)}
              disabled={selectedIds.size === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedIds.size})
            </Button>
            <Button variant="ghost" size="sm" onClick={exitSelectionMode}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    exitSelectionMode();
                    setSelectedIds(new Set());
                  }}
                  className="border-stone-300 hover:border-purple-400"
                >
                  Select
                </Button>
                <Button
                  onClick={() => handleCreateSkill(DEFAULT_SKILL_VALUES)}
                  size="sm"
                  className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Create Skill
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">
                Admin mode: You can create, edit, and delete skills
              </span>
            </div>
          )}

          {/* Active Filters Bar */}
          <ActiveFiltersBar
            filters={activeFilters}
            filteredCount={filteredSkills.length}
            totalCount={stats.total}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            colorScheme="purple"
          />

          {/* Overview Mode */}
          {isOverviewMode && (
            <>
              <AssetOverviewStats stats={statsCards} />

              {/* Complexity Distribution - Brand v6.0 */}
              <Card className="border border-stone-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-stone-800">Complexity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(COMPLEXITY_BADGES).map(([level, config]) => {
                      const count = stats.byComplexity[level] || 0;
                      const Icon = config.icon;
                      return (
                        <div key={level} className="flex items-center gap-3">
                          <Icon className="h-8 w-8 text-stone-400" />
                          <div>
                            <div className="text-2xl font-bold text-stone-800">{count}</div>
                            <div className="text-sm text-stone-500">{config.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Skills */}
              <RecentAssetsCard
                title="Recent Skills"
                items={recentSkills}
                onItemClick={(item) => {
                  const skill = skills.find((s) => s.id === item.id);
                  if (skill?.slug) router.push(`/discover/skills/${skill.slug}`);
                }}
              />
            </>
          )}

          {/* Non-Overview Modes */}
          {!isOverviewMode && (
            <VitalAssetView
              assets={assets}
              viewMode={(viewParam === 'overview' ? 'grid' : viewParam) || 'grid'}
              onViewModeChange={handleViewModeChange}
              showViewToggle
              availableViews={['grid', 'list', 'table', 'kanban']}
              showSearch
              searchPlaceholder="Search skills by name, description, or category..."
              searchValue={searchParam || ''}
              onSearchChange={handleSearchChange}
              showCategoryFilter={false}
              showSort
              showRefresh
              onRefresh={loadSkills}
              isAdmin={isAdmin}
              cardVariant="rich"
              gridColumns={{ sm: 1, md: 2, lg: 3 }}
              kanbanDraggable={isAdmin}
              onAssetClick={handleSkillClick}
              onEdit={onEditSkill}
              onDelete={onDeleteConfirm}
              tableSelectable={isSelectionMode}
              selectedIds={Array.from(selectedIds)}
              onSelectionChange={(ids) => setSelectedIds(new Set(ids))}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <SkillEditModalV2
        isOpen={isModalOpen}
        onClose={closeModals}
        skill={editingSkill}
        onSave={onSaveSkill}
        isSaving={isSaving}
        error={error}
      />

      <SkillDeleteModalV2
        isOpen={deleteConfirmOpen}
        onClose={closeModals}
        skill={skillToDelete}
        onConfirm={onDeleteSkill}
        isDeleting={isDeleting}
      />

      <SkillBatchDeleteModal
        isOpen={batchDeleteConfirmOpen}
        onClose={() => setBatchDeleteConfirmOpen(false)}
        count={selectedIds.size}
        onConfirm={onBatchDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// Loading fallback - Brand v6.0
function SkillsPageLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      <div className="px-6 pt-4">
        <div className="h-5 w-32 bg-stone-200 rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-stone-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-stone-500">Loading skills...</p>
      </div>
    </div>
  );
}

export default function SkillsPage() {
  return (
    <Suspense fallback={<SkillsPageLoading />}>
      <SkillsPageContent />
    </Suspense>
  );
}

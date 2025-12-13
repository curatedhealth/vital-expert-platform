// Skills Registry - Using VitalAssetView
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssetOverviewStats, StatCardConfig } from '@/components/shared/AssetOverviewStats';
import { RecentAssetsCard, RecentAssetItem } from '@/components/shared/RecentAssetsCard';
import { ActiveFiltersBar } from '@/components/shared/ActiveFiltersBar';
import { useAssetFilters } from '@/hooks/useAssetFilters';
import { useAuth } from '@/lib/auth/supabase-auth-context';
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
  type VitalSkillAsset,
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

// Legacy skill type for API response
interface Skill {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  implementation_type?: string;
  implementation_ref?: string;
  complexity_score?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Convert skill to VitalAsset format
function skillToAsset(skill: Skill): VitalAsset {
  return {
    ...skill,
    asset_type: 'skill',
  } as VitalAsset;
}

// Filter skills based on URL params
function filterSkillsByParams(
  skills: Skill[],
  category: string | null,
  complexity: string | null,
  type: string | null
): Skill[] {
  let filtered = [...skills];

  if (category) {
    const categoryLower = category.toLowerCase();
    filtered = filtered.filter((s) => {
      const skillCategory = (s.category || '').toLowerCase();
      return skillCategory === categoryLower || skillCategory.includes(categoryLower);
    });
  }

  if (complexity) {
    const complexityLower = complexity.toLowerCase();
    filtered = filtered.filter((s) => {
      const score = s.complexity_score || 5;
      switch (complexityLower) {
        case 'basic': return score >= 1 && score <= 3;
        case 'intermediate': return score >= 4 && score <= 6;
        case 'advanced': return score >= 7 && score <= 8;
        case 'expert': return score >= 9 && score <= 10;
        default: return true;
      }
    });
  }

  if (type) {
    const typeLower = type.toLowerCase();
    filtered = filtered.filter((s) => {
      const implType = (s.implementation_type || '').toLowerCase();
      return implType === typeLower;
    });
  }

  return filtered;
}

// Inner component
function SkillsPageContent() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

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

  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byCategory: {} as Record<string, number>,
    byComplexity: {} as Record<string, number>,
    builtin: 0,
    custom: 0,
  });
  const [loading, setLoading] = useState(true);

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<SkillSchema> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Partial<SkillSchema> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/skills?limit=10000');
      if (!response.ok) throw new Error('Failed to fetch skills');
      const result = await response.json();
      const allSkills = result.skills || [];
      setSkills(allSkills);

      // Calculate stats
      const byCategory: Record<string, number> = {};
      const byComplexity: Record<string, number> = {};

      allSkills.forEach((skill: Skill) => {
        if (skill.category) {
          byCategory[skill.category] = (byCategory[skill.category] || 0) + 1;
        }
        const level = getComplexityLevel(skill.complexity_score || 5);
        byComplexity[level] = (byComplexity[level] || 0) + 1;
      });

      setStats({
        total: allSkills.length,
        active: allSkills.filter((s: Skill) => s.is_active).length,
        byCategory,
        byComplexity,
        builtin: allSkills.filter((s: Skill) => s.implementation_type === 'tool').length,
        custom: allSkills.filter((s: Skill) => s.implementation_type === 'prompt' || s.implementation_type === 'workflow').length,
      });
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and convert skills
  const filteredSkills = useMemo(() =>
    filterSkillsByParams(skills, categoryParam, complexityParam, typeParam),
    [skills, categoryParam, complexityParam, typeParam]
  );
  const assets = useMemo(() => filteredSkills.map(skillToAsset), [filteredSkills]);

  // Stats cards configuration
  const statsCards: StatCardConfig[] = [
    { label: 'Total', value: stats.total },
    { label: 'Active', value: stats.active, icon: CheckCircle2, variant: 'success' },
    { label: 'Built-in', value: stats.builtin, icon: Cog, variant: 'purple' },
    { label: 'Custom', value: stats.custom, icon: Sparkles, variant: 'info' },
    { label: 'Advanced', value: (stats.byComplexity['advanced'] || 0) + (stats.byComplexity['expert'] || 0), icon: Zap, variant: 'orange' },
    { label: 'Categories', value: Object.keys(stats.byCategory).length, icon: Database, variant: 'cyan' },
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
    const skill = skills.find(s => s.id === asset.id);
    if (skill?.slug) {
      router.push(`/discover/skills/${skill.slug}`);
    }
  };

  const handleCreateSkill = () => {
    setEditingSkill({ ...DEFAULT_SKILL_VALUES });
    setError(null);
    setIsModalOpen(true);
  };

  const handleEditSkill = (asset: VitalAsset) => {
    const skill = skills.find(s => s.id === asset.id);
    if (skill) {
      setEditingSkill(skill as unknown as Partial<SkillSchema>);
      setError(null);
      setIsModalOpen(true);
    }
  };

  const handleSaveSkill = async (data: SkillSchema) => {
    setIsSaving(true);
    setError(null);

    try {
      const isUpdate = !!data.id;
      const url = isUpdate ? `/api/skills/${data.id}` : '/api/skills';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save skill');

      await loadSkills();
      setIsModalOpen(false);
      setEditingSkill(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save skill');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = (asset: VitalAsset) => {
    const skill = skills.find(s => s.id === asset.id);
    if (skill) {
      setSkillToDelete(skill as unknown as Partial<SkillSchema>);
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteSkill = async () => {
    if (!skillToDelete?.id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/skills/${skillToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete skill');
      }

      await loadSkills();
      setDeleteConfirmOpen(false);
      setSkillToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
    } finally {
      setIsDeleting(false);
    }
  };

  // Batch selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredSkills.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSkills.map(s => s.id).filter(Boolean) as string[]));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/skills/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      await loadSkills();

      setBatchDeleteConfirmOpen(false);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skills');
    } finally {
      setIsDeleting(false);
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Action Bar */}
      <div className="flex items-center gap-4 px-6 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex-1" />

        {/* Batch Selection Controls */}
        {isSelectionMode ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
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
                  onClick={() => setIsSelectionMode(true)}
                >
                  Select
                </Button>
                <Button onClick={handleCreateSkill} size="sm" className="gap-2">
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
            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
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

              {/* Complexity Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Complexity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(COMPLEXITY_BADGES).map(([level, config]) => {
                      const count = stats.byComplexity[level] || 0;
                      const Icon = config.icon;
                      return (
                        <div key={level} className="flex items-center gap-3">
                          <Icon className="h-8 w-8 text-gray-400" />
                          <div>
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-sm text-gray-500">{config.label}</div>
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
                  const skill = skills.find(s => s.id === item.id);
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
              gridColumns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
              kanbanDraggable={isAdmin}
              onAssetClick={handleSkillClick}
              onEdit={handleEditSkill}
              onDelete={handleDeleteConfirm}
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingSkill(null);
          setError(null);
        }}
        skill={editingSkill}
        onSave={handleSaveSkill}
        isSaving={isSaving}
        error={error}
      />

      <SkillDeleteModalV2
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setSkillToDelete(null);
        }}
        skill={skillToDelete}
        onConfirm={handleDeleteSkill}
        isDeleting={isDeleting}
      />

      <SkillBatchDeleteModal
        isOpen={batchDeleteConfirmOpen}
        onClose={() => setBatchDeleteConfirmOpen(false)}
        count={selectedIds.size}
        onConfirm={handleBatchDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// Loading fallback
function SkillsPageLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading skills...</p>
      </div>
    </div>
  );
}

// Page component with Suspense
export default function SkillsPage() {
  return (
    <Suspense fallback={<SkillsPageLoading />}>
      <SkillsPageContent />
    </Suspense>
  );
}

// Prompts Library - Using VitalAssetView pattern
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';
import { AssetOverviewStats, StatCardConfig } from '@/components/shared/AssetOverviewStats';
import { RecentAssetsCard, RecentAssetItem } from '@/components/shared/RecentAssetsCard';
import { ActiveFiltersBar } from '@/components/shared/ActiveFiltersBar';
import { useAssetFilters } from '@/hooks/useAssetFilters';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Shield,
  Plus,
  Loader2,
  BookOpen,
  Star,
  TrendingUp,
  Search,
  LayoutGrid,
  List,
  Table2,
  Columns,
  RefreshCw,
  ArrowUpDown,
  Trash2,
  Pencil,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';

// Import shared asset view from @vital/ai-ui
import { VitalAssetView, type VitalAsset } from '@vital/ai-ui';

// Import prompts feature components
import {
  PromptEditModal,
  PromptDeleteModal,
  PRISM_SUITES,
  getSuiteByCode,
  DEFAULT_PROMPT,
  type Prompt,
  type SubSuite,
} from '@/features/prompts/components';

// Complexity badges
const COMPLEXITY_BADGES: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle2; label: string }> = {
  basic: { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle2, label: 'Basic' },
  intermediary: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Clock, label: 'Intermediary' },
  intermediate: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Clock, label: 'Intermediate' },
  advanced: { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Zap, label: 'Advanced' },
  expert: { color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertCircle, label: 'Expert' },
};

// Kanban columns grouped by PRISM Suite
const KANBAN_COLUMNS_BY_SUITE = PRISM_SUITES.slice(0, 5).map((suite) => ({
  id: suite.code,
  title: suite.name,
  filter: (asset: VitalAsset) => {
    const assetSuite = asset.metadata?.suite as string || asset.category || '';
    return assetSuite === suite.name || assetSuite === suite.code || assetSuite.replace('™', '') === suite.code;
  },
  color: suite.textColor,
  bgColor: suite.bgColor,
}));

// Convert prompt to VitalAsset format
function promptToAsset(prompt: Prompt): VitalAsset {
  const suiteConfig = getSuiteByCode(prompt.suite?.replace('™', '') || null);
  const complexity = prompt.complexity || prompt.complexity_level || 'basic';
  const complexityConfig = COMPLEXITY_BADGES[complexity] || COMPLEXITY_BADGES.basic;

  return {
    id: prompt.id || '',
    name: prompt.display_name || prompt.title || prompt.name,
    slug: prompt.id || '',
    asset_type: 'prompt',
    description: prompt.description || '',
    category: prompt.suite || prompt.domain || 'General',
    lifecycle_stage: prompt.status || 'active',
    is_active: prompt.is_active ?? true,
    created_at: prompt.created_at,
    updated_at: prompt.updated_at,
    metadata: {
      suite: prompt.suite,
      sub_suite: prompt.sub_suite,
      complexity,
      expert_validated: prompt.expert_validated,
      rag_enabled: prompt.rag_enabled,
      tags: prompt.tags,
      suiteIcon: suiteConfig?.icon,
      suiteColor: suiteConfig?.color,
      complexityLabel: complexityConfig.label,
      complexityColor: complexityConfig.bgColor,
    },
  } as VitalAsset;
}

// Filter prompts based on URL params
function filterPromptsByParams(
  prompts: Prompt[],
  suite: string | null,
  subSuite: string | null,
  complexity: string | null,
  status: string | null
): Prompt[] {
  let filtered = [...prompts];

  if (suite) {
    const suiteWithTM = suite.includes('™') ? suite : suite + '™';
    filtered = filtered.filter((p) => {
      const promptSuite = p.suite || '';
      return promptSuite === suiteWithTM || promptSuite === suite || promptSuite.replace('™', '') === suite;
    });
  }

  if (subSuite) {
    filtered = filtered.filter((p) => p.sub_suite === subSuite);
  }

  if (complexity) {
    filtered = filtered.filter((p) => {
      const promptComplexity = p.complexity || p.complexity_level || 'basic';
      return promptComplexity === complexity;
    });
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status || (status === 'active' && p.is_active));
  }

  return filtered;
}

// Inner component that uses useSearchParams
function PromptsPageContent() {
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
    setFilter,
    activeFilters,
    removeFilter,
    clearAllFilters,
  } = useAssetFilters({
    basePath: '/prompts',
    filterKeys: ['suite', 'subSuite', 'complexity', 'status'],
  });

  const suiteParam = getFilterParam('suite');
  const subSuiteParam = getFilterParam('subSuite');
  const complexityParam = getFilterParam('complexity');
  const statusParam = getFilterParam('status');

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [subSuites, setSubSuites] = useState<SubSuite[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    validated: 0,
    ragEnabled: 0,
    bySuite: {} as Record<string, number>,
    byComplexity: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);

      // Load prompts
      const response = await fetch('/api/prompts-crud?showAll=true');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      const allPrompts = data.prompts || [];
      setPrompts(allPrompts);

      // Try to load sub-suites from PRISM API
      try {
        const prismResponse = await fetch('/api/prism');
        if (prismResponse.ok) {
          const prismData = await prismResponse.json();
          if (prismData.subSuites) {
            setSubSuites(prismData.subSuites);
          }
        }
      } catch {
        // Sub-suites are optional
      }

      // Calculate stats
      const bySuite: Record<string, number> = {};
      const byComplexity: Record<string, number> = {};

      allPrompts.forEach((prompt: Prompt) => {
        const suite = prompt.suite || 'Unknown';
        bySuite[suite] = (bySuite[suite] || 0) + 1;

        const complexity = prompt.complexity || prompt.complexity_level || 'basic';
        byComplexity[complexity] = (byComplexity[complexity] || 0) + 1;
      });

      setStats({
        total: allPrompts.length,
        active: allPrompts.filter((p: Prompt) => p.is_active !== false).length,
        validated: allPrompts.filter((p: Prompt) => p.expert_validated).length,
        ragEnabled: allPrompts.filter((p: Prompt) => p.rag_enabled).length,
        bySuite,
        byComplexity,
      });
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter prompts and convert to assets
  const filteredPrompts = useMemo(() =>
    filterPromptsByParams(prompts, suiteParam, subSuiteParam, complexityParam, statusParam),
    [prompts, suiteParam, subSuiteParam, complexityParam, statusParam]
  );

  // Apply search filter
  const searchFilteredPrompts = useMemo(() => {
    if (!searchParam) return filteredPrompts;
    const query = searchParam.toLowerCase();
    return filteredPrompts.filter(p =>
      (p.display_name || p.name || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query) ||
      (p.tags || []).some(tag => tag.toLowerCase().includes(query))
    );
  }, [filteredPrompts, searchParam]);

  const assets = useMemo(() => searchFilteredPrompts.map(promptToAsset), [searchFilteredPrompts]);

  // Stats cards configuration
  const statsCards: StatCardConfig[] = [
    { label: 'Total', value: stats.total },
    { label: 'Active', value: stats.active, icon: CheckCircle2, variant: 'success' },
    { label: 'Validated', value: stats.validated, icon: Star, variant: 'purple' },
    { label: 'RAG Enabled', value: stats.ragEnabled, icon: BookOpen, variant: 'info' },
    { label: 'Advanced+', value: (stats.byComplexity['advanced'] || 0) + (stats.byComplexity['expert'] || 0), icon: Zap, variant: 'orange' },
    { label: 'Suites', value: Object.keys(stats.bySuite).length, icon: TrendingUp, variant: 'cyan' },
  ];

  // Recent prompts for overview
  const recentPrompts: RecentAssetItem[] = searchFilteredPrompts.slice(0, 6).map((prompt) => {
    const complexity = prompt.complexity || prompt.complexity_level || 'basic';
    const config = COMPLEXITY_BADGES[complexity] || COMPLEXITY_BADGES.basic;
    return {
      id: prompt.id || '',
      name: prompt.display_name || prompt.title || prompt.name,
      description: prompt.description,
      category: prompt.suite || 'General',
      badges: [
        { label: config.label, className: `${config.bgColor} ${config.color}` },
        ...(prompt.expert_validated ? [{ label: 'Validated', className: 'bg-green-100 text-green-700' }] : []),
      ],
    };
  });

  // Navigation handlers
  const handlePromptClick = (asset: VitalAsset) => {
    router.push(`/prompts/${asset.id}`);
  };

  const handleCreatePrompt = () => {
    setEditingPrompt({ ...DEFAULT_PROMPT });
    setError(null);
    setIsModalOpen(true);
  };

  const handleEditPrompt = (asset: VitalAsset) => {
    router.push(`/prompts/${asset.id}?edit=true`);
  };

  const handleSavePrompt = async () => {
    if (!editingPrompt) return;

    // Validation
    if (!editingPrompt.name?.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: editingPrompt.name.trim(),
        display_name: editingPrompt.display_name?.trim() || editingPrompt.name.trim(),
        description: editingPrompt.description?.trim() || '',
        content: editingPrompt.content || '',
        system_prompt: editingPrompt.system_prompt || '',
        user_prompt_template: editingPrompt.user_template || '',
        domain: editingPrompt.domain || 'general',
        complexity_level: editingPrompt.complexity || 'basic',
        tags: editingPrompt.tags || [],
        status: 'active',
      };

      const isUpdate = !!editingPrompt.id;
      const method = isUpdate ? 'PUT' : 'POST';
      const body = isUpdate ? { id: editingPrompt.id, ...payload } : payload;

      const response = await fetch('/api/prompts-crud', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save prompt');

      await loadPrompts();
      setIsModalOpen(false);
      setEditingPrompt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = (asset: VitalAsset) => {
    const prompt = prompts.find(p => p.id === asset.id);
    if (prompt) {
      setPromptToDelete(prompt);
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/prompts-crud?id=${promptToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete prompt');
      }

      await loadPrompts();
      setDeleteConfirmOpen(false);
      setPromptToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle suite filter change (used in overview Suite Distribution cards)
  const handleSuiteChange = (suiteCode: string | null) => {
    if (suiteCode) {
      setFilter('suite', suiteCode);
    } else {
      removeFilter('suite');
    }
    // Clear sub-suite when suite changes
    if (subSuiteParam) {
      removeFilter('subSuite');
    }
  };

  // Batch selection handlers
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectPrompt = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAllPrompts = () => {
    if (selectedIds.size === searchFilteredPrompts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(searchFilteredPrompts.map(p => p.id || '')));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsSaving(true);
    try {
      // Delete prompts one by one (could be optimized with batch API)
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/prompts-crud?id=${id}`, { method: 'DELETE' })
      );

      const results = await Promise.allSettled(deletePromises);
      const failures = results.filter(r => r.status === 'rejected').length;

      if (failures > 0) {
        setError(`Failed to delete ${failures} prompt(s)`);
      }

      await loadPrompts();
      setBatchDeleteConfirmOpen(false);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompts');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <VitalBreadcrumb showHome items={[{ label: 'Prompts' }]} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // View mode icons
  const VIEW_ICONS = {
    grid: LayoutGrid,
    list: List,
    table: Table2,
    kanban: Columns,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Compact Header with Breadcrumb, Search, and Actions */}
      <div className="flex items-center gap-4 px-6 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Breadcrumb */}
        <VitalBreadcrumb
          showHome
          items={[{ label: 'Prompts' }]}
        />

        {/* Search - only show in non-overview modes */}
        {!isOverviewMode && (
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts by name..."
                value={searchParam || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>
        )}

        {/* Spacer for overview mode */}
        {isOverviewMode && <div className="flex-1" />}

        {/* View controls - only show in non-overview modes */}
        {!isOverviewMode && (
          <div className="flex items-center gap-1 border rounded-md p-0.5">
            {(['grid', 'list', 'table', 'kanban'] as const).map((mode) => {
              const Icon = VIEW_ICONS[mode];
              const isActive = viewParam === mode;
              return (
                <Button
                  key={mode}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleViewModeChange(mode)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        )}

        {/* Refresh button */}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={loadPrompts}>
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Selection mode toggle (admin only) */}
        {isAdmin && !isOverviewMode && (
          <Button
            variant={isSelectionMode ? 'secondary' : 'outline'}
            size="sm"
            className="gap-2 h-8"
            onClick={toggleSelectionMode}
          >
            {isSelectionMode ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
            {isSelectionMode ? 'Cancel' : 'Select'}
          </Button>
        )}

        {/* Create button */}
        {isAdmin && (
          <Button onClick={handleCreatePrompt} size="sm" className="gap-2 h-8">
            <Plus className="h-4 w-4" />
            Create
          </Button>
        )}
      </div>

      {/* Batch Actions Bar - Show when in selection mode */}
      {isSelectionMode && isAdmin && (
        <div className="flex items-center gap-4 px-6 py-2 border-b bg-blue-50 dark:bg-blue-950">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.size === searchFilteredPrompts.length && searchFilteredPrompts.length > 0}
              onCheckedChange={selectAllPrompts}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm font-medium">
              {selectedIds.size === 0
                ? 'Select prompts'
                : `${selectedIds.size} selected`}
            </span>
          </div>
          <div className="flex-1" />
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 h-8"
                onClick={() => setBatchDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedIds.size})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Bar - only show when filters are active */}
      {activeFilters.length > 0 && (
        <div className="px-6 py-2 border-b bg-muted/30">
          <ActiveFiltersBar
            filters={activeFilters}
            filteredCount={searchFilteredPrompts.length}
            totalCount={stats.total}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            colorScheme="blue"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
          {/* Overview Mode */}
          {isOverviewMode && (
            <>
              <AssetOverviewStats stats={statsCards} />

              {/* Suite Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Suite Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {PRISM_SUITES.slice(0, 5).map((suite) => {
                      const count = stats.bySuite[suite.name] || stats.bySuite[suite.code] || 0;
                      const Icon = suite.icon;
                      return (
                        <button
                          key={suite.code}
                          onClick={() => handleSuiteChange(suite.code)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${suite.borderColor}`}
                        >
                          <Icon className={`h-6 w-6 ${suite.textColor}`} />
                          <div className="text-left">
                            <div className="text-xl font-bold">{count}</div>
                            <div className="text-xs text-muted-foreground">{suite.name}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Complexity Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Complexity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(COMPLEXITY_BADGES).filter(([key]) => !['intermediate'].includes(key)).map(([level, config]) => {
                      const count = stats.byComplexity[level] || 0;
                      const Icon = config.icon;
                      return (
                        <div key={level} className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <Icon className={`h-6 w-6 ${config.color}`} />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-sm text-muted-foreground">{config.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Prompts */}
              <RecentAssetsCard
                title="Recent Prompts"
                items={recentPrompts}
                onItemClick={(item) => router.push(`/prompts/${item.id}`)}
              />
            </>
          )}

          {/* Non-Overview Modes */}
          {!isOverviewMode && !isSelectionMode && (
            <VitalAssetView
              assets={assets}
              viewMode={(viewParam === 'overview' ? 'grid' : viewParam) || 'grid'}
              onViewModeChange={handleViewModeChange}
              showViewToggle={false}
              availableViews={['grid', 'list', 'table', 'kanban']}
              showSearch={false}
              showCategoryFilter={false}
              showSort={false}
              showRefresh={false}
              isAdmin={isAdmin}
              cardVariant="rich"
              gridColumns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
              kanbanColumns={KANBAN_COLUMNS_BY_SUITE}
              kanbanDraggable={isAdmin}
              onAssetClick={handlePromptClick}
              onEdit={handleEditPrompt}
              onDelete={handleDeleteConfirm}
            />
          )}

          {/* Selection Mode Grid */}
          {!isOverviewMode && isSelectionMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchFilteredPrompts.map((prompt) => {
                const isSelected = selectedIds.has(prompt.id || '');
                const suiteConfig = getSuiteByCode(prompt.suite?.replace('™', '') || null);
                const complexity = prompt.complexity || prompt.complexity_level || 'basic';
                const complexityConfig = COMPLEXITY_BADGES[complexity] || COMPLEXITY_BADGES.basic;
                const SuiteIcon = suiteConfig?.icon || BookOpen;

                return (
                  <Card
                    key={prompt.id}
                    className={`relative cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                    }`}
                    onClick={() => toggleSelectPrompt(prompt.id || '')}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-3 right-3 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectPrompt(prompt.id || '')}
                        className="data-[state=checked]:bg-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${suiteConfig?.bgColor || 'bg-gray-100'}`}>
                          <SuiteIcon className={`h-5 w-5 ${suiteConfig?.textColor || 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                          <CardTitle className="text-sm font-medium truncate">
                            {prompt.display_name || prompt.title || prompt.name}
                          </CardTitle>
                          {prompt.prompt_code && (
                            <p className="text-xs text-muted-foreground font-mono">{prompt.prompt_code}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {prompt.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {prompt.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {prompt.suite && (
                          <Badge variant="outline" className={`text-xs ${suiteConfig?.textColor}`}>
                            {prompt.suite.replace('™', '')}
                          </Badge>
                        )}
                        <Badge className={`text-xs ${complexityConfig.bgColor} ${complexityConfig.color}`}>
                          {complexityConfig.label}
                        </Badge>
                        {prompt.expert_validated && (
                          <Badge className="text-xs bg-green-100 text-green-700">Validated</Badge>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/prompts/${prompt.id}`);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/prompts/${prompt.id}?edit=true`);
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPromptToDelete(prompt);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PromptEditModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPrompt(null); setError(null); }}
        prompt={editingPrompt}
        onPromptChange={setEditingPrompt}
        onSave={handleSavePrompt}
        isSaving={isSaving}
        error={error}
      />

      <PromptDeleteModal
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setPromptToDelete(null); }}
        prompt={promptToDelete}
        onConfirm={handleDeletePrompt}
        isDeleting={isSaving}
      />

      {/* Batch Delete Confirmation Modal */}
      {batchDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Delete {selectedIds.size} Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete {selectedIds.size} selected prompt{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
              </p>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBatchDeleteConfirmOpen(false);
                    setError(null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBatchDelete}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete {selectedIds.size} Prompts
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Loading fallback
function PromptsPageLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading prompts...</p>
      </div>
    </div>
  );
}

// Page component with Suspense
export default function PromptsPage() {
  return (
    <Suspense fallback={<PromptsPageLoading />}>
      <PromptsPageContent />
    </Suspense>
  );
}

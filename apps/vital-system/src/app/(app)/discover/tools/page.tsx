/**
 * Healthcare Tools Registry - Brand Guidelines v6.0
 *
 * Design System:
 * - Primary Accent: #9055E0 (Warm Purple) via Tailwind purple-600
 * - Canvas: stone-50, Surface: white with stone-200 border
 * - Text: stone-600/700/800
 * - Transitions: 150ms for interactions
 *
 * Refactored: December 2025
 * - Extracted useToolsData and useToolsCRUD hooks
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
import { useToolsData, useToolsCRUD, filterToolsByParams, type Tool } from '@/features/discover/hooks';
import {
  Shield,
  Microscope,
  Heart,
  Brain,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Plus,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';

// Import shared asset view from @vital/ai-ui
import { VitalAssetView, type VitalAsset } from '@vital/ai-ui';

// Import tool modals from features
import {
  ToolEditModalV2,
  ToolDeleteModal,
  ToolBatchDeleteModal,
  DEFAULT_TOOL_VALUES,
} from '@/features/tools/components';

// Import Tool type from schema for consistency
import type { Tool as ToolSchema } from '@/lib/forms/schemas';

// Convert tool to VitalAsset format
function toolToAsset(tool: Tool): VitalAsset {
  return {
    id: tool.id,
    name: tool.name,
    slug: tool.code,
    asset_type: 'tool',
    description: tool.tool_description || tool.description,
    category: tool.category ?? undefined,
    lifecycle_stage: tool.lifecycle_stage,
    is_active: tool.is_active ?? true,
    created_at: tool.created_at,
    updated_at: tool.updated_at,
    metadata: tool.metadata,
  } as VitalAsset;
}

function ToolsPageContent() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  // Data hook
  const { tools, stats, loading, loadTools } = useToolsData();

  // CRUD hook
  const {
    isModalOpen,
    editingTool,
    isSaving,
    deleteConfirmOpen,
    toolToDelete,
    isDeleting,
    error,
    selectedIds,
    isSelectionMode,
    batchDeleteConfirmOpen,
    handleCreateTool,
    handleEditTool,
    handleSaveTool,
    handleDeleteConfirm,
    handleDeleteTool,
    closeModals,
    setError,
    exitSelectionMode,
    handleSelectAll,
    setSelectedIds,
    setBatchDeleteConfirmOpen,
    handleBatchDelete,
  } = useToolsCRUD();

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
    basePath: '/discover/tools',
    filterKeys: ['category', 'status', 'type'],
  });

  const categoryParam = getFilterParam('category');
  const statusParam = getFilterParam('status');
  const typeParam = getFilterParam('type');

  // Filter and convert tools
  const filteredTools = useMemo(
    () => filterToolsByParams(tools, categoryParam, statusParam, typeParam),
    [tools, categoryParam, statusParam, typeParam]
  );
  const assets = useMemo(() => filteredTools.map(toolToAsset), [filteredTools]);

  // Stats cards configuration - Brand v6.0 colors
  const statsCards: StatCardConfig[] = [
    { label: 'Total', value: stats.total },
    { label: 'Healthcare', value: stats.healthcare, icon: Heart, variant: 'success' },
    { label: 'Research', value: stats.research, icon: Microscope, variant: 'info' },
    { label: 'Production', value: stats.production, icon: CheckCircle2, variant: 'success' },
    { label: 'Testing', value: stats.testing, icon: Clock, variant: 'warning' },
    { label: 'Development', value: stats.development, icon: AlertCircle, variant: 'orange' },
  ];

  // Recent tools for overview
  const recentTools: RecentAssetItem[] = filteredTools.slice(0, 6).map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.tool_description || tool.description,
    category: tool.category || 'General',
    status: tool.lifecycle_stage,
    statusVariant: tool.lifecycle_stage === 'production' ? 'default' : 'secondary',
  }));

  // Navigation handlers
  const handleToolClick = (asset: VitalAsset) => {
    router.push(`/discover/tools/${asset.slug}`);
  };

  // Wrap CRUD handlers to work with assets
  const onEditTool = (asset: VitalAsset) => {
    const tool = tools.find((t) => t.id === asset.id);
    if (tool) handleEditTool(tool);
  };

  const onDeleteConfirm = (asset: VitalAsset) => {
    const tool = tools.find((t) => t.id === asset.id);
    if (tool) handleDeleteConfirm(tool);
  };

  const onSaveTool = async (data: ToolSchema) => {
    await handleSaveTool(data, loadTools);
  };

  const onDeleteTool = async () => {
    await handleDeleteTool(loadTools);
  };

  const onBatchDelete = async () => {
    await handleBatchDelete(loadTools);
  };

  const onSelectAll = () => {
    handleSelectAll(filteredTools.map((t) => t.id));
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
              {selectedIds.size === filteredTools.length ? 'Deselect All' : 'Select All'}
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
                  onClick={() => handleCreateTool(DEFAULT_TOOL_VALUES)}
                  size="sm"
                  className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Create Tool
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
                Admin mode: You can create, edit, and delete tools
              </span>
            </div>
          )}

          {/* Active Filters Bar */}
          <ActiveFiltersBar
            filters={activeFilters}
            filteredCount={filteredTools.length}
            totalCount={stats.total}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            colorScheme="purple"
          />

          {/* Overview Mode */}
          {isOverviewMode && (
            <>
              <AssetOverviewStats stats={statsCards} />

              {/* Healthcare Highlight Cards - Brand v6.0 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-rose-500 border border-stone-200 bg-white hover:border-rose-300 transition-colors duration-150">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-stone-700">
                      <Heart className="h-4 w-4 text-rose-500" />
                      FHIR Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-stone-800">{stats.fhir}</div>
                    <p className="text-xs text-stone-500">Healthcare interoperability</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 border border-stone-200 bg-white hover:border-purple-300 transition-colors duration-150">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-stone-700">
                      <Brain className="h-4 w-4 text-purple-500" />
                      Clinical NLP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-stone-800">{stats.nlp}</div>
                    <p className="text-xs text-stone-500">Natural language processing</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 border border-stone-200 bg-white hover:border-emerald-300 transition-colors duration-150">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-stone-700">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      De-identification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-stone-800">{stats.deidentification}</div>
                    <p className="text-xs text-stone-500">PHI protection tools</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lifecycle Stats - Brand v6.0 */}
              <Card className="border border-stone-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-stone-800">Lifecycle Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      <div>
                        <div className="text-2xl font-bold text-stone-800">{stats.production}</div>
                        <div className="text-sm text-stone-500">Production</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-amber-500" />
                      <div>
                        <div className="text-2xl font-bold text-stone-800">{stats.testing}</div>
                        <div className="text-sm text-stone-500">Testing</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-8 w-8 text-orange-500" />
                      <div>
                        <div className="text-2xl font-bold text-stone-800">{stats.development}</div>
                        <div className="text-sm text-stone-500">Development</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-8 w-8 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold text-stone-800">{stats.langchainTools}</div>
                        <div className="text-sm text-stone-500">LangChain</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tools */}
              <RecentAssetsCard
                title="Recent Tools"
                items={recentTools}
                onItemClick={(item) =>
                  router.push(`/discover/tools/${tools.find((t) => t.id === item.id)?.code}`)
                }
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
              searchPlaceholder="Search tools by name, description, or category..."
              searchValue={searchParam || ''}
              onSearchChange={handleSearchChange}
              showCategoryFilter={false}
              showSort
              showRefresh
              onRefresh={loadTools}
              isAdmin={isAdmin}
              cardVariant="rich"
              gridColumns={{ sm: 1, md: 2, lg: 3 }}
              kanbanDraggable={isAdmin}
              onAssetClick={handleToolClick}
              onEdit={onEditTool}
              onDelete={onDeleteConfirm}
              tableSelectable={isSelectionMode}
              selectedIds={Array.from(selectedIds)}
              onSelectionChange={(ids) => setSelectedIds(new Set(ids))}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ToolEditModalV2
        isOpen={isModalOpen}
        onClose={closeModals}
        tool={editingTool}
        onSave={onSaveTool}
        isSaving={isSaving}
        error={error}
      />

      <ToolDeleteModal
        isOpen={deleteConfirmOpen}
        onClose={closeModals}
        tool={toolToDelete}
        onConfirm={onDeleteTool}
        isDeleting={isDeleting}
      />

      <ToolBatchDeleteModal
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
function ToolsPageLoading() {
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
        <p className="text-stone-500">Loading tools...</p>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<ToolsPageLoading />}>
      <ToolsPageContent />
    </Suspense>
  );
}

// Healthcare Tools Registry - Using VitalAssetView
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';
import { AssetOverviewStats, StatCardConfig } from '@/components/shared/AssetOverviewStats';
import { RecentAssetsCard, RecentAssetItem } from '@/components/shared/RecentAssetsCard';
import { ActiveFiltersBar } from '@/components/shared/ActiveFiltersBar';
import { useAssetFilters } from '@/hooks/useAssetFilters';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import {
  Activity,
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
} from 'lucide-react';

// Import shared asset view from @vital/ai-ui
import { VitalAssetView, type VitalAsset } from '@vital/ai-ui';

// Import the Tool type
import type { Tool } from '@/lib/services/tool-registry-service';

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

// Filter tools based on URL params
function filterToolsByParams(
  tools: Tool[],
  category: string | null,
  status: string | null,
  type: string | null
): Tool[] {
  let filtered = [...tools];

  if (category) {
    const categoryLower = category.toLowerCase();
    filtered = filtered.filter((t) => {
      const toolCategory = (t.category || '').toLowerCase();
      switch (categoryLower) {
        case 'healthcare':
          return toolCategory.startsWith('healthcare') ||
                 t.category_parent === 'Healthcare' ||
                 ['edc_system', 'ctms', 'pro_registry'].includes(toolCategory);
        case 'research':
          return toolCategory === 'research' || toolCategory.startsWith('research');
        case 'fhir':
          return toolCategory === 'healthcare/fhir' || toolCategory === 'fhir';
        default:
          return toolCategory.includes(categoryLower);
      }
    });
  }

  if (status) {
    filtered = filtered.filter((t) => t.lifecycle_stage === status);
  }

  if (type) {
    const typeLower = type.toLowerCase();
    filtered = filtered.filter((t) => {
      switch (typeLower) {
        case 'langchain':
          return t.implementation_type === 'langchain_tool';
        case 'api':
          return t.tool_type === 'api' || t.implementation_type === 'api';
        default:
          return (t.tool_type || '').toLowerCase() === typeLower;
      }
    });
  }

  return filtered;
}

// Inner component that uses useSearchParams
function ToolsPageContent() {
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
    basePath: '/discover/tools',
    filterKeys: ['category', 'status', 'type'],
  });

  const categoryParam = getFilterParam('category');
  const statusParam = getFilterParam('status');
  const typeParam = getFilterParam('type');

  const [tools, setTools] = useState<Tool[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    healthcare: 0,
    research: 0,
    production: 0,
    testing: 0,
    development: 0,
    langchainTools: 0,
    tier1: 0,
    fhir: 0,
    nlp: 0,
    deidentification: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tools-crud');
      if (!response.ok) throw new Error('Failed to fetch tools');
      const data = await response.json();
      const allTools = data.tools || [];
      setTools(allTools);

      // Calculate stats
      const healthcareTools = allTools.filter((t: Tool) =>
        t.category?.startsWith('Healthcare') || t.category_parent === 'Healthcare'
      );
      const researchTools = allTools.filter((t: Tool) =>
        t.category === 'Research' || t.category?.startsWith('RESEARCH')
      );

      setStats({
        total: allTools.length,
        healthcare: healthcareTools.length,
        research: researchTools.length,
        production: allTools.filter((t: Tool) => t.lifecycle_stage === 'production').length,
        testing: allTools.filter((t: Tool) => t.lifecycle_stage === 'testing').length,
        development: allTools.filter((t: Tool) => t.lifecycle_stage === 'development').length,
        langchainTools: allTools.filter((t: Tool) => t.implementation_type === 'langchain_tool').length,
        tier1: allTools.filter((t: Tool) => t.metadata?.tier === 1).length,
        fhir: allTools.filter((t: Tool) => t.category?.includes('FHIR')).length,
        nlp: allTools.filter((t: Tool) => t.category?.includes('NLP')).length,
        deidentification: allTools.filter((t: Tool) => t.category?.includes('De-identification')).length,
      });
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and convert tools
  const filteredTools = useMemo(() =>
    filterToolsByParams(tools, categoryParam, statusParam, typeParam),
    [tools, categoryParam, statusParam, typeParam]
  );
  const assets = useMemo(() => filteredTools.map(toolToAsset), [filteredTools]);

  // Stats cards configuration
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

  const handleEditTool = (asset: VitalAsset) => {
    router.push(`/discover/tools/${asset.slug}?edit=true`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-2 border-b bg-background/95 backdrop-blur">
          <VitalBreadcrumb showHome items={[{ label: 'Discover', href: '/discover' }, { label: 'Tools' }]} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex items-center gap-4 px-6 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <VitalBreadcrumb
          showHome
          items={[{ label: 'Discover', href: '/discover' }, { label: 'Tools' }]}
        />
        <div className="flex-1" />
        {isAdmin && (
          <Button onClick={() => router.push('/discover/tools/new')} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Tool
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
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
            colorScheme="blue"
          />

          {/* Overview Mode */}
          {isOverviewMode && (
            <>
              <AssetOverviewStats stats={statsCards} />

              {/* Healthcare Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      FHIR Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.fhir}</div>
                    <p className="text-xs text-gray-500">Healthcare interoperability</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      Clinical NLP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.nlp}</div>
                    <p className="text-xs text-gray-500">Natural language processing</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      De-identification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.deidentification}</div>
                    <p className="text-xs text-gray-500">PHI protection tools</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lifecycle Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Lifecycle Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{stats.production}</div>
                        <div className="text-sm text-gray-500">Production</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold">{stats.testing}</div>
                        <div className="text-sm text-gray-500">Testing</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-8 w-8 text-orange-500" />
                      <div>
                        <div className="text-2xl font-bold">{stats.development}</div>
                        <div className="text-sm text-gray-500">Development</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{stats.langchainTools}</div>
                        <div className="text-sm text-gray-500">LangChain</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tools */}
              <RecentAssetsCard
                title="Recent Tools"
                items={recentTools}
                onItemClick={(item) => router.push(`/discover/tools/${tools.find(t => t.id === item.id)?.code}`)}
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
              gridColumns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
              kanbanDraggable={isAdmin}
              onAssetClick={handleToolClick}
              onEdit={handleEditTool}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function ToolsPageLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading tools...</p>
      </div>
    </div>
  );
}

// Page component with Suspense
export default function ToolsPage() {
  return (
    <Suspense fallback={<ToolsPageLoading />}>
      <ToolsPageContent />
    </Suspense>
  );
}

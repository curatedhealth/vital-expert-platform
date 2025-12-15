'use client';

/**
 * Agents Page
 *
 * Main agents listing page with multiple view modes
 * Refactored to use modular hooks from features/agents
 * Uses Brand Guidelines v6.0 styling
 */

import { Network, ArrowRightLeft, Plus, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@vital/ui';
import { VitalAssetView, type VitalAsset } from '@vital/ai-ui';
import { useAgentsFilter } from '@/contexts/agents-filter-context';
import { AgentsBoard } from '@/features/agents/components/agents-board';
import { AgentsOverview } from '@/features/agents/components/agents-overview';
import { AgentsTable } from '@/features/agents/components/agents-table';
import { KnowledgeGraphVisualization } from '@/features/agents/components/knowledge-graph-view';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { AgentEditFormEnhanced } from '@/features/agents/components/agent-edit-form-enhanced';
import { useAgentActions } from '@/features/agents/hooks';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useAgentsStore, type Agent } from '@/lib/stores/agents-store';
import { ActiveFiltersBar } from '@/components/shared/ActiveFiltersBar';

// Comparison components
import {
  AgentComparisonProvider,
  AgentComparisonSidebar,
  useAgentComparison,
} from '@/features/agents/components/agent-comparison-sidebar';
import { AgentComparison } from '@/features/agents/components/agent-comparison';

// Valid view types
const VALID_VIEWS = ['overview', 'grid', 'list', 'table', 'graph', 'compare'] as const;
type ViewType = typeof VALID_VIEWS[number];

// Helper to convert Agent to VitalAsset format
function agentToAsset(agent: Agent): VitalAsset {
  return {
    id: agent.id,
    name: agent.display_name || agent.name || 'Unknown Agent',
    slug: agent.slug,
    description: agent.description,
    category: agent.business_function || agent.department,
    is_active: agent.status === 'active',
    lifecycle_stage: agent.status === 'active' ? 'production' : 'development',
    tags: agent.capabilities || [],
    metadata: {
      tier: agent.tier,
      model: agent.model,
      avatar: agent.avatar,
      role: agent.role,
    },
    asset_type: 'agent',
  } as VitalAsset;
}

function AgentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, userProfile } = useAuth();
  const { agents } = useAgentsStore();

  // Filter context
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    filters,
    setFilters,
    multiFilters,
    setViewMode,
    clearFilters,
  } = useAgentsFilter();

  // Agent actions hook
  const {
    selectedAgent,
    editingAgent,
    setEditingAgent,
    showCreateModal,
    setShowCreateModal,
    showEnhancedEditModal,
    setShowEnhancedEditModal,
    handleAgentSelect,
    handleSaveAgentFromEnhanced,
    handleAddAgentToChat,
    refreshAgents,
  } = useAgentActions();

  // Comparison context
  const { comparisonAgents, removeFromComparison, clearComparison } = useAgentComparison();

  // Read view from URL params
  const viewParam = searchParams.get('view') || 'overview';
  const activeTab: ViewType = VALID_VIEWS.includes(viewParam as ViewType)
    ? (viewParam as ViewType)
    : 'overview';

  // Handle tab change via URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'overview') {
      params.set('view', value);
    } else {
      params.delete('view');
    }
    const queryString = params.toString();
    router.push(`/agents${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  // Handle URL parameters for modals
  useEffect(() => {
    const createParam = searchParams.get('create');
    const editParam = searchParams.get('edit');

    if (createParam === 'true') {
      setShowCreateModal(true);
      router.replace('/agents', { scroll: false });
    }

    if (editParam && agents.length > 0) {
      const agentToEdit = agents.find((a: any) => a.id === editParam || a.slug === editParam);
      if (agentToEdit) {
        setEditingAgent(agentToEdit);
        setShowEnhancedEditModal(true);
        router.replace('/agents', { scroll: false });
      }
    }
  }, [searchParams, router, agents, setShowCreateModal, setEditingAgent, setShowEnhancedEditModal]);

  // Filter agents based on multi-select filters
  const filteredAgents = useMemo(() => {
    return agents.filter((agent: any) => {
      const matchesSearch = !debouncedSearchQuery ||
        (agent.display_name || agent.name || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (agent.description || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesFunction = multiFilters.functions.size === 0 ||
        multiFilters.functions.has(agent.function_id) ||
        multiFilters.functions.has(agent.business_function) ||
        multiFilters.functions.has(agent.function_name);

      const matchesDepartment = multiFilters.departments.size === 0 ||
        multiFilters.departments.has(agent.department_id) ||
        multiFilters.departments.has(agent.department);

      const matchesRole = multiFilters.roles.size === 0 ||
        multiFilters.roles.has(agent.role_id) ||
        multiFilters.roles.has(agent.role);

      const matchesLevel = multiFilters.levels.size === 0 ||
        multiFilters.levels.has(String(agent.tier));

      const matchesStatus = multiFilters.statuses.size === 0 ||
        multiFilters.statuses.has(agent.status);

      return matchesSearch && matchesFunction && matchesDepartment && matchesRole && matchesLevel && matchesStatus;
    });
  }, [agents, debouncedSearchQuery, multiFilters]);

  // Convert agents to VitalAsset format for grid view
  const agentAssets = useMemo(() => filteredAgents.map(agentToAsset), [filteredAgents]);

  // Handler for asset click (converts back to agent)
  const handleAssetClick = useCallback((asset: VitalAsset) => {
    const agent = filteredAgents.find((a: Agent) => a.id === asset.id);
    if (agent) {
      handleAgentSelect(agent);
    }
  }, [filteredAgents, handleAgentSelect]);

  // Handler for asset edit
  const handleAssetEdit = useCallback((asset: VitalAsset) => {
    const agent = filteredAgents.find((a: Agent) => a.id === asset.id);
    if (agent) {
      setEditingAgent(agent);
      setShowEnhancedEditModal(true);
    }
  }, [filteredAgents, setEditingAgent, setShowEnhancedEditModal]);

  // Build active filters for display
  const activeFiltersForBar = useMemo(() => {
    const filtersList: { key: string; value: string; label: string }[] = [];
    multiFilters.functions.forEach(f => filtersList.push({ key: 'function', value: f, label: `Function: ${f}` }));
    multiFilters.departments.forEach(d => filtersList.push({ key: 'department', value: d, label: `Dept: ${d}` }));
    multiFilters.roles.forEach(r => filtersList.push({ key: 'role', value: r, label: `Role: ${r}` }));
    multiFilters.levels.forEach(l => filtersList.push({ key: 'level', value: l, label: `Level: L${l}` }));
    multiFilters.statuses.forEach(s => filtersList.push({ key: 'status', value: s, label: `Status: ${s}` }));
    return filtersList;
  }, [multiFilters]);

  const handleRemoveFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      const currentValues = params.get(key)?.split(',').filter(Boolean) || [];
      const newValues = currentValues.filter(v => v !== value);
      if (newValues.length > 0) {
        params.set(key, newValues.join(','));
      } else {
        params.delete(key);
      }
    } else {
      params.delete(key);
    }
    router.push(`/agents?${params.toString()}`, { scroll: false });
  };

  const handleClearAllFilters = () => {
    clearFilters();
    router.push('/agents', { scroll: false });
  };

  // Check if user is admin
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      {/* Action Bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-stone-200 bg-white">
        <div className="flex-1" />
        {isAdmin && (
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
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
                Admin mode: You can create, edit, and delete agents
              </span>
            </div>
          )}

          {/* Active Filters Bar */}
          <ActiveFiltersBar
            filters={activeFiltersForBar}
            filteredCount={filteredAgents.length}
            totalCount={agents.length}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
            colorScheme="purple"
          />

          {/* View Content */}
          {activeTab === 'overview' && <AgentsOverview />}

          {activeTab === 'grid' && (
            <VitalAssetView
              assets={agentAssets}
              viewMode="grid"
              showViewToggle={false}
              showSearch={false}
              showCategoryFilter={false}
              showSort={false}
              cardVariant="rich"
              gridColumns={{ sm: 1, md: 2, lg: 3 }}
              isAdmin={isAdmin}
              onAssetClick={handleAssetClick}
              onEdit={isAdmin ? handleAssetEdit : undefined}
            />
          )}

          {activeTab === 'list' && (
            <AgentsBoard
              onAgentSelect={handleAgentSelect}
              onAddToChat={(agent) => handleAddAgentToChat(agent, user?.id)}
              showCreateButton={false}
              hiddenControls={true}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFilterChange={setFilters}
              viewMode="list"
              onViewModeChange={setViewMode}
            />
          )}

          {activeTab === 'table' && (
            <AgentsTable
              onAgentSelect={handleAgentSelect}
              onAddToChat={(agent) => handleAddAgentToChat(agent, user?.id)}
            />
          )}

          {activeTab === 'graph' && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-stone-200">
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-stone-900">
                  <Network className="w-6 h-6 text-purple-600" />
                  Agent Knowledge Graph
                </h2>
                <p className="text-sm text-stone-600 mt-2">
                  Interactive visualization of agent relationships, skills, and knowledge domains.
                </p>
              </div>

              {selectedAgent ? (
                <KnowledgeGraphVisualization agentId={selectedAgent.id} height="700px" />
              ) : (
                <div className="border-2 border-dashed border-stone-300 rounded-lg p-12 text-center">
                  <Network className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-900 mb-2">No Agent Selected</h3>
                  <p className="text-stone-600 mb-6">
                    Select an agent from the Grid or Table view to visualize their knowledge graph
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => handleTabChange('grid')} className="bg-purple-600 hover:bg-purple-700">
                      Go to Grid View
                    </Button>
                    <Button variant="outline" onClick={() => handleTabChange('table')} className="border-stone-300">
                      Go to Table View
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-stone-200">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-stone-900">
                    <ArrowRightLeft className="w-6 h-6 text-purple-600" />
                    Agent Comparison
                  </h2>
                  <p className="text-sm text-stone-600 mt-2">
                    Compare agents side-by-side across all attributes.
                    {comparisonAgents && comparisonAgents.length === 0
                      ? ' Add agents using the compare button on agent cards.'
                      : ` Comparing ${comparisonAgents?.length || 0} agent${comparisonAgents?.length === 1 ? '' : 's'}.`}
                  </p>
                </div>
                {comparisonAgents && comparisonAgents.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearComparison} className="text-red-600 hover:text-red-700">
                    Clear All
                  </Button>
                )}
              </div>

              {comparisonAgents && comparisonAgents.length > 0 ? (
                <AgentComparison
                  agents={comparisonAgents}
                  onRemoveAgent={removeFromComparison}
                  onAddAgent={() => handleTabChange('grid')}
                  maxAgents={3}
                  showHierarchy={true}
                  showSimilarity={true}
                  className="min-h-[600px]"
                />
              ) : (
                <div className="border-2 border-dashed border-stone-300 rounded-lg p-12 text-center">
                  <ArrowRightLeft className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-900 mb-2">No Agents Selected</h3>
                  <p className="text-stone-600 mb-6 max-w-md mx-auto">
                    Select agents to compare by clicking the compare button on agent cards.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => handleTabChange('grid')} className="bg-purple-600 hover:bg-purple-700">
                      Go to Grid View
                    </Button>
                    <Button variant="outline" onClick={() => handleTabChange('list')} className="border-stone-300">
                      Go to List View
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <AgentCreator
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAgent(null);
          }}
          onSave={async () => {
            setShowCreateModal(false);
            setEditingAgent(null);
            await refreshAgents();
          }}
          editingAgent={editingAgent as any}
        />
      )}

      {/* Enhanced Agent Edit Modal */}
      <AgentEditFormEnhanced
        agent={editingAgent as any}
        open={showEnhancedEditModal}
        onOpenChange={(open) => {
          setShowEnhancedEditModal(open);
          if (!open) setEditingAgent(null);
        }}
        onSave={handleSaveAgentFromEnhanced as any}
      />
    </div>
  );
}

export default function AgentsPage() {
  return (
    <AgentComparisonProvider maxAgents={3}>
      <Suspense fallback={
        <div className="p-6 animate-pulse text-stone-600">Loading agents...</div>
      }>
        <AgentsPageContent />
      </Suspense>
      <AgentComparisonSidebar maxAgents={3} />
    </AgentComparisonProvider>
  );
}

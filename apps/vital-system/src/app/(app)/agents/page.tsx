'use client';

import { Network, ArrowRightLeft, Plus, Trash2, X, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { useAgentsFilter } from '@/contexts/agents-filter-context';
import { AgentsBoard } from '@/features/agents/components/agents-board';
import { AgentsOverview } from '@/features/agents/components/agents-overview';
import { AgentsTable } from '@/features/agents/components/agents-table';
import { KnowledgeGraphVisualization } from '@/features/agents/components/knowledge-graph-view';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { AgentEditFormEnhanced } from '@/features/agents/components/agent-edit-form-enhanced';
import { agentService } from '@/features/agents/services/agent-service';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { type Agent as AgentsStoreAgent, useAgentsStore } from '@/lib/stores/agents-store';
import { type Agent } from '@/lib/stores/chat-store';
import { type Agent as FeatureAgent } from '@/features/agents/types/agent.types';
import { ActiveFiltersBar } from '@/components/shared/ActiveFiltersBar';

// Import comparison components
import {
  AgentComparisonProvider,
  AgentComparisonSidebar,
  useAgentComparison,
} from '@/features/agents/components/agent-comparison-sidebar';
import { AgentComparison } from '@/features/agents/components/agent-comparison';

function AgentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const { createUserCopy, agents } = useAgentsStore();
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    filters,
    setFilters,
    multiFilters,
    setFunctions,
    setDepartments,
    setRoles,
    setLevels,
    setStatuses,
    viewMode,
    setViewMode,
    clearFilters,
  } = useAgentsFilter();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentsStoreAgent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnhancedEditModal, setShowEnhancedEditModal] = useState(false);

  // Read view from URL params (sync with sidebar)
  const viewParam = searchParams.get('view') || 'overview';
  const validViews = ['overview', 'grid', 'list', 'table', 'graph', 'compare'] as const;
  type ViewType = typeof validViews[number];
  const activeTab = validViews.includes(viewParam as ViewType) ? (viewParam as ViewType) : 'overview';

  // Get comparison context for the Compare tab
  const { comparisonAgents: comparisonAgentsRaw, removeFromComparison, clearComparison } = useAgentComparison();
  const comparisonAgents = comparisonAgentsRaw || [];

  // Handle tab change via URL navigation (syncs with sidebar)
  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'overview') {
      params.set('view', value);
    } else {
      params.delete('view');
    }
    const queryString = params.toString();
    router.push(`/agents${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  // Handle query parameters for opening create/edit modals
  useEffect(() => {
    const createParam = searchParams.get('create');
    const uploadParam = searchParams.get('upload');
    const editParam = searchParams.get('edit');

    if (createParam === 'true') {
      setShowCreateModal(true);
      // Clear the URL parameter
      router.replace('/agents', { scroll: false });
    }

    if (uploadParam === 'true') {
      // Handle upload functionality here
      // Clear the URL parameter
      router.replace('/agents', { scroll: false });
    }

    // Handle edit parameter - open enhanced edit modal for specified agent
    if (editParam && agents.length > 0) {
      const agentToEdit = agents.find((a: any) => a.id === editParam || a.slug === editParam);
      if (agentToEdit) {
        console.log('🔧 [Edit] Opening edit modal for agent from URL param:', agentToEdit.id);
        setEditingAgent(agentToEdit as AgentsStoreAgent);
        setShowEnhancedEditModal(true);
        // Clear the URL parameter to prevent re-opening on refresh
        router.replace('/agents', { scroll: false });
      } else {
        console.warn('⚠️ [Edit] Agent not found for edit param:', editParam);
        // Clear invalid edit param
        router.replace('/agents', { scroll: false });
      }
    }
  }, [searchParams, router, agents]);

  // Filter agents based on multi-select filters
  // Uses debouncedSearchQuery (300ms delay) to prevent excessive re-filtering while typing
  const filteredAgents = useMemo(() => {
    return agents.filter((agent: any) => {
      // Search filter (uses debounced value for performance)
      const matchesSearch = !debouncedSearchQuery ||
        (agent.display_name || agent.name || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (agent.description || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      // Multi-select function filter
      const matchesFunction = multiFilters.functions.size === 0 ||
        multiFilters.functions.has(agent.function_id) ||
        multiFilters.functions.has(agent.business_function) ||
        multiFilters.functions.has(agent.function_name);

      // Multi-select department filter
      const matchesDepartment = multiFilters.departments.size === 0 ||
        multiFilters.departments.has(agent.department_id) ||
        multiFilters.departments.has(agent.department) ||
        multiFilters.departments.has(agent.department_name);

      // Multi-select role filter
      const matchesRole = multiFilters.roles.size === 0 ||
        multiFilters.roles.has(agent.role_id) ||
        multiFilters.roles.has(agent.role) ||
        multiFilters.roles.has(agent.role_name);

      // Multi-select level filter
      const matchesLevel = multiFilters.levels.size === 0 ||
        multiFilters.levels.has(agent.agent_level_id) ||
        multiFilters.levels.has(String(agent.agent_level)) ||
        multiFilters.levels.has(agent.agent_level_name) ||
        multiFilters.levels.has(String(agent.tier));

      // Multi-select status filter
      const matchesStatus = multiFilters.statuses.size === 0 ||
        multiFilters.statuses.has(agent.status);

      return matchesSearch && matchesFunction && matchesDepartment && matchesRole && matchesLevel && matchesStatus;
    });
  }, [agents, debouncedSearchQuery, multiFilters]);

  const handleAgentSelect = (agent: AgentsStoreAgent) => {
    // Navigate to the agent detail page instead of opening a modal
    const identifier = (agent as any).slug || agent.id;
    router.push(`/agents/${identifier}`);
  };

  const handleEditAgent = async (agent: Agent) => {
    // Fetch full agent data from Supabase to pre-fill all form fields
    // The chat-store Agent has limited fields, so we need the complete data
    console.log('🔍 [Edit] Fetching full agent data for:', agent.id);

    try {
      // First try to get from store (already loaded)
      const { getAgentById } = useAgentsStore.getState();
      let fullAgent = getAgentById(agent.id);

      if (fullAgent) {
        console.log('✅ [Edit] Found agent in store with full data');
      } else {
        // Fallback: fetch directly from API
        console.log('🔄 [Edit] Agent not in store, fetching from API...');
        const response = await fetch(`/api/agents/${agent.id}`);
        if (response.ok) {
          const data = await response.json();
          fullAgent = data.agent || data;
          console.log('✅ [Edit] Fetched full agent from API');
        }
      }

      if (fullAgent) {
        // Use the full agent data - no lossy conversion needed
        setEditingAgent(fullAgent as AgentsStoreAgent);
        console.log('📝 [Edit] Setting editingAgent with full data:', {
          id: fullAgent.id,
          name: fullAgent.name,
          hasAvatarUrl: !!(fullAgent as any).avatar_url,
          hasFunctionId: !!(fullAgent as any).function_id,
          hasDepartmentId: !!(fullAgent as any).department_id,
          hasRoleId: !!(fullAgent as any).role_id,
          hasSystemPrompt: !!(fullAgent as any).system_prompt,
        });
      } else {
        // Fallback to minimal conversion if all else fails
        console.warn('⚠️ [Edit] Could not fetch full agent, using minimal data');
        const agentForEditing: AgentsStoreAgent = {
          id: agent.id,
          name: agent.name,
          display_name: agent.name,
          description: agent.description,
          system_prompt: agent.systemPrompt || '',
          model: agent.model || 'gpt-4',
          avatar: agent.avatar || '',
          color: agent.color || 'text-market-purple',
          capabilities: agent.capabilities || [],
          rag_enabled: agent.ragEnabled ?? true, // RAG enabled by default for all agents
          temperature: agent.temperature || 0.7,
          max_tokens: agent.maxTokens || 2000,
          knowledge_domains: agent.knowledgeDomains || [],
          business_function: agent.businessFunction || '',
          role: agent.role || '',
          status: 'active',
          tier: agent.tier || 1,
          priority: 1,
          implementation_phase: 1,
          is_custom: agent.isCustom || false,
        };
        setEditingAgent(agentForEditing);
      }

      setShowEnhancedEditModal(true);
      setSelectedAgent(null); // Close the details modal
    } catch (error) {
      console.error('❌ [Edit] Error fetching full agent data:', error);
      // Show error to user
      alert('Failed to load agent data for editing. Please try again.');
    }
  };

  // Handle saving agent updates from the enhanced edit form
  const handleSaveAgentFromEnhanced = async (updates: Partial<FeatureAgent>) => {
    if (!editingAgent) {
      console.error('[AgentsPage] No editing agent set');
      throw new Error('No agent selected for editing');
    }
    try {
      console.log('[AgentsPage] Saving agent updates:', {
        agentId: editingAgent.id,
        agentName: editingAgent.name,
        updateFields: Object.keys(updates),
      });
      // Type cast needed: FeatureAgent.metadata is Record<string,unknown>, but service expects Supabase Json type
      await agentService.updateAgent(editingAgent.id, updates as Parameters<typeof agentService.updateAgent>[1]);
      console.log('[AgentsPage] Agent saved successfully');
      setShowEnhancedEditModal(false);
      setEditingAgent(null);
      // Invalidate queries and reload agents store instead of hard refresh
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      await useAgentsStore.getState().loadAgents(false);
    } catch (error) {
      console.error('[AgentsPage] Failed to save agent:', error);
      throw error;
    }
  };

  const handleAddAgentToChat = async (agent: AgentsStoreAgent) => {
    try {
      console.log('🔍 [Add to Chat] Adding agent to user list:', {
        id: agent.id,
        name: agent.display_name
      });

      // Check if user is authenticated
      if (!user?.id) {
        console.error('❌ User not authenticated. Please log in first.');
        alert('Please log in to add agents to your chat list.');
        return;
      }

      console.log('✅ [Add to Chat] Authenticated user adding agent');

      // Validate agent ID format (must be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!agent.id || !uuidRegex.test(agent.id)) {
        console.error('❌ Invalid agent ID format:', agent.id);
        alert('This agent has an invalid ID format and cannot be added. Please contact support.');
        return;
      }

      // Prepare request payload
      const requestPayload: any = {
        userId: user.id,
        agentId: agent.id,
        isUserCopy: agent.is_user_copy || false,
      };

      // Only include originalAgentId if it's a valid UUID
      if (agent.original_agent_id && uuidRegex.test(agent.original_agent_id)) {
        requestPayload.originalAgentId = agent.original_agent_id;
      }

      console.log('📤 [Add to Chat] Sending request:', {
        url: '/api/user-agents',
        method: 'POST',
        payload: requestPayload,
      });

      // Add agent to user's list via API
      const response = await fetch('/api/user-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorData: any = {};
        let errorText = '';

        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            errorText = await response.text();
            console.log('📄 [Add to Chat] Raw response:', errorText);

            // Try to parse as JSON even if content-type doesn't say so
            if (errorText) {
              try {
                errorData = JSON.parse(errorText);
              } catch (parseError) {
                console.warn('⚠️ [Add to Chat] Response is not JSON:', errorText);
                errorData = { error: errorText, message: errorText };
              }
            }
          }
        } catch (readError) {
          console.error('❌ [Add to Chat] Failed to read response:', readError);
          errorData = {
            error: 'Failed to read error response',
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        // Better error logging with all available information
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData || {},
          errorText: errorText || 'No error text available',
          errorMessage: errorData?.error || errorData?.message || errorData?.details?.message || errorText || 'Unknown error',
          errorCode: errorData?.code,
          requestId: errorData?.requestId,
        };

        console.error('❌ Failed to add agent to chat:', errorDetails);

        if (response.status === 409) {
          console.log(`ℹ️ Agent "${agent.display_name}" is already in your chat list`);
          alert(`"${agent.display_name}" is already in your chat list.`);
          return;
        } else if (response.status === 503) {
          // Service unavailable - likely missing table or Supabase config
          const message = errorData?.message || errorData?.error || 'Database service is temporarily unavailable.';
          console.warn('⚠️ [Add to Chat] Service unavailable:', message);
          alert(`Service temporarily unavailable:\n\n${message}\n\nThe agent may still be available in your chat list.`);
          // Still try to navigate - the agent might be available via fallback
          queryClient.invalidateQueries({ queryKey: ['user-agents', user.id] });
          router.push('/chat');
          return;
        } else {
          // Construct user-friendly error message
          let errorMessage = 'Unknown error';

          if (errorData?.errors && typeof errorData.errors === 'object') {
            // Validation errors object
            errorMessage = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`)
              .join('\n');
          } else if (errorData?.error) {
            errorMessage = errorData.error;
            if (errorData?.message && errorData.message !== errorData.error) {
              errorMessage += `\n${errorData.message}`;
            }
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorText) {
            errorMessage = errorText.substring(0, 200); // Limit length
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }

          console.error('❌ [Add to Chat] Error details:', {
            status: response.status,
            errorMessage,
            errorData,
          });

          alert(`Failed to add agent:\n\n${errorMessage}\n\nStatus: ${response.status} ${response.statusText}`);
        }

        // Don't navigate if there's an error - let user see the error and retry
        return;
      }

      const result = await response.json();
      console.log(`✅ Agent "${agent.display_name}" added to user's chat list:`, result);

      // Invalidate the React Query cache so the chat page will refetch agents
      queryClient.invalidateQueries({ queryKey: ['user-agents', user.id] });
      console.log('🔄 [Add to Chat] Invalidated React Query cache for user agents');

      alert(`✅ "${agent.display_name}" has been added to your chat list!`);

      // Navigate to chat page to see the added agent
      router.push('/chat');

    } catch (error) {
      console.error('❌ Failed to add agent to chat:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // Check if user is admin
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  // Build active filters for display
  const activeFiltersForBar = useMemo(() => {
    const filters: { key: string; value: string; label: string }[] = [];
    if (multiFilters.functions.size > 0) {
      multiFilters.functions.forEach(f => filters.push({ key: 'function', value: f, label: `Function: ${f}` }));
    }
    if (multiFilters.departments.size > 0) {
      multiFilters.departments.forEach(d => filters.push({ key: 'department', value: d, label: `Dept: ${d}` }));
    }
    if (multiFilters.roles.size > 0) {
      multiFilters.roles.forEach(r => filters.push({ key: 'role', value: r, label: `Role: ${r}` }));
    }
    if (multiFilters.levels.size > 0) {
      multiFilters.levels.forEach(l => filters.push({ key: 'level', value: l, label: `Level: L${l}` }));
    }
    if (multiFilters.statuses.size > 0) {
      multiFilters.statuses.forEach(s => filters.push({ key: 'status', value: s, label: `Status: ${s}` }));
    }
    return filters;
  }, [multiFilters]);

  const handleRemoveFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      // Multi-select filter: remove specific value from comma-separated list
      const currentValues = params.get(key)?.split(',').filter(Boolean) || [];
      const newValues = currentValues.filter(v => v !== value);
      if (newValues.length > 0) {
        params.set(key, newValues.join(','));
      } else {
        params.delete(key);
      }
    } else {
      // Single-select filter: just remove the key
      params.delete(key);
    }
    router.push(`/agents?${params.toString()}`, { scroll: false });
  };

  const handleClearAllFilters = () => {
    clearFilters();
    router.push('/agents', { scroll: false });
  };

  // Determine if we're in overview mode
  const isOverviewMode = activeTab === 'overview';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Action Bar */}
      <div className="flex items-center gap-4 px-6 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex-1" />

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </div>
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
            colorScheme="blue"
          />

          {/* Overview Mode */}
          {isOverviewMode && (
            <AgentsOverview />
          )}

          {/* Grid View */}
          {activeTab === 'grid' && (
            <AgentsBoard
              onAgentSelect={handleAgentSelect}
              onAddToChat={handleAddAgentToChat}
              showCreateButton={false}
              hiddenControls={true}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFilterChange={setFilters}
              viewMode="grid"
              onViewModeChange={setViewMode}
            />
          )}

          {/* List View */}
          {activeTab === 'list' && (
            <AgentsBoard
              onAgentSelect={handleAgentSelect}
              onAddToChat={handleAddAgentToChat}
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

          {/* Table View */}
          {activeTab === 'table' && (
            <AgentsTable
              onAgentSelect={handleAgentSelect}
              onAddToChat={handleAddAgentToChat}
            />
          )}

          {/* Knowledge Graph View */}
          {activeTab === 'graph' && (
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Network className="w-6 h-6 text-blue-600" />
                    Agent Knowledge Graph
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Interactive visualization of agent relationships, skills, tools, and knowledge domains.
                    {selectedAgent ? ` Showing graph for: ${selectedAgent.name}` : ' Select an agent to view their knowledge graph.'}
                  </p>
                </div>

                {selectedAgent ? (
                  <KnowledgeGraphVisualization
                    agentId={selectedAgent.id}
                    height="700px"
                  />
                ) : (
                  <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
                    <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Agent Selected</h3>
                    <p className="text-muted-foreground mb-6">
                      Select an agent from the Grid, List, or Table view to visualize their knowledge graph
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => handleTabChange('grid')}>
                        Go to Grid View
                      </Button>
                      <Button variant="outline" onClick={() => handleTabChange('table')}>
                        Go to Table View
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compare View */}
          {activeTab === 'compare' && (
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <ArrowRightLeft className="w-6 h-6 text-primary" />
                      Agent Comparison
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Compare agents side-by-side across all attributes including capabilities, knowledge domains, models, and performance metrics.
                      {comparisonAgents.length === 0
                        ? ' Add agents to compare using the compare button on agent cards.'
                        : ` Comparing ${comparisonAgents.length} agent${comparisonAgents.length === 1 ? '' : 's'}.`}
                    </p>
                  </div>
                  {comparisonAgents.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearComparison} className="text-destructive">
                      Clear All
                    </Button>
                  )}
                </div>

                {comparisonAgents.length > 0 ? (
                  <AgentComparison
                    agents={comparisonAgents}
                    onRemoveAgent={(agentId) => removeFromComparison(agentId)}
                    onAddAgent={() => handleTabChange('grid')}
                    maxAgents={3}
                    showHierarchy={true}
                    showSimilarity={true}
                    className="min-h-[600px]"
                  />
                ) : (
                  <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
                    <ArrowRightLeft className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Agents Selected for Comparison</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Select agents to compare by clicking the compare button on agent cards in the Grid or List view. You can compare up to 3 agents at once.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => handleTabChange('grid')}>
                        Go to Grid View
                      </Button>
                      <Button variant="outline" onClick={() => handleTabChange('list')}>
                        Go to List View
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            await useAgentsStore.getState().loadAgents(false);
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
          if (!open) {
            setEditingAgent(null);
          }
        }}
        onSave={handleSaveAgentFromEnhanced as any}
      />
    </div>
  );
}

export default function AgentsPage() {
  return (
    <AgentComparisonProvider maxAgents={3}>
      <Suspense fallback={<div className="p-6 animate-pulse">Loading agents...</div>}>
        <AgentsPageContent />
      </Suspense>
      {/* Floating comparison sidebar with button */}
      <AgentComparisonSidebar maxAgents={3} />
    </AgentComparisonProvider>
  );
}

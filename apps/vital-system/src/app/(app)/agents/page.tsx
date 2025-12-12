'use client';

import { LayoutGrid, List, Table as TableIcon, BarChart3, Network, ArrowRightLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { useAgentsFilter } from '@/contexts/agents-filter-context';
// AgentDetailsModal removed - now using full page navigation at /agents/[slug]
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
import { PageHeader } from '@/components/page-header';
import { Users } from 'lucide-react';

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
  const { user } = useAuth();
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
  const [activeTab, setActiveTab] = useState<'overview' | 'grid' | 'list' | 'table' | 'graph' | 'compare'>('overview');

  // Get comparison context for the Compare tab
  const { comparisonAgents: comparisonAgentsRaw, removeFromComparison, clearComparison } = useAgentComparison();
  const comparisonAgents = comparisonAgentsRaw || [];

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setActiveTab(value as typeof activeTab);
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Page Header */}
      <PageHeader
        icon={Users}
        title="Agents"
        description="Discover and manage AI expert agents"
      />

      {/* L1/L2/L3 Level Filter Tabs */}
      <div className="px-6 py-3 border-b bg-muted/30">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filter by Level:</span>
          <div className="flex gap-1">
            {[
              { value: '', label: 'All Agents', count: agents.length },
              { value: '1', label: 'L1 Master', description: 'Strategic orchestrators' },
              { value: '2', label: 'L2 Expert', description: 'Domain experts' },
              { value: '3', label: 'L3 Specialist', description: 'Focused specialists' },
            ].map((level) => {
              const isActive = level.value === ''
                ? multiFilters.levels.size === 0
                : multiFilters.levels.has(level.value);
              return (
                <button
                  key={level.value}
                  onClick={() => {
                    if (level.value === '') {
                      setLevels(new Set());
                    } else {
                      setLevels(new Set([level.value]));
                    }
                  }}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background hover:bg-muted border border-input'
                    }
                  `}
                  title={level.description}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
          {multiFilters.levels.size > 0 && (
            <button
              onClick={() => setLevels(new Set())}
              className="ml-2 text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full max-w-3xl grid-cols-6 relative z-10 pointer-events-auto">
                <TabsTrigger value="overview" className="flex items-center gap-2 cursor-pointer">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="grid" className="flex items-center gap-2 cursor-pointer">
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2 cursor-pointer">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2 cursor-pointer">
                  <TableIcon className="h-4 w-4" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="graph" className="flex items-center gap-2 cursor-pointer">
                  <Network className="h-4 w-4" />
                  Knowledge Graph
                </TabsTrigger>
                <TabsTrigger value="compare" className="flex items-center gap-2 cursor-pointer">
                  <ArrowRightLeft className="h-4 w-4" />
                  Compare
                  {comparisonAgents.length > 0 && (
                    <span className="ml-1 bg-[#0046FF] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {comparisonAgents.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <AgentsOverview />
              </TabsContent>

              <TabsContent value="grid" className="mt-6">
                <AgentsBoard
                  onAgentSelect={handleAgentSelect}
                  onAddToChat={handleAddAgentToChat}
                  showCreateButton={true}
                  hiddenControls={false}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFilterChange={setFilters}
                  viewMode="grid"
                  onViewModeChange={setViewMode}
                />
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                <AgentsBoard
                  onAgentSelect={handleAgentSelect}
                  onAddToChat={handleAddAgentToChat}
                  showCreateButton={true}
                  hiddenControls={false}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFilterChange={setFilters}
                  viewMode="list"
                  onViewModeChange={setViewMode}
                />
              </TabsContent>

              <TabsContent value="table" className="mt-6">
                <AgentsTable
                  onAgentSelect={handleAgentSelect}
                  onAddToChat={handleAddAgentToChat}
                />
              </TabsContent>

              <TabsContent value="graph" className="mt-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Network className="w-6 h-6 text-blue-600" />
                        Agent Knowledge Graph
                      </h2>
                      <p className="text-sm text-gray-600 mt-2">
                        Interactive visualization of agent relationships, skills, tools, and knowledge domains using Neo4j, Pinecone, and Supabase.
                        {selectedAgent ? ` Showing graph for: ${selectedAgent.name}` : ' Select an agent to view their knowledge graph.'}
                      </p>
                    </div>

                    {selectedAgent ? (
                      <KnowledgeGraphVisualization
                        agentId={selectedAgent.id}
                        height="700px"
                      />
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Agent Selected
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Select an agent from the Grid, List, or Table view to visualize their knowledge graph
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setActiveTab('grid')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Go to Grid View
                          </button>
                          <button
                            onClick={() => setActiveTab('table')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Go to Table View
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="compare" className="mt-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                          <ArrowRightLeft className="w-6 h-6 text-[#0046FF]" />
                          Agent Comparison
                        </h2>
                        <p className="text-sm text-gray-600 mt-2">
                          Compare agents side-by-side across all attributes including capabilities, knowledge domains, models, and performance metrics.
                          {comparisonAgents.length === 0
                            ? ' Add agents to compare using the compare button on agent cards.'
                            : ` Comparing ${comparisonAgents.length} agent${comparisonAgents.length === 1 ? '' : 's'}.`}
                        </p>
                      </div>
                      {comparisonAgents.length > 0 && (
                        <button
                          onClick={clearComparison}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {comparisonAgents.length > 0 ? (
                      <AgentComparison
                        agents={comparisonAgents}
                        onRemoveAgent={(agentId) => removeFromComparison(agentId)}
                        onAddAgent={() => setActiveTab('grid')}
                        maxAgents={3}
                        showHierarchy={true}
                        showSimilarity={true}
                        className="min-h-[600px]"
                      />
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <ArrowRightLeft className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Agents Selected for Comparison
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Select agents to compare by clicking the compare button (
                          <ArrowRightLeft className="w-4 h-4 inline-block mx-1" />
                          ) on agent cards in the Grid or List view. You can compare up to 3 agents at once.
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setActiveTab('grid')}
                            className="px-4 py-2 bg-[#0046FF] text-white rounded-lg hover:bg-[#0035CC] transition-colors"
                          >
                            Go to Grid View
                          </button>
                          <button
                            onClick={() => setActiveTab('list')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Go to List View
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* AgentDetailsModal removed - now using full page at /agents/[slug] */}

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
                  // Invalidate queries and reload agents store instead of hard refresh
                  queryClient.invalidateQueries({ queryKey: ['agents'] });
                  await useAgentsStore.getState().loadAgents(false);
                }}
                editingAgent={editingAgent as any}
              />
            )}

            {/* Enhanced Agent Edit Modal - 9 tabs with comprehensive configuration */}
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
        </div>
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

'use client';

import { LayoutGrid, List, Table as TableIcon, BarChart3, Network } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { useAgentsFilter } from '@/contexts/agents-filter-context';
import { AgentDetailsModal } from '@/features/agents/components/agent-details-modal';
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
import { PageHeader } from '@/components/page-header';
import { Users } from 'lucide-react';

function AgentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createUserCopy } = useAgentsStore();
  const { searchQuery, setSearchQuery, filters, setFilters, viewMode, setViewMode } = useAgentsFilter();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentsStoreAgent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnhancedEditModal, setShowEnhancedEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'grid' | 'list' | 'table' | 'graph'>('overview');

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    setActiveTab(value as typeof activeTab);
  };

  // Handle query parameters for opening create modal
  useEffect(() => {
    const createParam = searchParams.get('create');
    const uploadParam = searchParams.get('upload');

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
  }, [searchParams, router]);

  const handleAgentSelect = (agent: AgentsStoreAgent) => {
    // Debug: Log the incoming agent data
    console.log('🔍 Agent selected:', {
      name: agent.name,
      business_function: agent.business_function,
      department: agent.department,
      role: agent.role,
      organizational_role: (agent as any).organizational_role,
    });

    // Convert agents-store Agent to chat-store Agent format
    const chatStoreAgent: Agent = {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.system_prompt || '',
      model: agent.model || 'gpt-4',
      avatar: agent.avatar || '🤖',
      color: agent.color || 'text-market-purple',
      capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
      ragEnabled: agent.rag_enabled ?? true, // RAG enabled by default for all agents
      temperature: agent.temperature || 0.7,
      maxTokens: agent.max_tokens || 2000,
      isCustom: agent.is_custom || false,
      tools: [],
      knowledgeDomains: Array.isArray(agent.knowledge_domains) ? agent.knowledge_domains : [],
      businessFunction: agent.business_function || undefined,
      department: agent.department || undefined,
      organizationalRole: (agent as any).organizational_role || agent.role || undefined,
      tier: agent.tier || undefined,
    };

    console.log('✅ Chat store agent:', {
      businessFunction: chatStoreAgent.businessFunction,
      department: chatStoreAgent.department,
      organizationalRole: chatStoreAgent.organizationalRole,
    });

    setSelectedAgent(chatStoreAgent);
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
          hasTagline: !!fullAgent.tagline,
          hasAvatarUrl: !!fullAgent.avatar_url,
          hasFunctionId: !!fullAgent.function_id,
          hasDepartmentId: !!fullAgent.department_id,
          hasRoleId: !!fullAgent.role_id,
          hasSystemPrompt: !!fullAgent.system_prompt,
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
  const handleSaveAgentFromEnhanced = async (updates: Partial<AgentsStoreAgent>) => {
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
      await agentService.updateAgent(editingAgent.id, updates);
      console.log('[AgentsPage] Agent saved successfully');
      setShowEnhancedEditModal(false);
      setEditingAgent(null);
      // Reload agents to reflect changes
      window.location.reload();
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={Users}
        title="Agents"
        description="Discover and manage AI expert agents"
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-2xl grid-cols-5 relative z-10 pointer-events-auto">
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
      </Tabs>

      {selectedAgent && (
        <AgentDetailsModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onEdit={handleEditAgent}
          onAddToChat={(agent) => {
            // Convert chat-store Agent to agents-store Agent format
            const agentForStore: AgentsStoreAgent = {
              id: agent.id,
              name: agent.name,
              display_name: agent.name,
              description: agent.description,
              system_prompt: agent.systemPrompt || '',
              model: agent.model || 'gpt-4',
              avatar: agent.avatar || '🤖',
              color: agent.color || 'text-market-purple',
              capabilities: agent.capabilities || [],
              rag_enabled: agent.ragEnabled ?? true, // RAG enabled by default for all agents
              temperature: agent.temperature || 0.7,
              max_tokens: agent.maxTokens || 2000,
              knowledge_domains: agent.knowledgeDomains || [],
              business_function: agent.businessFunction || '',
              department: agent.department || '',
              role: agent.organizationalRole || agent.role || '',
              status: 'active',
              tier: agent.tier || 1,
              priority: 1,
              implementation_phase: 1,
              is_custom: agent.isCustom || false,
            };
            handleAddAgentToChat(agentForStore);
          }}
        />
      )}

      {showCreateModal && (
        <AgentCreator
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAgent(null);
          }}
          onSave={() => {
            setShowCreateModal(false);
            setEditingAgent(null);
            // Force refresh of the agents board
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
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
        onSave={handleSaveAgentFromEnhanced}
      />
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<div className="p-6 animate-pulse">Loading agents...</div>}>
      <AgentsPageContent />
    </Suspense>
  );
}
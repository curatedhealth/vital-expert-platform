'use client';

import { LayoutGrid, List, Table as TableIcon, BarChart3 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { useAgentsFilter } from '@/contexts/agents-filter-context';
import { AgentDetailsModal } from '@/features/agents/components/agent-details-modal';
import { AgentsBoard } from '@/features/agents/components/agents-board';
import { AgentsOverview } from '@/features/agents/components/agents-overview';
import { AgentsTable } from '@/features/agents/components/agents-table';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { type Agent as AgentsStoreAgent, useAgentsStore } from '@/lib/stores/agents-store';
import { type Agent } from '@/lib/stores/chat-store';

function AgentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { createUserCopy } = useAgentsStore();
  const { searchQuery, setSearchQuery, filters, setFilters, viewMode, setViewMode } = useAgentsFilter();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentsStoreAgent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'grid' | 'list' | 'table'>('overview');

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
      ragEnabled: agent.rag_enabled || false,
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

  const handleEditAgent = (agent: Agent) => {
    // Convert chat-store Agent to agents-store Agent format
    const agentForEditing: AgentsStoreAgent = {
      id: agent.id,
      name: agent.name,
      display_name: agent.name,
      description: agent.description,
      system_prompt: agent.systemPrompt || '',
      model: agent.model || 'gpt-4',
      avatar: agent.avatar || '🤖',
      color: agent.color || 'text-market-purple',
      capabilities: agent.capabilities || [],
      rag_enabled: agent.ragEnabled || false,
      temperature: agent.temperature || 0.7,
      max_tokens: agent.maxTokens || 2000,
      knowledge_domains: agent.knowledgeDomains || [],
      business_function: agent.businessFunction || '',
      role: agent.role || '',
      status: 'active',
      tier: 1,
      priority: 1,
      implementation_phase: 1,
      is_custom: agent.isCustom || false,
    };

    setEditingAgent(agentForEditing);
    setShowCreateModal(true);
    setSelectedAgent(null); // Close the details modal
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
          errorText = await response.text();
          console.log('📄 [Add to Chat] Raw response:', errorText);
          
          // Try to parse as JSON
          if (errorText) {
            try {
              errorData = JSON.parse(errorText);
            } catch (parseError) {
              console.warn('⚠️ [Add to Chat] Response is not JSON:', errorText);
              errorData = { error: errorText };
            }
          }
        } catch (readError) {
          console.error('❌ [Add to Chat] Failed to read response:', readError);
        }

        console.error('❌ Failed to add agent to chat:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorText,
        });

        if (response.status === 409) {
          console.log(`ℹ️ Agent "${agent.display_name}" is already in your chat list`);
          alert(`"${agent.display_name}" is already in your chat list.`);
        } else {
          // Construct user-friendly error message
          let errorMessage = 'Unknown error';
          
          if (errorData.errors) {
            // Validation errors object
            errorMessage = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n');
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorText) {
            errorMessage = errorText.substring(0, 200); // Limit length
          }
          
          alert(`Failed to add agent:\n\n${errorMessage}\n\nStatus: ${response.status} ${response.statusText}`);
        }
        
        // Don't navigate if there's an error - let user see the error and retry
        return;
      }

      const result = await response.json();
      console.log(`✅ Agent "${agent.display_name}" added to user's chat list:`, result);
      
      alert(`✅ "${agent.display_name}" has been added to your chat list!`);
      
      // Navigate to ask-expert page to see the added agent
      router.push('/ask-expert');
      
    } catch (error) {
      console.error('❌ Failed to add agent to chat:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-md grid-cols-4 relative z-10 pointer-events-auto">
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
              rag_enabled: agent.ragEnabled || false,
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
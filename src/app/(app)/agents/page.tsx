'use client';

import { LayoutGrid, List, Table as TableIcon, BarChart3 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgentsFilter } from '@/contexts/agents-filter-context';
import { AgentDetailsModal } from '@/features/agents/components/agent-details-modal';
import { AgentsBoard } from '@/features/agents/components/agents-board';
import { AgentsOverview } from '@/features/agents/components/agents-overview';
import { AgentsTable } from '@/features/agents/components/agents-table';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { type Agent as AgentsStoreAgent, useAgentsStore } from '@/lib/stores/agents-store';
import { type Agent, useChatStore } from '@/lib/stores/chat-store';
import { useAuth } from '@/supabase-auth-context';

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

  // Load agents when component mounts
  useEffect(() => {
    const { loadAgents } = useAgentsStore.getState();
    loadAgents();
  }, []);

  const handleAgentSelect = (agent: AgentsStoreAgent) => {
    // Debug: Log the incoming agent data
    console.log('🔍 Agent selected:', {
      name: agent.name,
      business_function: agent.business_function,
      department: agent.department,
      role: (agent as any).role,
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
      organizationalRole: (agent as any).organizational_role || (agent as any).role || undefined,
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
      // role: agent.role || '',
      status: 'active',
      tier: 1,
      priority: 1,
      implementation_phase: 1,
      is_custom: agent.isCustom || false,
      department: (agent as any).department || '',
      organizational_role: (agent as any).organizational_role || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEditingAgent(agentForEditing);
    setShowCreateModal(true);
    setSelectedAgent(null); // Close the details modal
  };

  const handleAddAgentToChat = async (agent: AgentsStoreAgent) => {
    try {
      // Import chat store to add agent to library
      const { addAgentToLibrary } = useChatStore.getState();
      
      // Check if this is an admin agent that needs to be copied
      if (!agent.is_user_copy) {
        // Create user copy through the store
        const userCopy = await createUserCopy(agent.id);

        // Add the user copy to the chat store library
        addAgentToLibrary(userCopy.id);

        // Show success message
        alert(`✅ Agent "${userCopy.display_name}" added to your chat library!`);

        // Navigate to chat page
        router.push('/chat');
      } else {
        // This is already a user copy, add directly to library
        addAgentToLibrary(agent.id);

        // Show success message
        alert(`✅ Agent "${agent.display_name}" added to your chat library!`);

        // Navigate to chat page
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error adding agent to chat:', error);
      alert('❌ Failed to add agent to chat. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full relative z-10">
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
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { AgentDetailsModal } from '@/features/agents/components/agent-details-modal';
import { AgentsBoard } from '@/features/agents/components/agents-board';
import { AgentCreator } from '@/features/chat/components/agent-creator';
import { useAuth } from '@/lib/auth/auth-context';
import { type Agent as AgentsStoreAgent, useAgentsStore } from '@/lib/stores/agents-store';
import { type Agent } from '@/lib/stores/chat-store';

export default function AgentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { createUserCopy } = useAgentsStore();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentsStoreAgent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      knowledgeDomains: Array.isArray(agent.knowledge_domains) ? agent.knowledge_domains : []
    };
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
      is_public: false,
    };

    setEditingAgent(agentForEditing);
    setShowCreateModal(true);
    setSelectedAgent(null); // Close the details modal
  };

  const handleAddAgentToChat = async (agent: AgentsStoreAgent) => {
    try {
      // Check if this is an admin agent that needs to be copied
      if (!agent.is_user_copy) {
        // Create user copy through the store
        const userCopy = await createUserCopy(agent);

        // Convert to chat store format
        const chatAgent: Agent = {
          id: userCopy.id,
          name: userCopy.display_name,
          description: userCopy.description,
          systemPrompt: userCopy.system_prompt,
          model: userCopy.model,
          avatar: userCopy.avatar,
          color: userCopy.color,
          capabilities: userCopy.capabilities,
          ragEnabled: userCopy.rag_enabled,
          temperature: userCopy.temperature,
          maxTokens: userCopy.max_tokens,
          isCustom: userCopy.is_custom,
          knowledgeDomains: userCopy.knowledge_domains,
          businessFunction: userCopy.business_function || undefined,
          role: userCopy.role || undefined,
        };

        // Get existing user agents from localStorage
        const existingAgents = localStorage.getItem('user-chat-agents');
        const userAgents = existingAgents ? JSON.parse(existingAgents) : [];

        // Check if agent is already added (by original agent id)
        const isAlreadyAdded = userAgents.some((ua: unknown) => ua.original_agent_id === agent.id);

        if (!isAlreadyAdded) {
          // Add user copy to localStorage
          const newUserAgents = [...userAgents, chatAgent];
          localStorage.setItem('user-chat-agents', JSON.stringify(newUserAgents));
        } else { /* TODO: implement */ }

        // Navigate to chat page
        router.push('/chat');
      } else {
        // This is already a user copy, convert to chat format
        const chatAgent: Agent = {
          id: agent.id,
          name: agent.display_name,
          description: agent.description,
          systemPrompt: agent.system_prompt,
          model: agent.model,
          avatar: agent.avatar || '🤖',
          color: agent.color,
          capabilities: agent.capabilities,
          ragEnabled: agent.rag_enabled,
          temperature: agent.temperature,
          maxTokens: agent.max_tokens,
          isCustom: agent.is_custom,
          knowledgeDomains: agent.knowledge_domains,
          businessFunction: agent.business_function || undefined,
          role: agent.role || undefined,
        };

        // Get existing user agents from localStorage
        const existingAgents = localStorage.getItem('user-chat-agents');
        const userAgents = existingAgents ? JSON.parse(existingAgents) : [];

        // Check if agent is already added
        const isAlreadyAdded = userAgents.some((ua: unknown) => ua.id === agent.id);

        if (!isAlreadyAdded) {
          // Add existing user copy to localStorage
          const newUserAgents = [...userAgents, chatAgent];
          localStorage.setItem('user-chat-agents', JSON.stringify(newUserAgents));
        }

        // Navigate to chat page
        router.push('/chat');
      }
    } catch (error) {
      console.error('Failed to add agent to chat:', error);
      // Fallback to old behavior if copy fails
      const chatAgent = {
        id: agent.id,
        name: agent.display_name,
        avatar: agent.avatar || '🤖'
      };

      const existingAgents = localStorage.getItem('user-chat-agents');
      const userAgents = existingAgents ? JSON.parse(existingAgents) : [];
      const isAlreadyAdded = userAgents.some((ua: unknown) => ua.id === agent.id);

      if (!isAlreadyAdded) {
        const newUserAgents = [...userAgents, chatAgent];
        localStorage.setItem('user-chat-agents', JSON.stringify(newUserAgents));
      }

      router.push('/chat');
    }
  };

  return (
    <div className="space-y-6">
      <AgentsBoard
        onAgentSelect={handleAgentSelect}
        onAddToChat={handleAddAgentToChat}
        showCreateButton={true}
        hiddenControls={false}
      />

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
            window.location.reload();
          }}
          editingAgent={editingAgent as unknown}
        />
      )}
    </div>
  );
}
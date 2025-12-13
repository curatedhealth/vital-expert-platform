'use client';

/**
 * useAgentActions Hook
 *
 * Encapsulates agent CRUD operations and modal state management
 * Extracted from agents/page.tsx for reusability
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAgentsStore, type Agent as AgentsStoreAgent } from '@/lib/stores/agents-store';
import { type Agent as ChatAgent } from '@/lib/stores/chat-store';
import { type Agent as FeatureAgent } from '@/features/agents/types/agent.types';
import { agentService } from '@/features/agents/services/agent-service';

interface UseAgentActionsResult {
  // Selected/editing state
  selectedAgent: ChatAgent | null;
  setSelectedAgent: (agent: ChatAgent | null) => void;
  editingAgent: AgentsStoreAgent | null;
  setEditingAgent: (agent: AgentsStoreAgent | null) => void;

  // Modal states
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  showEnhancedEditModal: boolean;
  setShowEnhancedEditModal: (show: boolean) => void;

  // Actions
  handleAgentSelect: (agent: AgentsStoreAgent) => void;
  handleEditAgent: (agent: ChatAgent) => Promise<void>;
  handleSaveAgentFromEnhanced: (updates: Partial<FeatureAgent>) => Promise<void>;
  handleAddAgentToChat: (agent: AgentsStoreAgent, userId: string | undefined) => Promise<void>;
  handleCloseModals: () => void;
  refreshAgents: () => Promise<void>;
}

export function useAgentActions(): UseAgentActionsResult {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [selectedAgent, setSelectedAgent] = useState<ChatAgent | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentsStoreAgent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnhancedEditModal, setShowEnhancedEditModal] = useState(false);

  // Refresh agents data
  const refreshAgents = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['agents'] });
    await useAgentsStore.getState().loadAgents(false);
  }, [queryClient]);

  // Navigate to agent detail page
  const handleAgentSelect = useCallback((agent: AgentsStoreAgent) => {
    const identifier = (agent as any).slug || agent.id;
    router.push(`/agents/${identifier}`);
  }, [router]);

  // Open edit modal with full agent data
  const handleEditAgent = useCallback(async (agent: ChatAgent) => {
    console.log('🔍 [Edit] Fetching full agent data for:', agent.id);

    try {
      const { getAgentById } = useAgentsStore.getState();
      let fullAgent = getAgentById(agent.id);

      if (fullAgent) {
        console.log('✅ [Edit] Found agent in store with full data');
      } else {
        console.log('🔄 [Edit] Agent not in store, fetching from API...');
        const response = await fetch(`/api/agents/${agent.id}`);
        if (response.ok) {
          const data = await response.json();
          fullAgent = data.agent || data;
          console.log('✅ [Edit] Fetched full agent from API');
        }
      }

      if (fullAgent) {
        setEditingAgent(fullAgent as AgentsStoreAgent);
      } else {
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
          rag_enabled: agent.ragEnabled ?? true,
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
      setSelectedAgent(null);
    } catch (error) {
      console.error('❌ [Edit] Error fetching full agent data:', error);
      alert('Failed to load agent data for editing. Please try again.');
    }
  }, []);

  // Save agent updates
  const handleSaveAgentFromEnhanced = useCallback(async (updates: Partial<FeatureAgent>) => {
    if (!editingAgent) {
      throw new Error('No agent selected for editing');
    }
    try {
      console.log('[AgentsPage] Saving agent updates:', {
        agentId: editingAgent.id,
        agentName: editingAgent.name,
        updateFields: Object.keys(updates),
      });
      await agentService.updateAgent(editingAgent.id, updates as Parameters<typeof agentService.updateAgent>[1]);
      console.log('[AgentsPage] Agent saved successfully');
      setShowEnhancedEditModal(false);
      setEditingAgent(null);
      await refreshAgents();
    } catch (error) {
      console.error('[AgentsPage] Failed to save agent:', error);
      throw error;
    }
  }, [editingAgent, refreshAgents]);

  // Add agent to user's chat list
  const handleAddAgentToChat = useCallback(async (agent: AgentsStoreAgent, userId: string | undefined) => {
    try {
      console.log('🔍 [Add to Chat] Adding agent to user list:', {
        id: agent.id,
        name: agent.display_name
      });

      if (!userId) {
        console.error('❌ User not authenticated');
        alert('Please log in to add agents to your chat list.');
        return;
      }

      // Validate agent ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!agent.id || !uuidRegex.test(agent.id)) {
        console.error('❌ Invalid agent ID format:', agent.id);
        alert('This agent has an invalid ID format and cannot be added.');
        return;
      }

      const requestPayload: any = {
        userId,
        agentId: agent.id,
        isUserCopy: agent.is_user_copy || false,
      };

      if (agent.original_agent_id && uuidRegex.test(agent.original_agent_id)) {
        requestPayload.originalAgentId = agent.original_agent_id;
      }

      const response = await fetch('/api/user-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 409) {
          alert(`"${agent.display_name}" is already in your chat list.`);
          return;
        } else if (response.status === 503) {
          queryClient.invalidateQueries({ queryKey: ['user-agents', userId] });
          router.push('/chat');
          return;
        } else {
          const errorMessage = errorData?.error || errorData?.message || `HTTP ${response.status}`;
          alert(`Failed to add agent:\n\n${errorMessage}`);
          return;
        }
      }

      console.log(`✅ Agent "${agent.display_name}" added to user's chat list`);
      queryClient.invalidateQueries({ queryKey: ['user-agents', userId] });
      alert(`✅ "${agent.display_name}" has been added to your chat list!`);
      router.push('/chat');

    } catch (error) {
      console.error('❌ Failed to add agent to chat:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  }, [queryClient, router]);

  // Close all modals
  const handleCloseModals = useCallback(() => {
    setShowCreateModal(false);
    setShowEnhancedEditModal(false);
    setEditingAgent(null);
    setSelectedAgent(null);
  }, []);

  return {
    selectedAgent,
    setSelectedAgent,
    editingAgent,
    setEditingAgent,
    showCreateModal,
    setShowCreateModal,
    showEnhancedEditModal,
    setShowEnhancedEditModal,
    handleAgentSelect,
    handleEditAgent,
    handleSaveAgentFromEnhanced,
    handleAddAgentToChat,
    handleCloseModals,
    refreshAgents,
  };
}

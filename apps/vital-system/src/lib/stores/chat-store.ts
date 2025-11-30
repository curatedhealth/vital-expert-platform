import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { agentService } from '@/features/agents/services/agent-service';
import { useAgentsStore, type Agent as GlobalAgent } from '@/lib/stores/agents-store';

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  avatar: string;
  color: string;
  capabilities: string[];
  ragEnabled: boolean;
  temperature: number;
  maxTokens: number;
  isCustom?: boolean;
  knowledgeUrls?: string[];
  tools?: string[];
  knowledgeDomains?: string[]; // Knowledge domains this agent can access
  businessFunction?: string; // Business function (HR, Medical Affairs, etc.)
  role?: string; // Pharma value chain role
  // Organizational structure
  department?: string; // Department name
  organizationalRole?: string; // Organizational role name
  tier?: number; // Agent tier (1, 2, 3)
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agentId?: string;
  isLoading?: boolean;
  error?: boolean;
  attachments?: unknown[];
  metadata?: {
    sources?: unknown[];
    citations?: number[];
    followupQuestions?: string[];
    processingTime?: number;
    reasoning?: string;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    workflow_step?: string;
    metadata_model?: {
      name: string;
      display_name: string;
      description: string;
      image_url: string | null;
      brain_id: string;
      brain_name: string;
    };
    alternativeAgents?: Array<{
      agent: Agent;
      score: number;
      reason?: string;
    }>;
    selectedAgentConfidence?: number;
  };
}

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
  messageCount: number;
  lastMessage?: string;
  mode?: 'automatic' | 'manual' | 'autonomous'; // Track which mode was used for this chat
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ChatStore {
  // State
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  selectedAgent: Agent | null;
  selectedModel: AIModel | null;
  agents: Agent[];
  libraryAgents: string[]; // Agent IDs in user's library
  isLoading: boolean;
  isLoadingAgents: boolean;
  error: string | null;
  liveReasoning: string;
  isReasoningActive: boolean;
  abortController: AbortController | null;

  // Dual-Mode State
  interactionMode: 'automatic' | 'manual'; // Agent selection mode
  autonomousMode: boolean; // Chat mode: normal (false) vs autonomous with tools (true)
  currentTier: 1 | 2 | 3 | 'human';
  escalationHistory: unknown[];
  selectedExpert: Agent | null;
  conversationContext: {
    sessionId: string;
    messageCount: number;
    startTime: Date | null;
    lastActivity: Date | null;
  };

  // Actions
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  sendMessage: (content: string, attachments?: unknown[]) => Promise<void>;
  stopGeneration: () => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setSelectedModel: (model: AIModel | null) => void;
  createCustomAgent: (agent: Omit<Agent, 'id' | 'isCustom'>) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  deleteAgent: (agentId: string) => void;
  clearError: () => void;
  regenerateResponse: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => void;

  // Dual-Mode Actions
  setInteractionMode: (mode: 'automatic' | 'manual') => void;
  setAutonomousMode: (enabled: boolean) => void;
  setSelectedExpert: (expert: Agent | null) => void;
  escalateToNextTier: (reason: string) => void;
  resetEscalation: () => void;

  // Library Actions
  addToLibrary: (agentId: string) => void;
  removeFromLibrary: (agentId: string) => void;
  isInLibrary: (agentId: string) => boolean;

  // New database-powered actions
  loadAgentsFromDatabase: () => Promise<void>;
  refreshAgents: () => Promise<void>;
  searchAgents: (searchTerm: string) => Promise<Agent[]>;
  getAgentsByCategory: (categoryName: string) => Promise<Agent[]>;
  getAgentsByTier: (tier: number) => Promise<Agent[]>;

  // Global agents store integration
  syncWithGlobalStore: () => void;
  subscribeToGlobalChanges: () => () => void;
}

const _useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      currentChat: null,
      messages: [],
      selectedAgent: null,
      selectedModel: null,
      agents: [], // Start empty, will be loaded from database
      libraryAgents: [], // Agent IDs in user's library
      isLoading: false,
      isLoadingAgents: false,
      error: null,
      liveReasoning: '',
      isReasoningActive: false,
      abortController: null,

      // Dual-Mode Initial State
      interactionMode: 'automatic',
      autonomousMode: false,
      currentTier: 1,
      escalationHistory: [],
      selectedExpert: null,
      conversationContext: {
        sessionId: `session-${Date.now()}`,
        messageCount: 0,
        startTime: null,
        lastActivity: null,
      },

      // Actions
      createNewChat: () => {
        const { selectedAgent, interactionMode } = get();
        if (!selectedAgent) return;

        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          title: `New conversation with ${selectedAgent.name || 'AI Assistant'}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          agentId: selectedAgent.id || 'default',
          messageCount: 0,
          mode: interactionMode, // Track the mode for this chat
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChat: newChat,
          messages: [],
          error: null,
        }));
      },

      selectChat: (chatId: string) => {
        const { chats } = get();
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          // Load messages for this chat (in real app, from API/database)
          const chatMessages = JSON.parse(
            localStorage.getItem(`chat-messages-${chatId}`) || '[]'
          );

          set({
            currentChat: chat,
            messages: chatMessages.map((msg: unknown) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
            error: null,
          });
        }
      },

      deleteChat: (chatId: string) => {
        set((state) => {
          const updatedChats = state.chats.filter((c) => c.id !== chatId);
          const newCurrentChat = state.currentChat?.id === chatId ? null : state.currentChat;

          // Clean up stored messages
          localStorage.removeItem(`chat-messages-${chatId}`);

          return {
            chats: updatedChats,
            currentChat: newCurrentChat,
            messages: newCurrentChat ? state.messages : [],
          };
        });
      },

      sendMessage: async (content: string, attachments?: unknown[]) => {
        let { currentChat, selectedAgent, messages, interactionMode } = get();

        // In automatic mode, allow sending messages without pre-selected agent
        // The API will handle agent selection automatically
        if (!selectedAgent && interactionMode !== 'automatic') {
          console.warn('⚠️  No agent selected. Please select an agent before sending a message.');
          return;
        }

        // Auto-create a chat if one doesn't exist
        if (!currentChat) {
          const agentName = selectedAgent?.display_name || selectedAgent?.name || 'AI Assistant';
          console.log('📝 Auto-creating new chat for selected agent:', agentName);
          const newChat: Chat = {
            id: `chat-${Date.now()}`,
            title: `New conversation with ${agentName}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            agentId: selectedAgent?.id || 'default',
            messageCount: 0,
            mode: interactionMode, // Track the mode for this chat
          };

          set((state) => ({
            chats: [newChat, ...state.chats],
            currentChat: newChat,
            messages: [],
            error: null,
          }));

          // Update local reference
          currentChat = newChat;
        }

        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          content,
          role: 'user',
          timestamp: new Date(),
          agentId: selectedAgent?.id || 'default',
          attachments,
        };

        // Add placeholder assistant message
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          content: '',
          role: 'assistant',
          timestamp: new Date(),
          agentId: selectedAgent?.id || 'default',
          isLoading: true,
          metadata: {
            citations: [],
            followupQuestions: [],
            sources: [],
            processingTime: 0,
            tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            workflow_step: selectedAgent.capabilities?.[0] || 'general',
            metadata_model: {
              name: selectedAgent.name || 'Unknown Agent',
              display_name: selectedAgent.name || 'Unknown Agent',
              description: selectedAgent.description || 'AI Assistant',
              image_url: null,
              brain_id: selectedAgent.id || 'default',
              brain_name: selectedAgent.name || 'Unknown Agent',
            },
          },
        };

        // Add both messages immediately and reset reasoning state
        const updatedMessages = [...messages, userMessage, assistantMessage];
        console.log('🔍 [sendMessage] Adding messages to store:', {
          totalMessages: updatedMessages.length,
          userMessageId: userMessage.id,
          assistantMessageId: assistantMessage.id,
          chatId: currentChat.id
        });
        set({
          messages: updatedMessages,
          isLoading: false,
          error: null,
          liveReasoning: '',
          isReasoningActive: false,
        });

        try {
          // Create new abort controller for this request
          const controller = new AbortController();
          set({ abortController: controller });

          // Get interaction mode to determine routing
          const { interactionMode, autonomousMode } = get();
          const useAutomaticRouting = interactionMode === 'automatic';

          // Determine API endpoint based on autonomous mode
          const apiEndpoint = autonomousMode ? '/api/chat/autonomous' : '/api/chat';

          // Call the appropriate chat API with streaming support
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
              message: content,
              agent: selectedAgent || null, // Allow null agent in automatic mode
              userId: 'hicham.naim@curated.health', // TODO: Get from auth context
              sessionId: currentChat.id,
              model: get().selectedModel, // Include selected model
              chatHistory: messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              ragEnabled: selectedAgent?.ragEnabled ?? true, // RAG enabled by default for all agents
              automaticRouting: useAutomaticRouting, // Enable intelligent agent routing for automatic mode
              useIntelligentRouting: useAutomaticRouting
            })
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';
          let metadata: unknown = null;

          if (!reader) {
            throw new Error('Response body is not readable');
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === 'reasoning') {
                    // Accumulate reasoning steps
                    set((state) => ({
                      liveReasoning: state.liveReasoning
                        ? `${state.liveReasoning}\n${data.content || ''}`
                        : (data.content || ''),
                      isReasoningActive: true,
                    }));
                  } else if (data.type === 'reasoning_done') {
                    // Reasoning complete, store in message metadata
                    set({
                      isReasoningActive: false,
                    });
                    // The final reasoning will be stored in metadata
                  } else if (data.type === 'content') {
                    fullContent = data.fullContent;
                    console.log('📥 [streaming] Received content chunk:', {
                      length: fullContent.length,
                      assistantMsgId: assistantMessage.id
                    });

                    // Update message with streaming content
                    set((state) => ({
                      messages: state.messages.map((msg) =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: fullContent, isLoading: true }
                          : msg
                      ),
                    }));
                  } else if (data.type === 'metadata') {
                    metadata = data.metadata;
                  } else if (data.type === 'error') {
                    throw new Error(data.error);
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', parseError);
                }
              }
            }
          }

          const processingTime = Date.now() - (assistantMessage.timestamp.getTime());

          // Update the assistant message with final metadata and clear live reasoning
          console.log('✅ [streaming complete] Finalizing message:', {
            fullContentLength: fullContent.length,
            hasMetadata: !!metadata,
            assistantMsgId: assistantMessage.id
          });

          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: fullContent,
                    isLoading: false,
                    metadata: {
                      ...msg.metadata!,
                      processingTime,
                      reasoning: metadata?.reasoning || state.liveReasoning || undefined,
                      tokenUsage: metadata?.tokenUsage || {
                        promptTokens: 0,
                        completionTokens: 0,
                        totalTokens: 0,
                      },
                      sources: metadata?.sources || [],
                      citations: metadata?.citations || [],
                      followupQuestions: metadata?.followupQuestions || [
                        'Can you provide more specific guidance?',
                        'What are the key requirements I should know?',
                        'How should I proceed?',
                      ],
                      alternativeAgents: metadata?.alternativeAgents || [],
                    },
                  }
                : msg
            ),
            liveReasoning: '',
            isReasoningActive: false,
          }));

          // Save messages to localStorage
          const finalMessages = get().messages;
          localStorage.setItem(
            `chat-messages-${currentChat.id}`,
            JSON.stringify(finalMessages)
          );

          // Update chat metadata
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === currentChat.id
                ? {
                    ...chat,
                    updatedAt: new Date(),
                    messageCount: finalMessages.length,
                    lastMessage: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
                  }
                : chat
            ),
            abortController: null,
          }));
        } catch (error) {
          // Check if this was an abort
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('🛑 Request was aborted by user');
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: 'Generation stopped by user.', isLoading: false, error: false }
                  : msg
              ),
              abortController: null,
              isLoading: false,
              liveReasoning: '',
              isReasoningActive: false,
            }));
          } else {
            console.error('Error sending message:', error);
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isLoading: false, error: true }
                  : msg
              ),
              error: 'Failed to send message',
              abortController: null,
            }));
          }
        }
      },

      stopGeneration: () => {
        const { abortController } = get();
        if (abortController) {
          console.log('🛑 Stopping generation...');
          abortController.abort();
          set({
            abortController: null,
            isLoading: false,
            liveReasoning: '',
            isReasoningActive: false,
          });
        }
      },

      setSelectedAgent: (agent: Agent | null) => {
        set({ selectedAgent: agent, error: null });
      },

      setSelectedModel: (model: AIModel | null) => {
        set({ selectedModel: model, error: null });
      },

      // Dual-Mode Actions Implementation
      setInteractionMode: (mode: 'automatic' | 'manual') => {
        const state = get();
        set({
          interactionMode: mode,
          // Reset tier when switching to manual mode
          currentTier: mode === 'manual' ? 1 : state.currentTier,
          // Update conversation context
          conversationContext: {
            ...state.conversationContext,
            lastActivity: new Date(),
          },
        });
      },

      setAutonomousMode: (enabled: boolean) => {
        const state = get();
        set({
          autonomousMode: enabled,
          conversationContext: {
            ...state.conversationContext,
            lastActivity: new Date(),
          },
        });
      },

      setSelectedExpert: (expert: Agent | null) => {
        set({
          selectedExpert: expert,
          selectedAgent: expert, // Also set as selected agent for compatibility
          interactionMode: 'manual', // Selecting expert switches to manual mode
          conversationContext: {
            ...get().conversationContext,
            lastActivity: new Date(),
          },
        });
      },

      escalateToNextTier: (reason: string) => {
        const state = get();
        const currentTier = state.currentTier;

        let nextTier: 1 | 2 | 3 | 'human';
        if (currentTier === 1) nextTier = 2;
        else if (currentTier === 2) nextTier = 3;
        else if (currentTier === 3) nextTier = 'human';
        else nextTier = 'human';

        const escalation = {
          id: `escalation-${Date.now()}`,
          fromTier: currentTier,
          toTier: nextTier,
          reason,
          timestamp: new Date(),
        };

        set({
          currentTier: nextTier,
          escalationHistory: [...state.escalationHistory, escalation],
          conversationContext: {
            ...state.conversationContext,
            lastActivity: new Date(),
          },
        });
      },

      resetEscalation: () => {
        set({
          currentTier: 1,
          escalationHistory: [],
          conversationContext: {
            ...get().conversationContext,
            sessionId: `session-${Date.now()}`,
            messageCount: 0,
            lastActivity: new Date(),
          },
        });
      },

      // Library Actions Implementation
      addToLibrary: (agentId: string) => {
        const { libraryAgents } = get();
        if (!libraryAgents.includes(agentId)) {
          set({ libraryAgents: [...libraryAgents, agentId] });
        }
      },

      removeFromLibrary: (agentId: string) => {
        const { libraryAgents } = get();
        set({ libraryAgents: libraryAgents.filter(id => id !== agentId) });
      },

      isInLibrary: (agentId: string) => {
        return get().libraryAgents.includes(agentId);
      },

      createCustomAgent: (agentData: Omit<Agent, 'id' | 'isCustom'>) => {
        const newAgent: Agent = {
          ...agentData,
          id: `custom-${Date.now()}`,
          isCustom: true,
        };

        set((state) => ({
          agents: [...state.agents, newAgent],
          selectedAgent: newAgent,
        }));
      },

      updateAgent: (agentId: string, updates: Partial<Agent>) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === agentId ? { ...agent, ...updates } : agent
          ),
          selectedAgent:
            state.selectedAgent?.id === agentId
              ? { ...state.selectedAgent, ...updates }
              : state.selectedAgent,
        }));
      },

      deleteAgent: (agentId: string) => {
        set((state) => {
          const updatedAgents = state.agents.filter((agent) => agent.id !== agentId);
          return {
            agents: updatedAgents,
            selectedAgent:
              state.selectedAgent?.id === agentId
                ? updatedAgents[0] || null
                : state.selectedAgent,
          };
        });
      },

      clearError: () => {
        set({ error: null });
      },

      regenerateResponse: async (messageId: string) => {
        const { messages, selectedAgent } = get();
        const messageIndex = messages.findIndex((msg) => msg.id === messageId);
        if (messageIndex === -1 || !selectedAgent) return;

        // Set the message to loading state
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, isLoading: true, content: '', error: false } : msg
          ),
        }));

        try {
          // Simulate regeneration delay
          await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

          const newResponses = [
            "Let me provide an alternative perspective on this topic based on current industry best practices and regulatory guidance.",
            "Upon further analysis, I'd like to suggest a different approach that might be more suitable for your specific situation.",
            "I'd like to revise my earlier recommendation with additional considerations that could be beneficial for your strategy.",
          ];

          const newResponse = newResponses[Math.floor(Math.random() * newResponses.length)];

          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: newResponse,
                    isLoading: false,
                    metadata: {
                      ...msg.metadata!,
                      processingTime: 1200 + Math.random() * 800,
                    },
                  }
                : msg
            ),
          }));
        } catch (error) {
          console.error('Error regenerating response:', error);
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: 'Failed to regenerate response. Please try again.', isLoading: false, error: true }
                : msg
            ),
          }));
        }
      },

      editMessage: (messageId: string, newContent: string) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content: newContent } : msg
          ),
        }));

        // Update localStorage
        const { currentChat, messages } = get();
        if (currentChat) {
          localStorage.setItem(
            `chat-messages-${currentChat.id}`,
            JSON.stringify(messages)
          );
        }
      },

      // Database-powered actions
      loadAgentsFromDatabase: async () => {
        set({ isLoadingAgents: true, error: null });

        try {
          const dbAgents = await agentService.getActiveAgents();
          
          // Always handle the result, even if it's an empty array
          const formattedAgents = (dbAgents || []).map((agent) => agentService.convertToLegacyFormat(agent));
          
          set((state) => ({
            agents: formattedAgents,
            // Don't auto-select first agent - keep current selection or null
            selectedAgent: state.selectedAgent || null,
            isLoadingAgents: false,
            // Only set error if we expected agents but got none (optional check)
            error: formattedAgents.length === 0 ? null : null, // Always null - empty is valid
          }));
        } catch (error) {
          // This catch should rarely trigger now since getActiveAgents returns [] instead of throwing
          console.warn('⚠️ loadAgentsFromDatabase: Exception caught (should be rare):', error instanceof Error ? error.message : String(error));

          // Gracefully handle - empty agents array is valid
          set({
            agents: [],
            selectedAgent: null,
            isLoadingAgents: false,
            error: null, // Don't show error - empty agents is a valid state
          });
        }
      },

      refreshAgents: async () => {
        const { loadAgentsFromDatabase } = get();
        await loadAgentsFromDatabase();
      },

      searchAgents: async (searchTerm: string) => {
        try {
          const dbAgents = await agentService.searchAgents(searchTerm);
          return dbAgents.map((agent) => agentService.convertToLegacyFormat(agent));
        } catch (error) {
          console.error('Failed to search agents:', error);
          return [];
        }
      },

      getAgentsByCategory: async (categoryName: string) => {
        try {
          const dbAgents = await agentService.getAgentsByCategory(categoryName);
          return dbAgents.map((agent) => agentService.convertToLegacyFormat(agent));
        } catch (error) {
          console.error('Failed to get agents by category:', error);
          return [];
        }
      },

      getAgentsByTier: async (tier: number) => {
        try {
          const dbAgents = await agentService.getAgentsByTier(tier);
          return dbAgents.map((agent) => agentService.convertToLegacyFormat(agent));
        } catch (error) {
          console.error('Failed to get agents by tier:', error);
          return [];
        }
      },

      // Global agents store integration
      syncWithGlobalStore: () => {
        const globalAgents = useAgentsStore.getState().agents;
        const convertedAgents = globalAgents.map((agent: GlobalAgent) => ({
          id: agent.id,
          name: agent.display_name,
          description: agent.description,
          systemPrompt: agent.system_prompt,
          model: agent.model,
          avatar: agent.avatar,
          color: agent.color,
          capabilities: agent.capabilities,
          ragEnabled: agent.rag_enabled,
          temperature: agent.temperature,
          maxTokens: agent.max_tokens,
          knowledgeDomains: agent.knowledge_domains,
          businessFunction: agent.business_function || undefined,
          role: agent.role || undefined,
          isCustom: agent.is_custom,
        }));

        set({ agents: convertedAgents });
      },

      subscribeToGlobalChanges: () => {
        return useAgentsStore.subscribe((state) => {
          get().syncWithGlobalStore();
        });
      },
    }),
    {
      name: 'chat-store',
      version: 5, // Increment to force cache refresh - exclude messages from persistence
      migrate: (persistedState: unknown, version: number) => {
        // Always force reload agents from database on version change
        if (version < 5) {
          return {
            ...persistedState,
            agents: [], // Clear cached agents
            selectedAgent: null,
            error: null,
            messages: [], // Clear messages - they're loaded per-chat from separate storage
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        // Automatically load agents from database after rehydration
        if (state) {
          state.loadAgentsFromDatabase();
        }
      },
      // Exclude messages and transient state from persistence to avoid conflicts
      partialize: (state) => ({
        chats: state.chats,
        currentChat: state.currentChat,
        selectedAgent: state.selectedAgent,
        selectedModel: state.selectedModel,
        agents: state.agents,
        interactionMode: state.interactionMode,
        selectedExpert: state.selectedExpert,
        currentTier: state.currentTier,
        escalationHistory: state.escalationHistory,
        // Explicitly exclude: messages, isLoading, error, liveReasoning, isReasoningActive, abortController
      }),
    }
  )
);

// Export as useChatStore (without underscore)
export const useChatStore = _useChatStore;
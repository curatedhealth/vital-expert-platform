import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { agentService, type AgentWithCategories } from '@/lib/agents/agent-service';
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
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agentId?: string;
  isLoading?: boolean;
  error?: boolean;
  attachments?: any[];
  metadata?: {
    sources?: any[];
    citations?: number[];
    followupQuestions?: string[];
    processingTime?: number;
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
}

export interface ChatStore {
  // State
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  selectedAgent: Agent | null;
  agents: Agent[];
  isLoading: boolean;
  isLoadingAgents: boolean;
  error: string | null;

  // Actions
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  sendMessage: (content: string, attachments?: any[]) => Promise<void>;
  setSelectedAgent: (agent: Agent | null) => void;
  createCustomAgent: (agent: Omit<Agent, 'id' | 'isCustom'>) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  deleteAgent: (agentId: string) => void;
  clearError: () => void;
  regenerateResponse: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => void;

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

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      currentChat: null,
      messages: [],
      selectedAgent: null,
      agents: [], // Start empty, will be loaded from database
      isLoading: false,
      isLoadingAgents: false,
      error: null,

      // Actions
      createNewChat: () => {
        const { selectedAgent } = get();
        if (!selectedAgent) return;

        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          title: `New conversation with ${selectedAgent.name || 'AI Assistant'}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          agentId: selectedAgent.id || 'default',
          messageCount: 0,
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
            messages: chatMessages.map((msg: any) => ({
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

      sendMessage: async (content: string, attachments?: any[]) => {
        const { currentChat, selectedAgent, messages } = get();
        if (!currentChat || !selectedAgent) return;

        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          content,
          role: 'user',
          timestamp: new Date(),
          agentId: selectedAgent.id || 'default',
          attachments,
        };

        // Add placeholder assistant message
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          content: '',
          role: 'assistant',
          timestamp: new Date(),
          agentId: selectedAgent.id || 'default',
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

        // Add both messages immediately
        const updatedMessages = [...messages, userMessage, assistantMessage];
        set({
          messages: updatedMessages,
          isLoading: false,
          error: null,
        });

        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

          // Simulate response generation based on agent expertise
          const agentResponses: Record<string, string[]> = {
            'fda-regulatory-navigator': [
              "Based on FDA guidance, I recommend pursuing a 510(k) pathway for your medical device. This typically takes 3-6 months for review and offers the most straightforward path to market for devices substantially equivalent to predicates.",
              "For AI/ML devices, consider the FDA's predetermined change control protocol (PCCP) framework. This allows for iterative improvements while maintaining regulatory compliance.",
            ],
            'clinical-trial-architect': [
              "I suggest implementing a randomized controlled trial with a primary endpoint focused on efficacy. Sample size calculation should account for 20% effect size with 80% power and alpha of 0.05.",
              "Consider adaptive trial designs with interim analyses to optimize patient enrollment and improve study efficiency while maintaining regulatory acceptability.",
            ],
            'reimbursement-strategist': [
              "From a market access perspective, demonstrating clinical and economic value will be crucial for reimbursement. I recommend developing a comprehensive health economic model with cost-effectiveness analysis.",
              "Consider value-based care contracts with outcomes-based pricing to demonstrate real-world value to payers and accelerate market adoption.",
            ],
          };

          const defaultResponses = [
            `Based on my expertise in ${selectedAgent.businessFunction || 'healthcare'}, I can help you navigate this complex topic. Let me provide detailed guidance tailored to your specific needs.`,
            `As a ${selectedAgent.role || 'specialist'}, I recommend a systematic approach to address your requirements while ensuring compliance and effectiveness.`,
          ];

          const responses = agentResponses[selectedAgent.id] || defaultResponses;
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];

          // Update the assistant message with the response
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: randomResponse,
                    isLoading: false,
                    metadata: {
                      ...msg.metadata!,
                      processingTime: 1500 + Math.random() * 1000,
                      tokenUsage: {
                        promptTokens: 150 + Math.floor(Math.random() * 100),
                        completionTokens: 80 + Math.floor(Math.random() * 50),
                        totalTokens: 230 + Math.floor(Math.random() * 150),
                      },
                      sources: [
                        {
                          title: `${selectedAgent.name} Knowledge Base`,
                          content: `Relevant guidance from ${selectedAgent.businessFunction || 'domain expertise'}...`,
                          similarity: 0.85 + Math.random() * 0.1,
                          source_url: '#',
                        },
                      ],
                      citations: [1, 2],
                      followupQuestions: [
                        'Can you provide more specific guidance for my use case?',
                        'What are the key compliance requirements I should be aware of?',
                        'How should I prioritize next steps?',
                      ],
                    },
                  }
                : msg
            ),
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
          }));
        } catch (error) {
          console.error('Error sending message:', error);
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isLoading: false, error: true }
                : msg
            ),
            error: 'Failed to send message',
          }));
        }
      },

      setSelectedAgent: (agent: Agent | null) => {
        set({ selectedAgent: agent, error: null });
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
          console.log('=== LOADING AGENTS FROM DATABASE ===');
          const dbAgents = await agentService.getActiveAgents();
          console.log('Raw database agents:', dbAgents.length, 'found');

          const formattedAgents = dbAgents.map((agent) => agentService.convertToLegacyFormat(agent));
          console.log('Formatted agents for chat store:', formattedAgents.length);

          set((state) => ({
            agents: formattedAgents,
            selectedAgent: state.selectedAgent || formattedAgents[0] || null,
            isLoadingAgents: false,
          }));

          console.log('=== AGENTS LOADED SUCCESSFULLY ===', formattedAgents.length, 'agents');
        } catch (error) {
          console.error('Failed to load agents from database:', error);

          // Don't fall back to default agents - just show empty state with error
          set({
            agents: [],
            selectedAgent: null,
            isLoadingAgents: false,
            error: 'Failed to load agents from database. Please check your connection and try again.',
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
      version: 4, // Increment to force cache refresh for database-only agents
      migrate: (persistedState: any, version: number) => {
        // Always force reload agents from database on version change
        if (version < 4) {
          return {
            ...persistedState,
            agents: [], // Clear cached agents
            selectedAgent: null,
            error: null,
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
    }
  )
);
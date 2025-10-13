import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// import { agentService } from '@/features/agents/services/agent-service';
import { useAgentsStore, type Agent as GlobalAgent } from '@/lib/stores/agents-store';

export interface Agent {
  id: string;
  name: string;
  display_name?: string;
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

export interface EscalationEvent {
  id: string;
  fromTier: 1 | 2 | 3 | 'human';
  toTier: 1 | 2 | 3 | 'human';
  reason: string;
  timestamp: Date;
  confidence: number;
  cost: number;
}

export interface TierMetrics {
  tier1Calls: number;
  tier2Escalations: number;
  tier3Escalations: number;
  totalCost: number;
  averageResponseTime: number;
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

  // Agent Selection State
  suggestedAgents: any[];
  showAgentSelection: boolean;
  isWaitingForAgentSelection: boolean;

  // Dual-Mode State
  interactionMode: 'automatic' | 'manual' | 'autonomous'; // Agent selection mode
  autonomousMode: boolean; // Chat mode: normal (false) vs autonomous with tools (true)
  currentTier: 1 | 2 | 3 | 'human';
  escalationHistory: EscalationEvent[];
  tierMetrics: TierMetrics;
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
  
  // Orchestration Actions
  escalateToTier: (tier: 1 | 2 | 3 | 'human', reason: string) => void;
  recordEscalation: (from: 1 | 2 | 3 | 'human', to: 1 | 2 | 3 | 'human', reason: string, confidence: number, cost: number) => void;
  resetTierMetrics: () => void;
  setInteractionMode: (mode: 'automatic' | 'manual' | 'autonomous') => void;
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
  
  // Agent library management
  addAgentToLibrary: (agentId: string) => void;
  removeAgentFromLibrary: (agentId: string) => void;
  getLibraryAgents: () => Agent[];
  addAgentToChatStore: (agent: any) => void;
  clearSelectedAgent: () => void;
  setInteractionMode: (mode: 'automatic' | 'manual') => void;
  
  // Agent selection methods
  showAgentSelectionModal: (agents: any[]) => void;
  selectAgentFromSuggestions: (agent: any) => void;
  hideAgentSelection: () => void;
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

      // Agent Selection State
      suggestedAgents: [],
      showAgentSelection: false,
      isWaitingForAgentSelection: false,

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
        const { interactionMode, selectedAgent } = get();
        
        // Create orchestrator agent for automatic mode
        const orchestratorAgent = {
          id: 'orchestrator',
          name: 'AI Orchestrator',
          display_name: 'AI Orchestrator',
          description: 'Intelligently routes your queries to the most appropriate expert agent based on your question content and context.',
          business_function: 'Intelligent Agent Orchestration',
          capabilities: ['Agent Selection', 'Query Analysis', 'Expert Routing', 'Context Understanding'],
          tier: 1,
          color: 'text-blue-600',
          avatar: '🤖'
        };
        
        // Determine which agent to use for the chat
        const chatAgent = interactionMode === 'automatic' ? orchestratorAgent : selectedAgent;
        const chatTitle = chatAgent 
          ? `New conversation with ${chatAgent.display_name || chatAgent.name}`
          : 'New conversation with AI Assistant';
        
        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          title: chatTitle,
          createdAt: new Date(),
          updatedAt: new Date(),
          agentId: chatAgent?.id || (interactionMode === 'automatic' ? 'orchestrator' : 'default'),
          messageCount: 0,
          mode: interactionMode, // Track the mode for this chat
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChat: newChat,
          messages: [],
          selectedAgent: chatAgent || (interactionMode === 'automatic' ? orchestratorAgent : null),
          error: null,
          liveReasoning: '', // Clear any existing reasoning
          isReasoningActive: false, // Clear reasoning state
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

        console.log('📤 [sendMessage] Debug info:', {
          hasSelectedAgent: !!selectedAgent,
          interactionMode,
          content: content.substring(0, 50) + '...'
        });

        // Allow sending messages without pre-selected agent in automatic mode
        // The API will handle agent selection automatically
        if (!selectedAgent && interactionMode !== 'automatic') {
          console.warn('⚠️  No agent selected. Please select an agent before sending a message.');
          return;
        }

        // If no agent is selected but we're in automatic mode, proceed with message
        if (!selectedAgent && interactionMode === 'automatic') {
          console.log('🤖 Automatic mode: Proceeding without selected agent, API will handle routing');
        }

        // Auto-create a chat if one doesn't exist
        if (!currentChat) {
          const agentName = selectedAgent?.display_name || selectedAgent?.name || (interactionMode === 'automatic' ? 'AI Orchestrator' : 'AI Assistant');
          console.log('📝 Auto-creating new chat for selected agent:', agentName);
          const newChat: Chat = {
            id: `chat-${Date.now()}`,
            title: interactionMode === 'automatic' ? 'New conversation with AI Orchestrator' : `New conversation with ${agentName}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            agentId: selectedAgent?.id || (interactionMode === 'automatic' ? 'orchestrator' : 'default'),
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
            workflow_step: selectedAgent?.capabilities?.[0] || 'general',
            metadata_model: {
              name: selectedAgent?.name || 'Unknown Agent',
              display_name: selectedAgent?.name || 'Unknown Agent',
              description: selectedAgent?.description || 'AI Assistant',
              image_url: null,
              brain_id: selectedAgent?.id || 'default',
              brain_name: selectedAgent?.name || 'Unknown Agent',
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

          // Prepare request body
          const requestBody = {
            message: content,
            agent: selectedAgent || null, // Allow null agent in automatic mode
            userId: 'hicham.naim@curated.health', // TODO: Get from auth context
            sessionId: currentChat.id,
            model: get().selectedModel, // Include selected model
            chatHistory: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            ragEnabled: selectedAgent?.ragEnabled || false,
            automaticRouting: useAutomaticRouting, // Enable intelligent agent routing for automatic mode
            useIntelligentRouting: useAutomaticRouting
          };

          console.log('📤 Sending request to:', apiEndpoint);
          console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

          // Call the appropriate chat API with streaming support
          console.log('🌐 Making fetch request to:', apiEndpoint);
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify(requestBody)
          });

          console.log('📡 Response received:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            ok: response.ok
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText
            });
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }

          // Handle streaming response
          console.log('📖 Setting up streaming reader...');
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';
          let metadata: unknown = null;

          if (!reader) {
            console.error('❌ Response body is not readable');
            throw new Error('Response body is not readable');
          }

          console.log('✅ Streaming reader ready, starting to read chunks...');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonString = line.slice(6).trim();
                  if (!jsonString || typeof jsonString !== 'string') continue; // Skip empty data lines or non-strings
                  
                  console.log('🔍 [SSE] Raw JSON string:', jsonString);
                  console.log('🔍 [SSE] JSON string length:', jsonString.length);
                  console.log('🔍 [SSE] JSON string preview:', typeof jsonString === 'string' ? jsonString.substring(0, 100) + '...' : String(jsonString).substring(0, 100) + '...');
                  
                  const data = JSON.parse(jsonString);
                  
                  console.log('📥 [SSE] Parsed data:', { type: data.type, hasContent: !!data.content, keys: Object.keys(data) });

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
                    // Handle both streaming content and fullContent
                    if (data.content) {
                      fullContent += data.content;
                    } else if (data.fullContent) {
                      fullContent = data.fullContent;
                    }
                    
                    console.log('📥 [streaming] Received content chunk:', {
                      length: fullContent?.length || 0,
                      assistantMsgId: assistantMessage.id
                    });

                    // Update message with streaming content
                    console.log('🔄 [streaming] Updating message content:', {
                      messageId: assistantMessage.id,
                      contentLength: fullContent?.length || 0,
                      contentPreview: fullContent?.substring(0, 100) + '...'
                    });
                    
                    set((state) => {
                      const updatedMessages = state.messages.map((msg) =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: fullContent || '', isLoading: true }
                          : msg
                      );
                      
                      console.log('🔄 [Store Update] Updating messages in store:', {
                        messageId: assistantMessage.id,
                        totalMessages: updatedMessages.length,
                        updatedMessage: updatedMessages.find(msg => msg.id === assistantMessage.id),
                        allMessages: updatedMessages.map(msg => ({
                          id: msg.id,
                          role: msg.role,
                          contentLength: msg.content?.length || 0,
                          isLoading: msg.isLoading
                        }))
                      });
                      
                      return { messages: updatedMessages };
                    });
                  } else if (data.type === 'final') {
                    // Handle final message - set isLoading to false
                    console.log('✅ [streaming] Received final message:', {
                      length: data.content?.length || 0,
                      assistantMsgId: assistantMessage.id,
                      contentType: typeof data.content,
                      contentKeys: data.content ? Object.keys(data.content) : []
                    });
                    
                    // Handle nested content structure
                    if (data.content && typeof data.content === 'object' && data.content.content) {
                      fullContent = data.content.content;
                    } else if (typeof data.content === 'string') {
                      fullContent = data.content;
                    } else {
                      fullContent = fullContent; // Keep existing content
                    }
                    
                    // Update message with final content and stop loading
                    console.log('🏁 [final] Updating message with final content:', {
                      messageId: assistantMessage.id,
                      contentLength: fullContent?.length || 0,
                      contentPreview: fullContent?.substring(0, 100) + '...'
                    });
                    
                    set((state) => ({
                      messages: state.messages.map((msg) =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: fullContent || '', isLoading: false }
                          : msg
                      ),
                    }));
                  } else if (data.type === 'metadata') {
                    metadata = data.metadata;
                  } else if (data.type === 'agent_suggestions') {
                    // Show agent selection modal
                    console.log('🎯 Received agent suggestions:', data.suggestions);
                    set({
                      suggestedAgents: data.suggestions || [],
                      showAgentSelection: true,
                      isWaitingForAgentSelection: true,
                    });
                  } else if (data.type === 'waiting_for_selection') {
                    // User needs to select an agent
                    console.log('⏳ Waiting for user agent selection...');
                    // Don't close the stream, just wait
                  } else if (data.type === 'error') {
                    console.error('❌ [SSE] Error received:', data.error || data.content || 'Unknown error');
                    throw new Error(data.error || data.content || 'Unknown error');
                  } else {
                    console.log('🔍 [SSE] Unknown data type:', data.type, data);
                  }
                } catch (parseError) {
                  console.error('❌ [SSE] Failed to parse SSE data:', {
                    error: parseError,
                    rawLine: line,
                    jsonString: line.slice(6).trim(),
                    errorMessage: parseError.message,
                    errorStack: parseError.stack
                  });
                  // Continue processing other lines
                  continue;
                }
              }
            }
          }

          const processingTime = Date.now() - (assistantMessage.timestamp.getTime());

          // Update the assistant message with final metadata and clear live reasoning
          console.log('✅ [streaming complete] Finalizing message:', {
            fullContentLength: fullContent?.length || 0,
            hasMetadata: !!metadata,
            assistantMsgId: assistantMessage.id
          });

          // Only finalize if not already finalized by type: 'final' message
          const currentMessage = get().messages.find(msg => msg.id === assistantMessage.id);
          if (currentMessage?.isLoading) {
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === assistantMessage.id
                  ? {
                      ...msg,
                      content: fullContent || '',
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
          }

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

      // Orchestration Actions
      escalateToTier: (tier: 1 | 2 | 3 | 'human', reason: string) => {
        const { currentTier, escalationHistory } = get();
        const escalation: EscalationEvent = {
          id: `escalation-${Date.now()}`,
          fromTier: currentTier || 1,
          toTier: tier,
          reason,
          timestamp: new Date(),
          confidence: 0.8, // Default confidence
          cost: 0 // Will be calculated based on tier
        };
        
        set((state) => ({
          currentTier: tier,
          escalationHistory: [...state.escalationHistory, escalation]
        }));
      },

      recordEscalation: (from: 1 | 2 | 3 | 'human', to: 1 | 2 | 3 | 'human', reason: string, confidence: number, cost: number) => {
        const escalation: EscalationEvent = {
          id: `escalation-${Date.now()}`,
          fromTier: from,
          toTier: to,
          reason,
          timestamp: new Date(),
          confidence,
          cost
        };
        
        set((state) => ({
          escalationHistory: [...state.escalationHistory, escalation],
          tierMetrics: {
            ...state.tierMetrics,
            totalCost: state.tierMetrics.totalCost + cost,
            tier2Escalations: to === 2 ? state.tierMetrics.tier2Escalations + 1 : state.tierMetrics.tier2Escalations,
            tier3Escalations: to === 3 ? state.tierMetrics.tier3Escalations + 1 : state.tierMetrics.tier3Escalations
          }
        }));
      },

      resetTierMetrics: () => {
        set({
          tierMetrics: {
            tier1Calls: 0,
            tier2Escalations: 0,
            tier3Escalations: 0,
            totalCost: 0,
            averageResponseTime: 0
          },
          escalationHistory: []
        });
      },

      setInteractionMode: (mode: 'automatic' | 'manual' | 'autonomous') => {
        set({ interactionMode: mode });
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
          console.log('🔍 ChatStore: Loading agents from database...');
          
          // Use the API route to fetch agents
          const response = await fetch('/api/agents-crud');
          
          if (!response.ok) {
            throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const dbAgents = data.agents || [];
          
          console.log(`✅ ChatStore: Loaded ${dbAgents.length} agents from database`);
          
          // Transform agents to match the expected format
          const formattedAgents = dbAgents.map((agent: any) => ({
            id: agent.id,
            name: agent.display_name || agent.name,
            description: agent.description || 'AI Health Agent',
            avatar: agent.avatar || '🤖',
            businessFunction: agent.business_function || agent.role || 'General',
            category: `Tier ${agent.tier}`,
            capabilities: agent.capabilities || [],
            specialties: agent.specializations || [],
            tier: `Tier ${agent.tier}`,
            isActive: agent.status === 'active',
            ragEnabled: agent.rag_enabled || true,
            isCustom: false,
            metadata: {
              priority: agent.priority,
              implementation_phase: agent.implementation_phase,
              medical_specialty: agent.medical_specialty,
              clinical_validation_status: agent.clinical_validation_status,
              medical_accuracy_score: agent.medical_accuracy_score,
              hipaa_compliant: agent.hipaa_compliant,
              pharma_enabled: agent.pharma_enabled,
              verify_enabled: agent.verify_enabled,
              fda_samd_class: agent.fda_samd_class
            }
          }));

          set((state) => ({
            agents: formattedAgents,
            // Don't auto-select first agent - keep current selection or null
            selectedAgent: state.selectedAgent || null,
            isLoadingAgents: false,
          }));
        } catch (error) {
          console.error('❌ ChatStore: Failed to load agents from database:', error);

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
          const { agents } = get();
          return agents.filter(agent => 
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (agent.businessFunction && agent.businessFunction.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        } catch (error) {
          console.error('Failed to search agents:', error);
          return [];
        }
      },

      getAgentsByCategory: async (categoryName: string) => {
        try {
          const { agents } = get();
          return agents.filter(agent => 
            agent.businessFunction?.toLowerCase() === categoryName.toLowerCase() ||
            agent.category?.toLowerCase() === categoryName.toLowerCase()
          );
        } catch (error) {
          console.error('Failed to get agents by category:', error);
          return [];
        }
      },

      getAgentsByTier: async (tier: number) => {
        try {
          const { agents } = get();
          return agents.filter(agent => agent.tier === tier);
        } catch (error) {
          console.error('Failed to get agents by tier:', error);
          return [];
        }
      },

      // Global agents store integration
      syncWithGlobalStore: () => {
        try {
          // Check if useAgentsStore is available and has getState method
          if (!useAgentsStore || typeof useAgentsStore.getState !== 'function') {
            console.warn('useAgentsStore not available or getState method missing');
            return;
          }
          
          const globalState = useAgentsStore.getState();
          if (!globalState || !Array.isArray(globalState.agents)) {
            console.warn('Global agents not available or not an array');
            return;
          }
          
          const convertedAgents = globalState.agents.map((agent: GlobalAgent) => ({
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
        } catch (error) {
          console.error('Failed to sync with global agents store:', error);
        }
      },

      subscribeToGlobalChanges: () => {
        try {
          return useAgentsStore.subscribe((state) => {
            const chatStore = get();
            chatStore.syncWithGlobalStore();
          });
        } catch (error) {
          console.error('Failed to subscribe to global agents store changes:', error);
          return () => {}; // Return empty unsubscribe function
        }
      },

      // Add agent to user's library
      addAgentToLibrary: (agentId: string) => {
        console.log('➕ Adding agent to library:', agentId);
        set((state) => {
          const newLibraryAgents = [...state.libraryAgents, agentId];
          console.log('📝 Updated libraryAgents:', newLibraryAgents);
          console.log('📊 Library agents count:', newLibraryAgents.length);
          return {
            libraryAgents: newLibraryAgents
          };
        });
      },

      // Remove agent from user's library
      removeAgentFromLibrary: (agentId: string) => {
        set((state) => ({
          libraryAgents: state.libraryAgents.filter(id => id !== agentId)
        }));
      },

      // Add agent to chat store (for user copies)
      addAgentToChatStore: (agent: any) => {
        console.log('➕ Adding agent to chat store:', agent.id);
        set((state) => {
          const newAgents = [...state.agents, agent];
          console.log('📊 Chat store agents count after add:', newAgents.length);
          console.log('📋 All chat store agents:', newAgents.map(a => ({ id: a.id, name: a.name })));
          return {
            agents: newAgents
          };
        });
      },

      // Clear selected agent
      clearSelectedAgent: () => {
        console.log('🧹 Clearing selected agent');
        set({
          selectedAgent: null,
          liveReasoning: '',
          isReasoningActive: false,
        });
      },

      // Agent Selection Actions
      showAgentSelectionModal: (agents: any[]) => {
        console.log('🎯 Showing agent selection modal with agents:', agents.length);
        set({
          suggestedAgents: agents,
          showAgentSelection: true,
          isWaitingForAgentSelection: true,
        });
      },

      selectAgentFromSuggestions: (agent: any) => {
        console.log('✅ User selected agent:', agent.name);
        console.log('🔍 Agent details:', {
          id: agent.id,
          name: agent.name,
          display_name: agent.display_name,
          description: agent.description
        });
        set({
          selectedAgent: agent,
          showAgentSelection: false,
          isWaitingForAgentSelection: false,
          suggestedAgents: [],
        });
        console.log('✅ Agent selection state updated');
      },

      hideAgentSelection: () => {
        console.log('❌ Hiding agent selection modal');
        set({
          showAgentSelection: false,
          isWaitingForAgentSelection: false,
          suggestedAgents: [],
        });
      },

      // Set interaction mode and handle agent switching
      setInteractionMode: (mode: 'automatic' | 'manual') => {
        console.log('🔄 Switching interaction mode to:', mode);
        
        // Create orchestrator agent for automatic mode
        const orchestratorAgent = {
          id: 'orchestrator',
          name: 'AI Orchestrator',
          display_name: 'AI Orchestrator',
          description: 'Intelligently routes your queries to the most appropriate expert agent based on your question content and context.',
          business_function: 'Intelligent Agent Orchestration',
          capabilities: ['Agent Selection', 'Query Analysis', 'Expert Routing', 'Context Understanding'],
          tier: 1,
          color: 'text-blue-600',
          avatar: '🤖'
        };
        
        set((state) => ({
          interactionMode: mode,
          selectedAgent: mode === 'automatic' ? orchestratorAgent : null,
          liveReasoning: '',
          isReasoningActive: false,
        }));
      },

      // Get agents in user's library
      getLibraryAgents: () => {
        const { agents, libraryAgents } = get();
        console.log('🔍 getLibraryAgents called:', {
          agentsCount: agents?.length || 0,
          libraryAgentsCount: libraryAgents?.length || 0,
          libraryAgents: libraryAgents,
          agentsType: typeof agents,
          agentsIsArray: Array.isArray(agents)
        });
        
        // Ensure agents is an array before filtering
        if (!Array.isArray(agents)) {
          console.error('❌ Agents is not an array:', agents);
          return [];
        }
        
        if (!Array.isArray(libraryAgents)) {
          console.error('❌ LibraryAgents is not an array:', libraryAgents);
          return [];
        }
        
        // If no agents in library, return all agents (first 5) without modifying state
        if (libraryAgents.length === 0 && agents.length > 0) {
          console.log('📚 No library agents, returning first 5 agents');
          return agents.slice(0, 5);
        }
        
        // If no agents at all, try to load them
        if (agents.length === 0) {
          console.log('📚 No agents available, attempting to load from database');
          // Trigger async load but return empty array for now
          get().loadAgentsFromDatabase().catch(error => {
            console.error('Failed to load agents from database:', error);
          });
          return [];
        }
        
        const filteredAgents = agents.filter(agent => libraryAgents.includes(agent.id));
        console.log('📚 Filtered library agents:', filteredAgents.length);
        return filteredAgents;
      },
    }),
    {
      name: 'chat-store',
      version: 6, // Increment to force cache refresh - include libraryAgents in persistence
      migrate: (persistedState: unknown, version: number) => {
        // Always force reload agents from database on version change
        if (version < 5) {
          return {
            ...persistedState,
            agents: [], // Clear cached agents
            selectedAgent: null,
            error: null,
            messages: [], // Clear messages - they're loaded per-chat from separate storage
            libraryAgents: [], // Initialize library agents
          };
        }
        // For version 6, ensure libraryAgents is initialized but preserve existing ones
        if (version < 6) {
          return {
            ...persistedState,
            libraryAgents: (persistedState as any)?.libraryAgents || [], // Preserve existing library agents
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state, store) => {
        // Automatically load agents from database after rehydration
        if (state && store) {
          // Load agents from database
          store.loadAgentsFromDatabase().then(() => {
            // After loading agents, initialize library if empty
            const currentState = store.getState();
            const { agents, libraryAgents } = currentState;
            if (libraryAgents.length === 0 && agents.length > 0) {
              console.log('📚 Initializing library with first 5 agents');
              const firstFiveAgentIds = agents.slice(0, 5).map(agent => agent.id);
              store.setState({ libraryAgents: firstFiveAgentIds });
            }
          }).catch((error) => {
            console.error('Failed to load agents on rehydration:', error);
            // Set empty state to prevent errors
            store.setState({ 
              agents: [], 
              selectedAgent: null, 
              error: 'Failed to load agents from database' 
            });
          });
        }
      },
      // Exclude messages and transient state from persistence to avoid conflicts
      partialize: (state) => ({
        chats: state.chats,
        currentChat: state.currentChat,
        selectedAgent: state.selectedAgent,
        selectedModel: state.selectedModel,
        agents: state.agents,
        libraryAgents: state.libraryAgents, // Include library agents for persistence
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
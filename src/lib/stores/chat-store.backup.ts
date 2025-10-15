import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// import { agentService } from '@/features/agents/services/agent-service';
import { useAgentsStore, type Agent as GlobalAgent } from '@/lib/stores/agents-store';
import { retryWithExponentialBackoff, isRetryableError } from '@/lib/utils/retry';

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
  agentId: string | null;
  agentName?: string | null;
  messages: ChatMessage[];
  messageCount: number;
  lastMessage?: string;
  mode?: 'automatic' | 'manual' | 'autonomous'; // Track which mode was used for this chat
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ToolOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'knowledge' | 'analysis' | 'regulatory';
  enabled: boolean;
}

export interface ChatStore {
  // State
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  input: string;
  selectedAgent: Agent | null; // Primary/active agent for chat
  selectedAgents: Agent[]; // All selected agents
  activeAgentId: string | null; // Currently active agent ID
  selectedModel: AIModel | null;
  agents: Agent[];
  libraryAgents: string[]; // Agent IDs in user's library
  isLoading: boolean;
  isLoadingAgents: boolean;
  error: string | null;
  liveReasoning: string;
  isReasoningActive: boolean;
  currentReasoning: Array<{
    title: string;
    description?: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    details?: any;
    tools?: string[];
  }>;
  reasoningEvents: Array<{
    type: 'reasoning' | 'complete' | 'error';
    step: string;
    description?: string;
    data?: Record<string, any>;
    timestamp: Date;
  }>;
  abortController: AbortController | null;

  // Agent Selection State
  suggestedAgents: any[];
  showAgentSelection: boolean;
  isWaitingForAgentSelection: boolean;

  // Tool Selection State
  selectedTools: string[];
  availableTools: ToolOption[];
  showToolSelection: boolean;
  isWaitingForToolSelection: boolean;

  // Workflow State
  workflowState: {
    currentStep: string;
    requiresInput: boolean;
    availableActions: string[];
  };

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
  setInput: (input: string) => void;
  setSelectedAgent: (agent: Agent | null) => Promise<string>;
  setSelectedAgents: (agents: Agent[]) => void;
  addSelectedAgent: (agent: Agent) => void;
  removeSelectedAgent: (agentId: string) => void;
  setActiveAgent: (agentId: string | null) => void;
  setSelectedModel: (model: AIModel | null) => void;
  createCustomAgent: (agent: Omit<Agent, 'id' | 'isCustom'>) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  deleteAgent: (agentId: string) => void;
  
  // Orchestration Actions
  escalateToTier: (tier: 1 | 2 | 3 | 'human', reason: string) => void;
  recordEscalation: (from: 1 | 2 | 3 | 'human', to: 1 | 2 | 3 | 'human', reason: string, confidence: number, cost: number) => void;
  resetTierMetrics: () => void;
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

  // Tool Selection Actions
  setSelectedTools: (tools: string[]) => void;
  toggleTool: (toolId: string) => void;
  setAvailableTools: (tools: ToolOption[]) => void;
  selectToolFromSuggestions: (tool: ToolOption) => void;
  setShowToolSelection: (show: boolean) => void;
  setIsWaitingForToolSelection: (waiting: boolean) => void;

  // Workflow Actions
  resumeWorkflow: (input: any) => Promise<void>;
  updateWorkflowState: (state: Partial<{ currentStep: string; requiresInput: boolean; availableActions: string[] }>) => void;

  // Global agents store integration
  syncWithGlobalStore: () => void;
  subscribeToGlobalChanges: () => () => void;
  getAgents: () => Agent[];
  searchAgents: (searchTerm: string) => Agent[];
  getAgentsByCategory: (categoryName: string) => Agent[];
  getAgentsByTier: (tier: number) => Agent[];

  // Chat management
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  pinChat: (chatId: string) => void;
  archiveChat: (chatId: string) => void;
  
  // Agent library management
  addAgentToLibrary: (agentId: string) => void;
  removeAgentFromLibrary: (agentId: string) => void;
  getLibraryAgents: () => Agent[];
  addAgentToChatStore: (agent: any) => void;
  clearSelectedAgent: () => void;
  // Agent selection methods
  showAgentSelectionModal: (agents: any[]) => void;
  selectAgentFromSuggestions: (agent: any) => Promise<void>;
  selectAgent: (agentId: string) => Promise<void>;
  hideAgentSelection: () => void;
  
  // Reasoning methods
  updateCurrentReasoning: (reasoning: Array<{
    title: string;
    description?: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    details?: any;
    tools?: string[];
  }>) => void;

  // Validation helper
  validateCanSend: () => { valid: boolean; reason: string | null };

  // Cleanup helper
  cleanup: () => void;
  addReasoningEvent: (event: {
    type: 'reasoning' | 'complete' | 'error';
    step: string;
    description?: string;
    data?: Record<string, any>;
  }) => void;
  clearReasoningEvents: () => void;
}

const _useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      currentChat: null,
      messages: [],
      input: '', // Add input state
      selectedAgent: null,
      selectedAgents: [],
      activeAgentId: null,
      selectedModel: null,
      agents: [], // Start empty, will be loaded from database
      libraryAgents: [], // Agent IDs in user's library
      isLoading: false,
      isLoadingAgents: false,
      error: null,
      liveReasoning: '',
      isReasoningActive: false,
      currentReasoning: [],
      reasoningEvents: [],
      abortController: null,

      // Agent Selection State
      suggestedAgents: [],
      showAgentSelection: false,
      isWaitingForAgentSelection: false,

    // Tool Selection State
    selectedTools: [],
    availableTools: [],
    showToolSelection: false,
    isWaitingForToolSelection: false,

    // Workflow State
    workflowState: {
      currentStep: 'idle',
      requiresInput: false,
      availableActions: []
    },

  // Dual-Mode Initial State
  interactionMode: 'manual',
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
        const { currentChat, selectedAgent, messages, interactionMode, isLoading } = get();

        // Prevent re-entrancy
        if (isLoading) {
          console.warn('⚠️  Already processing a message');
          return;
        }

        console.log('📤 [sendMessage] Debug info:', {
          hasSelectedAgent: !!selectedAgent,
          selectedAgentId: selectedAgent?.id,
          selectedAgentName: selectedAgent?.name,
          selectedAgentDisplayName: selectedAgent?.display_name,
          interactionMode,
          content: content.substring(0, 50) + '...',
          currentChatId: currentChat?.id,
          currentChatExists: !!currentChat
        });

        // LAYER 1: Store-level validation
        if (interactionMode === 'manual' && !selectedAgent?.id) {
          console.error('❌ [LAYER 1] No agent selected in manual mode');
          set({ 
            error: 'Manual Mode requires an agent. Please select an AI agent from the left panel.',
            isLoading: false 
          });
          return; // CRITICAL: Stop before creating messages
        }

        // Clear previous errors and set loading
        set({ error: null, isLoading: true });

        // If no agent is selected but we're in automatic mode, proceed with message
        if (!selectedAgent && interactionMode === 'automatic') {
          console.log('🤖 Automatic mode: Proceeding without selected agent, API will handle routing');
        }

        let updatedCurrentChat = currentChat;

        // Auto-create a chat if one doesn't exist
        if (!updatedCurrentChat) {
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
          updatedCurrentChat = newChat;
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
        const updatedMessages = [...(messages || []), userMessage, assistantMessage];
        console.log('🔍 [sendMessage] Adding messages to store:', {
          totalMessages: updatedMessages.length,
          userMessageId: userMessage.id,
          assistantMessageId: assistantMessage.id,
          chatId: updatedCurrentChat?.id || 'unknown'
        });
        set({
          messages: updatedMessages,
          isLoading: false,
          error: null,
          liveReasoning: '',
          isReasoningActive: false,
          reasoningEvents: [], // Clear previous reasoning events
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
            sessionId: updatedCurrentChat?.id || 'unknown',
            model: get().selectedModel, // Include selected model
            chatHistory: (messages || []).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            ragEnabled: selectedAgent?.ragEnabled || false,
            interactionMode: interactionMode, // Pass the actual interaction mode
            autonomousMode: autonomousMode, // Pass the autonomous mode
            selectedTools: get().selectedTools, // Pass selected tools
            automaticRouting: useAutomaticRouting, // Enable intelligent agent routing for automatic mode
            useIntelligentRouting: useAutomaticRouting
          };

          console.log('📤 [sendMessage] Request body being sent:', {
            message: content.substring(0, 50) + '...',
            agent: selectedAgent ? {
              id: selectedAgent.id,
              name: selectedAgent.name,
              display_name: selectedAgent.display_name
            } : null,
            interactionMode,
            autonomousMode,
            sessionId: updatedCurrentChat?.id || 'unknown'
          });

          console.log('📤 Sending request to:', apiEndpoint);
          console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

          // Call the appropriate chat API with streaming support
          console.log('🌐 Making fetch request to:', apiEndpoint);
          const response = await retryWithExponentialBackoff(
            () => fetch(apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
              body: JSON.stringify(requestBody)
            }),
            {
              maxAttempts: 3,
              initialDelay: 1000,
              shouldRetry: isRetryableError
            }
          );

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
          
          // Clear previous reasoning events and start fresh
          set({
            reasoningEvents: [],
            isReasoningActive: true,
            liveReasoning: ''
          });

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
                    // Track reasoning events for dynamic display
                    set((state) => ({
                      liveReasoning: state.liveReasoning
                        ? `${state.liveReasoning}\n${data.description || data.content || ''}`
                        : (data.description || data.content || ''),
                      isReasoningActive: true,
                      reasoningEvents: [
                        ...state.reasoningEvents,
                        {
                          type: data.type,
                          step: data.step || 'processing',
                          description: data.description || data.content || 'Processing...',
                          data: data.data || {}
                        }
                      ]
                    }));
                  } else if (data.type === 'reasoning_done') {
                    // Reasoning complete, store in message metadata
                    set({
                      isReasoningActive: false,
                    });
                    // The final reasoning will be stored in metadata
                  } else if (data.type === 'complete') {
                    // Workflow completed
                    console.log('✅ [SSE] Workflow completed');
                    set({
                      isReasoningActive: false,
                    });
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
                    console.log('🎯 Received agent suggestions:', data.content);
                    set({
                      suggestedAgents: data.content || [],
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
          if (currentChat?.id) {
            localStorage.setItem(
              `chat-messages-${currentChat.id}`,
              JSON.stringify(finalMessages)
            );
          }

          // Update chat metadata
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === currentChat?.id
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
              error: String(error),
              abortController: null,
            }));
          }
        } finally {
          // Always ensure loading state is cleared
          set({ isLoading: false });
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

      setSelectedAgent: async (agent: Agent | null) => {
        console.log('🔄 [setSelectedAgent] Called with:', {
          agentId: agent?.id,
          agentName: agent?.name,
          agentDisplayName: agent?.display_name,
          isNull: agent === null
        });
        
        return new Promise<string>((resolve) => {
          set({ 
            selectedAgent: agent, 
            activeAgentId: agent?.id || null,
            error: null,
            // Clear any previous errors when selecting agent
            liveReasoning: '',
            isReasoningActive: false
          });
          
          // Wait for state update to complete
          setTimeout(() => {
            const currentState = get();
            console.log('✅ [setSelectedAgent] Agent selection confirmed:', {
              requestedAgent: agent?.name,
              actualSelectedAgent: currentState.selectedAgent?.name,
              selectedAgentId: currentState.selectedAgent?.id,
              stateUpdated: !!currentState.selectedAgent
            });
            resolve('ack'); // Return acknowledgment
          }, 0);
        });
      },

      setSelectedAgents: (agents: Agent[]) => {
        console.log('🔄 [setSelectedAgents] Setting multiple agents:', {
          count: agents.length,
          agentIds: agents.map(a => a.id),
          agentNames: agents.map(a => a.name)
        });
        
        set({ 
          selectedAgents: agents,
          selectedAgent: agents.length > 0 ? agents[0] : null,
          activeAgentId: agents.length > 0 ? agents[0].id : null
        });
      },

      addSelectedAgent: (agent: Agent) => {
        const { selectedAgents } = get();
        const isAlreadySelected = selectedAgents.some(a => a.id === agent.id);
        
        if (!isAlreadySelected) {
          const newSelectedAgents = [...selectedAgents, agent];
          console.log('➕ [addSelectedAgent] Adding agent:', {
            agentId: agent.id,
            agentName: agent.name,
            totalSelected: newSelectedAgents.length
          });
          
          set({ 
            selectedAgents: newSelectedAgents,
            selectedAgent: agent, // Set as primary agent
            activeAgentId: agent.id
          });
        }
      },

      removeSelectedAgent: (agentId: string) => {
        const { selectedAgents, selectedAgent, activeAgentId } = get();
        const newSelectedAgents = selectedAgents.filter(a => a.id !== agentId);
        
        console.log('➖ [removeSelectedAgent] Removing agent:', {
          agentId,
          remainingCount: newSelectedAgents.length
        });
        
        // If we removed the active agent, set a new active agent
        let newSelectedAgent = selectedAgent;
        let newActiveAgentId = activeAgentId;
        
        if (selectedAgent?.id === agentId) {
          newSelectedAgent = newSelectedAgents.length > 0 ? newSelectedAgents[0] : null;
          newActiveAgentId = newSelectedAgents.length > 0 ? newSelectedAgents[0].id : null;
        }
        
        set({ 
          selectedAgents: newSelectedAgents,
          selectedAgent: newSelectedAgent,
          activeAgentId: newActiveAgentId
        });
      },

      setActiveAgent: (agentId: string | null) => {
        const { selectedAgents } = get();
        const agent = agentId ? selectedAgents.find(a => a.id === agentId) : null;
        
        console.log('🔄 [setActiveAgent] Setting active agent:', {
          agentId,
          agentName: agent?.name,
          found: !!agent
        });
        
        set({ 
          selectedAgent: agent,
          activeAgentId: agentId
        });
      },

      setInput: (input: string) => {
        set({ input });
      },

      setSelectedModel: (model: AIModel | null) => {
        set({ selectedModel: model, error: null });
      },

      // Dual-Mode Actions Implementation
      setInteractionMode: (mode: 'automatic' | 'manual') => {
        console.log('🔄 [setInteractionMode] Switching to:', mode);
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
        console.log('✅ [setInteractionMode] Mode set to:', mode);
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

      // Global agents store integration
      getAgents: () => {
        try {
          // Check if useAgentsStore is available
          if (!useAgentsStore || typeof useAgentsStore.getState !== 'function') {
            console.error('❌ [getAgents] useAgentsStore not available:', {
              useAgentsStore: !!useAgentsStore,
              getState: typeof useAgentsStore?.getState
            });
            return [];
          }
          
          const globalAgents = useAgentsStore.getState().agents;
          console.log('🔍 [getAgents] Global agents from store:', {
            isArray: Array.isArray(globalAgents),
            length: globalAgents?.length || 0,
            firstAgent: globalAgents?.[0]?.id || 'none'
          });
          
          // Ensure we have an array
          if (!Array.isArray(globalAgents)) {
            console.warn('Global agents store returned non-array:', globalAgents);
            return [];
          }
          // Transform global agents to chat store format
          const transformedAgents = globalAgents.map(agent => ({
            id: agent.id,
            name: agent.name,
            display_name: agent.display_name,
            description: agent.description,
            systemPrompt: agent.system_prompt,
            model: agent.model,
            avatar: agent.avatar,
            color: agent.color,
            capabilities: agent.capabilities || [],
            ragEnabled: agent.rag_enabled,
            temperature: agent.temperature,
            maxTokens: agent.max_tokens,
            isCustom: agent.is_custom,
            knowledgeDomains: agent.knowledge_domains || [],
            businessFunction: agent.business_function,
            department: agent.department,
            organizationalRole: agent.organizational_role,
            tier: agent.tier,
          }));
          
          console.log('🔍 [getAgents] Transformed agents:', {
            count: transformedAgents.length,
            firstAgentId: transformedAgents[0]?.id || 'none'
          });
          
          return transformedAgents;
        } catch (error) {
          console.error('Error getting agents from global store:', error);
          return [];
        }
      },

      searchAgents: (searchTerm: string) => {
        const agents = get().getAgents();
        return agents.filter(agent => 
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (agent.businessFunction && agent.businessFunction.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      },

      getAgentsByCategory: (categoryName: string) => {
        const agents = get().getAgents();
        return agents.filter(agent => 
          agent.knowledgeDomains?.includes(categoryName) ||
          agent.businessFunction?.toLowerCase().includes(categoryName.toLowerCase())
        );
      },

      getAgentsByTier: (tier: number) => {
        const agents = get().getAgents();
        return agents.filter(agent => agent.tier === tier);
      },

      // Chat management
      createNewChat: () => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          agentId: null,
          agentName: null,
        };

        set(state => ({
          chats: [newChat, ...state.chats],
          currentChat: newChat,
          messages: [],
          selectedAgent: null,
        }));
      },

      selectChat: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId);
        if (chat) {
          const agents = get().getAgents();
          const foundAgent = chat.agentId ? agents.find(a => a.id === chat.agentId) : null;
          
          console.log('🔍 [selectChat] Chat selection debug:', {
            chatId,
            chatAgentId: chat.agentId,
            totalAgents: agents.length,
            foundAgent: foundAgent ? {
              id: foundAgent.id,
              name: foundAgent.name,
              display_name: foundAgent.display_name
            } : null,
            agentIds: agents.map(a => a.id).slice(0, 5) // First 5 agent IDs for debugging
          });
          
          set({
            currentChat: chat,
            messages: chat.messages,
            selectedAgent: foundAgent,
          });
        }
      },

      deleteChat: (chatId: string) => {
        set(state => ({
          chats: state.chats.filter(c => c.id !== chatId),
          currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
          messages: state.currentChat?.id === chatId ? [] : state.messages,
        }));
      },

      pinChat: (chatId: string) => {
        set(state => ({
          chats: state.chats.map(c => 
            c.id === chatId ? { ...c, isPinned: !c.isPinned } : c
          ),
        }));
      },

      archiveChat: (chatId: string) => {
        set(state => ({
          chats: state.chats.map(c => 
            c.id === chatId ? { ...c, isArchived: !c.isArchived } : c
          ),
        }));
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

      selectAgentFromSuggestions: async (agent: any) => {
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
        
        console.log('✅ Agent selection complete, resuming workflow...');
        
        // Resume workflow with selected agent
        const lastUserMessage = get().messages.findLast(msg => msg.role === 'user');
        if (lastUserMessage) {
          await get().resumeWorkflow({
            message: lastUserMessage.content,
            agent: agent
          });
        }
      },

      selectAgent: async (agentId: string) => {
        const { setSelectedAgent, getAgents } = get();
        
        // Get agents from global store
        const agents = getAgents();
        console.log('🔍 [selectAgent] Available agents:', {
          agentId,
          totalAgents: agents.length,
          agentIds: agents.map(a => a.id),
          foundAgent: agents.find(a => a.id === agentId)
        });
        
        const agent = agents.find(a => a.id === agentId);
        
        if (!agent) {
          console.error('❌ [selectAgent] Agent not found:', {
            requestedId: agentId,
            availableIds: agents.map(a => a.id),
            totalAgents: agents.length
          });
          throw new Error(`Agent with ID ${agentId} not found`);
        }

        console.log('✅ Agent selected via selectAgent:', agent.name);
        
        // Use the async setSelectedAgent for proper acknowledgment
        const ack = await setSelectedAgent(agent);
        if (!ack) {
          throw new Error('Agent selection failed - no acknowledgment');
        }
        
        // Update other state
        set({
          showAgentSelection: false,
          isWaitingForAgentSelection: false,
          error: null
        });

        // Update current chat with selected agent
        const { currentChat } = get();
        if (currentChat) {
          set(state => ({
            chats: state.chats.map(chat => 
              chat.id === currentChat.id 
                ? { 
                    ...chat, 
                    agentId: agent.id, 
                    agentName: agent.display_name || agent.name,
                    updatedAt: new Date()
                  }
                : chat
            ),
            currentChat: {
              ...currentChat,
              agentId: agent.id,
              agentName: agent.display_name || agent.name,
              updatedAt: new Date()
            }
          }));
        }
      },

      hideAgentSelection: () => {
        console.log('❌ Hiding agent selection modal');
        set({
          showAgentSelection: false,
          isWaitingForAgentSelection: false,
          suggestedAgents: [],
        });
      },

      updateCurrentReasoning: (reasoning) => {
        set({ currentReasoning: reasoning });
      },

      // Add reasoning event
      addReasoningEvent: (event: {
        type: 'reasoning' | 'complete' | 'error';
        step: string;
        description?: string;
        data?: Record<string, any>;
      }) => {
        set((state) => ({
          reasoningEvents: [
            ...state.reasoningEvents,
            {
              ...event,
              timestamp: new Date(),
            },
          ],
        }));
      },

      // Clear reasoning events
      clearReasoningEvents: () => {
        set({ reasoningEvents: [] });
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

      // Tool Selection Actions
      setSelectedTools: (tools: string[]) => {
        set({ selectedTools: tools });
      },

      toggleTool: (toolId: string) => {
        const { selectedTools } = get();
        const newSelectedTools = selectedTools.includes(toolId)
          ? selectedTools.filter(id => id !== toolId)
          : [...selectedTools, toolId];
        set({ selectedTools: newSelectedTools });
      },

      setAvailableTools: (tools: ToolOption[]) => {
        set({ availableTools: tools });
      },

      selectToolFromSuggestions: (tool: ToolOption) => {
        console.log('✅ User selected tool:', tool.name);
        set({
          selectedTools: [...get().selectedTools, tool.id],
          showToolSelection: false,
          isWaitingForToolSelection: false,
        });
      },

      setShowToolSelection: (show: boolean) => {
        set({ showToolSelection: show });
      },

    setIsWaitingForToolSelection: (waiting: boolean) => {
      set({ isWaitingForToolSelection: waiting });
    },

    // Workflow Actions
    resumeWorkflow: async (input: any) => {
      try {
        console.log('🔄 Resuming workflow with input:', input);
        
        // Update workflow state
        set({
          workflowState: {
            currentStep: 'processing',
            requiresInput: false,
            availableActions: []
          }
        });

        // Call API to resume workflow
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input.message || input.query || '',
            userId: get().conversationContext?.userId || 'anonymous',
            sessionId: get().conversationContext?.sessionId || `session-${Date.now()}`,
            agent: input.agent,
            interactionMode: get().interactionMode,
            autonomousMode: get().autonomousMode,
            selectedTools: get().selectedTools,
            chatHistory: get().messages
          })
        });

        if (!response.ok) {
          throw new Error(`Workflow resume failed: ${response.statusText}`);
        }

        console.log('✅ Workflow resumed successfully');
      } catch (error) {
        console.error('❌ Failed to resume workflow:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to resume workflow'
        });
      }
    },

    updateWorkflowState: (state) => {
      set({
        workflowState: {
          ...get().workflowState,
          ...state
        }
      });
    },

    // Validation helper
    validateCanSend: () => {
      const { selectedAgent, interactionMode, isLoading } = get();
      
      if (isLoading) {
        return { valid: false, reason: 'Already processing a message' };
      }
      
      if (interactionMode === 'manual' && !selectedAgent) {
        return { 
          valid: false, 
          reason: 'Please select an AI agent in Manual Mode' 
        };
      }
      
      return { valid: true, reason: null };
    },

    // Cleanup helper
    cleanup: () => {
      const { abortController } = get();
      if (abortController) {
        console.log('🧹 Cleaning up abort controller');
        abortController.abort();
        set({ abortController: null, isLoading: false });
      }
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
        selectedAgents: state.selectedAgents, // Include multiple selected agents
        activeAgentId: state.activeAgentId, // Include active agent ID
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
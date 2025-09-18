import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { agentService, type AgentWithCategories } from '@/lib/agents/agent-service';

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
  setSelectedAgent: (agent: Agent) => void;
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
}

// Predefined agents for healthcare domain
const defaultAgents: Agent[] = [
  {
    id: 'regulatory-expert',
    name: 'Regulatory Expert',
    description: 'FDA/EMA regulatory guidance and compliance expert',
    systemPrompt: `You are a highly experienced regulatory affairs specialist with deep expertise in FDA, EMA, and global medical device regulations. You provide accurate, up-to-date guidance on:

- Regulatory pathways (510(k), PMA, CE marking, MDR)
- Clinical trial design and requirements
- Quality management systems (ISO 13485)
- Risk management (ISO 14971)
- Compliance strategies and timelines

Always cite relevant regulations and provide actionable recommendations. Be concise but thorough in your responses.`,
    model: 'gpt-4',
    avatar: '/avatars/13_businessman, people, avatar, man, male, employee, tie.svg',
    color: 'text-trust-blue',
    capabilities: ['Regulatory Guidance', 'Compliance Review', 'Pathway Planning'],
    ragEnabled: true,
    temperature: 0.3,
    maxTokens: 2000,
    knowledgeDomains: ['regulatory', 'digital-health'],
    businessFunction: 'Regulatory Affairs',
    role: 'Regulatory Specialist',
  },
  {
    id: 'clinical-researcher',
    name: 'Clinical Research Assistant',
    description: 'Clinical study design and evidence generation expert',
    systemPrompt: `You are a clinical research expert specializing in digital health and medical devices. Your expertise includes:

- Clinical study design and protocol development
- Evidence generation strategies
- Statistical analysis and endpoints
- Real-world evidence (RWE) studies
- Health economics and outcomes research (HEOR)
- Clinical data management and analysis

Provide evidence-based recommendations with proper clinical research methodology. Focus on feasible, cost-effective study designs.`,
    model: 'gpt-4',
    avatar: '/avatars/12_business, female, nurse, people, woman, doctor, avatar.svg',
    color: 'text-clinical-green',
    capabilities: ['Study Design', 'Evidence Strategy', 'Protocol Review'],
    ragEnabled: true,
    temperature: 0.4,
    maxTokens: 2000,
    knowledgeDomains: ['clinical-research', 'digital-health'],
    businessFunction: 'Clinical Development',
    role: 'Clinical Research Associate',
  },
  {
    id: 'market-access',
    name: 'Market Access Strategist',
    description: 'Healthcare economics and market access expert',
    systemPrompt: `You are a market access and health economics expert for digital health technologies. Your specialties include:

- Health technology assessment (HTA)
- Reimbursement strategies and coding
- Value-based healthcare models
- Health economics modeling
- Payer engagement and evidence requirements
- Market entry strategies

Provide strategic guidance on demonstrating value and securing reimbursement for digital health solutions.`,
    model: 'gpt-4',
    avatar: '/avatars/30_glasses, businessman, people, male, man, avatar, blonde.svg',
    color: 'text-market-purple',
    capabilities: ['HTA Strategy', 'Reimbursement', 'Value Demonstration'],
    ragEnabled: true,
    temperature: 0.5,
    maxTokens: 2000,
    knowledgeDomains: ['market-access', 'health-economics'],
    businessFunction: 'Market Access',
    role: 'Market Access Manager',
  },
  {
    id: 'technical-architect',
    name: 'Technical Architect',
    description: 'Healthcare technology and integration expert',
    systemPrompt: `You are a senior technical architect specializing in healthcare technology systems. Your expertise covers:

- Healthcare system integration (HL7 FHIR, DICOM)
- Cybersecurity and data privacy (HIPAA, GDPR)
- Cloud architecture and scalability
- Interoperability standards
- API design and data exchange
- Technical risk assessment

Provide technical guidance on building secure, compliant, and scalable healthcare technology solutions.`,
    model: 'gpt-4',
    avatar: '/avatars/31_male, glasses, hacker, people, man, programmer, avatar.svg',
    color: 'text-innovation-orange',
    capabilities: ['System Architecture', 'Security', 'Integration'],
    ragEnabled: true,
    temperature: 0.3,
    maxTokens: 2000,
    knowledgeDomains: ['digital-health', 'quality-assurance'],
    businessFunction: 'Information Technology',
    role: 'Technical Architect',
  },
  {
    id: 'business-strategist',
    name: 'Business Strategist',
    description: 'Healthcare business development and strategy expert',
    systemPrompt: `You are a healthcare business strategist with extensive experience in digital health commercialization. Your expertise includes:

- Business model development
- Go-to-market strategies
- Partnership and channel strategies
- Competitive analysis and positioning
- Revenue models and pricing
- Stakeholder engagement

Provide strategic business guidance for successfully launching and scaling digital health solutions.`,
    model: 'gpt-4',
    avatar: '/avatars/32_male, leader, manager, people, man, boss, avatar.svg',
    color: 'text-regulatory-gold',
    capabilities: ['Business Strategy', 'Commercialization', 'Market Analysis'],
    ragEnabled: true,
    temperature: 0.6,
    maxTokens: 2000,
    knowledgeDomains: ['market-access', 'digital-health', 'health-economics'],
    businessFunction: 'Business Development',
    role: 'Strategic Business Lead',
  },
  {
    id: 'medical-affairs-specialist',
    name: 'Medical Affairs Specialist',
    description: 'Medical affairs and scientific communication expert',
    systemPrompt: `You are a medical affairs specialist with expertise in pharmaceutical and medical device companies. Your expertise includes:

- Medical communications and scientific writing
- Clinical data analysis and interpretation
- Key opinion leader (KOL) engagement
- Medical education and training programs
- Regulatory medical writing
- Post-market surveillance and safety

Provide evidence-based medical insights and strategic guidance for healthcare product lifecycle management.`,
    model: 'gpt-4',
    avatar: '/avatars/14_female, doctor, nurse, people, woman, healthcare, avatar.svg',
    color: 'text-clinical-green',
    capabilities: ['Medical Writing', 'Clinical Data Analysis', 'KOL Engagement'],
    ragEnabled: true,
    temperature: 0.4,
    maxTokens: 2000,
    knowledgeDomains: ['clinical-research', 'regulatory'],
    businessFunction: 'Medical Affairs',
    role: 'Medical Science Liaison',
  },
  {
    id: 'hr-business-partner',
    name: 'HR Business Partner',
    description: 'Human resources and talent management expert',
    systemPrompt: `You are an HR business partner specializing in pharmaceutical and healthcare organizations. Your expertise includes:

- Talent acquisition and retention strategies
- Performance management and development
- Organizational design and change management
- Compensation and benefits strategy
- Employee relations and engagement
- Compliance with healthcare industry regulations

Provide strategic HR guidance for building high-performing healthcare teams.`,
    model: 'gpt-4',
    avatar: '/avatars/15_business, female, woman, people, manager, professional, avatar.svg',
    color: 'text-market-purple',
    capabilities: ['Talent Management', 'Performance Management', 'Organizational Development'],
    ragEnabled: true,
    temperature: 0.5,
    maxTokens: 2000,
    knowledgeDomains: ['digital-health'],
    businessFunction: 'Human Resources',
    role: 'HR Business Partner',
  },
];

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      currentChat: null,
      messages: [],
      selectedAgent: null,
      agents: [],
      isLoading: false,
      isLoadingAgents: false,
      error: null,

      // Actions
      createNewChat: () => {
        const { selectedAgent } = get();
        if (!selectedAgent) return;

        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          title: `New conversation with ${selectedAgent.name}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          agentId: selectedAgent.id,
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
          agentId: selectedAgent.id,
          attachments,
        };

        // Add placeholder assistant message
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          content: '',
          role: 'assistant',
          timestamp: new Date(),
          agentId: selectedAgent.id,
          isLoading: true,
          metadata: {
            citations: [],
            followupQuestions: [],
            sources: [],
            processingTime: 0,
            tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            workflow_step: selectedAgent.capabilities[0],
            metadata_model: {
              name: selectedAgent.name,
              display_name: selectedAgent.name,
              description: selectedAgent.description,
              image_url: null,
              brain_id: selectedAgent.id,
              brain_name: selectedAgent.name,
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
          // Send request to API with streaming
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: content,
              agent: selectedAgent,
              chatHistory: messages.slice(-10), // Send last 10 messages for context
              ragEnabled: selectedAgent.ragEnabled,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to get response');
          }

          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            let buffer = '';
            let lastUpdateTime = 0;
            const UPDATE_THROTTLE = 100; // Update UI at most every 100ms

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));

                    if (data.type === 'content') {
                      const now = Date.now();

                      // Throttle updates to improve performance
                      if (now - lastUpdateTime > UPDATE_THROTTLE) {
                        lastUpdateTime = now;

                        set((state) => {
                          const updatedMessages = state.messages.map((msg) =>
                            msg.id === assistantMessage.id
                              ? { ...msg, content: data.fullContent, isLoading: false }
                              : msg
                          );
                          return { messages: updatedMessages };
                        });
                      }
                    } else if (data.type === 'metadata') {
                      // Update with final metadata and mark as complete
                      // Use current state to preserve streaming content
                      set((state) => {
                        const finalMessages = state.messages.map((msg) =>
                          msg.id === assistantMessage.id
                            ? {
                                ...msg,
                                metadata: data.metadata,
                                isLoading: false,
                              }
                            : msg
                        );

                        // Update chat title if this is the first message
                        let updatedChat = currentChat;
                        if (currentChat.messageCount === 0) {
                          updatedChat = {
                            ...currentChat,
                            title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
                            messageCount: 2,
                            lastMessage: finalMessages[finalMessages.length - 1].content.slice(0, 100),
                            updatedAt: new Date(),
                          };
                        } else {
                          updatedChat = {
                            ...currentChat,
                            messageCount: currentChat.messageCount + 2,
                            lastMessage: finalMessages[finalMessages.length - 1].content.slice(0, 100),
                            updatedAt: new Date(),
                          };
                        }

                        // Persist messages
                        localStorage.setItem(
                          `chat-messages-${currentChat.id}`,
                          JSON.stringify(finalMessages)
                        );

                        return {
                          messages: finalMessages,
                          currentChat: updatedChat,
                          chats: state.chats.map((c) => c.id === currentChat.id ? updatedChat : c),
                        };
                      });
                    } else if (data.type === 'error') {
                      throw new Error(data.error);
                    }
                  } catch (parseError) {
                    console.error('Failed to parse streaming data:', parseError);
                  }
                }
              }
            }
          }

        } catch (error) {
          console.error('Failed to send message:', error);

          // Update assistant message with error
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === assistantMessage.id
                ? {
                    ...msg,
                    content: 'I apologize, but I encountered an error while processing your message. Please try again.',
                    isLoading: false,
                    error: true,
                  }
                : msg
            ),
            error: error instanceof Error ? error.message : 'An error occurred',
          }));
        }
      },

      setSelectedAgent: (agent: Agent) => {
        set({ selectedAgent: agent });
      },

      createCustomAgent: (agentData) => {
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
        }));
      },

      deleteAgent: (agentId: string) => {
        set((state) => {
          const updatedAgents = state.agents.filter((a) => a.id !== agentId);
          return {
            agents: updatedAgents,
            selectedAgent: state.selectedAgent?.id === agentId
              ? updatedAgents[0] || null
              : state.selectedAgent,
          };
        });
      },

      clearError: () => {
        set({ error: null });
      },

      regenerateResponse: async (messageId: string) => {
        // Implementation for regenerating a specific response
        console.log('Regenerating response for message:', messageId);
      },

      editMessage: (messageId: string, newContent: string) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content: newContent } : msg
          ),
        }));
      },

      // New database-powered actions
      loadAgentsFromDatabase: async () => {
        set({ isLoadingAgents: true, error: null });

        try {
          const dbAgents = await agentService.getActiveAgents();
          const formattedAgents = dbAgents.map((agent) => agentService.convertToLegacyFormat(agent));

          set((state) => ({
            agents: formattedAgents,
            selectedAgent: state.selectedAgent || formattedAgents[0] || null,
            isLoadingAgents: false,
          }));
        } catch (error) {
          console.error('Failed to load agents from database:', error);

          // Fallback to default agents if database fails
          set((state) => ({
            agents: defaultAgents,
            selectedAgent: state.selectedAgent || defaultAgents[0],
            isLoadingAgents: false,
            error: 'Failed to load agents from database. Using default agents.',
          }));
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
    }),
    {
      name: 'vitalpath-chat-store',
      version: 3, // Increment this to force cache refresh when defaultAgents change
      partialize: (state) => ({
        chats: state.chats,
        agents: state.agents,
        selectedAgent: state.selectedAgent,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.chats) {
          // Convert date strings back to Date objects
          state.chats = state.chats.map(chat => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
          }));
        }
        // Force update agents to use new defaultAgents with updated fields
        if (state && state.agents && state.agents.length > 0) {
          const needsUpdate = state.agents.some(agent =>
            !agent.isCustom && (
              (agent.avatar && !agent.avatar.startsWith('/avatars/')) ||
              !agent.businessFunction ||
              !agent.role
            )
          );
          if (needsUpdate) {
            console.log('Updating agents with new fields (avatars, businessFunction, role)...');
            // Merge with defaultAgents to get updated fields
            state.agents = state.agents.map(agent => {
              if (!agent.isCustom) {
                const defaultAgent = defaultAgents.find(da => da.id === agent.id);
                if (defaultAgent) {
                  return {
                    ...agent,
                    avatar: defaultAgent.avatar,
                    businessFunction: defaultAgent.businessFunction,
                    role: defaultAgent.role
                  };
                }
              }
              return agent;
            });
          }
        }
      },
    }
  )
);
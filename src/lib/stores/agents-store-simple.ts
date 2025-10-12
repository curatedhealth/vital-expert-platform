import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Agent {
  id: string;
  name: string;
  display_name: string;
  description: string;
  system_prompt: string;
  model: string;
  avatar: string;
  color: string;
  capabilities: string[];
  rag_enabled: boolean;
  temperature: number;
  max_tokens: number;
  is_custom: boolean;
  status: "development" | "testing" | "active" | "deprecated";
  tier: number;
  priority: number;
  implementation_phase: number;
  knowledge_domains: string[];
  business_function: string;
  department: string;
  organizational_role: string;
  created_at: string;
  updated_at: string;
  is_user_copy?: boolean;
  isCustom?: boolean;
}

export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const useAgentsStore = create<{
  agents: Agent[];
  categories: AgentCategory[];
  loading: boolean;
  error: string | null;
  loadAgents: () => Promise<void>;
  loadCategories: () => Promise<void>;
  searchAgents: (searchTerm: string) => Promise<Agent[]>;
  getAgentsByCategory: (categoryName: string) => Promise<Agent[]>;
  getAgentsByTier: (tier: number) => Promise<Agent[]>;
  getAgentsByPhase: (phase: number) => Promise<Agent[]>;
  createCustomAgent: (agentData: Partial<Agent>) => Promise<Agent>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  createUserCopy: (agentId: string) => Promise<Agent>;
}>()(
  persist(
    (set, get) => ({
      agents: [],
      categories: [],
      loading: false,
      error: null,

      loadAgents: async () => {
        set({ loading: true, error: null });
        try {
          // Mock data for now
          const mockAgents: Agent[] = [
            {
              id: '1',
              name: 'clinical-trial',
              display_name: 'Clinical Trial Designer',
              description: 'Expert in clinical trial design and methodology',
              system_prompt: 'You are a clinical trial design expert...',
              model: 'gpt-4',
              avatar: '',
              color: '#6366f1',
              capabilities: ['trial-design', 'statistics'],
              rag_enabled: true,
              temperature: 0.7,
              max_tokens: 2000,
              is_custom: false,
              status: 'active',
              tier: 1,
              priority: 1,
              implementation_phase: 1,
              knowledge_domains: ['clinical-research'],
              business_function: 'research',
              department: 'clinical',
              organizational_role: 'researcher',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ];
          set({ agents: mockAgents, loading: false });
        } catch (error) {
          set({ error: 'Failed to load agents', loading: false });
        }
      },

      loadCategories: async () => {
        try {
          const mockCategories: AgentCategory[] = [
            {
              id: '1',
              name: 'Clinical Research',
              description: 'Clinical trial and research agents',
              color: '#6366f1',
              icon: 'flask'
            }
          ];
          set({ categories: mockCategories });
        } catch (error) {
          set({ error: 'Failed to load categories' });
        }
      },

      searchAgents: async (searchTerm: string) => {
        const { agents } = get();
        return agents.filter(agent => 
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.display_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      },

      getAgentsByCategory: async (categoryName: string) => {
        const { agents } = get();
        return agents.filter(agent => 
          agent.knowledge_domains.includes(categoryName)
        );
      },

      getAgentsByTier: async (tier: number) => {
        const { agents } = get();
        return agents.filter(agent => agent.tier === tier);
      },

      getAgentsByPhase: async (phase: number) => {
        const { agents } = get();
        return agents.filter(agent => agent.implementation_phase === phase);
      },

      createCustomAgent: async (agentData: Partial<Agent>) => {
        const newAgent: Agent = {
          id: Date.now().toString(),
          name: agentData.name || 'custom-agent',
          display_name: agentData.display_name || 'Custom Agent',
          description: agentData.description || '',
          system_prompt: agentData.system_prompt || '',
          model: agentData.model || 'gpt-4',
          avatar: agentData.avatar || '',
          color: agentData.color || '#6366f1',
          capabilities: agentData.capabilities || [],
          rag_enabled: agentData.rag_enabled || false,
          temperature: agentData.temperature || 0.7,
          max_tokens: agentData.max_tokens || 2000,
          is_custom: true,
          status: 'active',
          tier: agentData.tier || 1,
          priority: agentData.priority || 1,
          implementation_phase: agentData.implementation_phase || 1,
          knowledge_domains: agentData.knowledge_domains || [],
          business_function: agentData.business_function || '',
          department: agentData.department || '',
          organizational_role: agentData.organizational_role || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(state => ({
          agents: [...state.agents, newAgent]
        }));

        return newAgent;
      },

      updateAgent: async (id: string, updates: Partial<Agent>) => {
        set(state => ({
          agents: state.agents.map(agent =>
            agent.id === id ? { ...agent, ...updates, updated_at: new Date().toISOString() } : agent
          )
        }));
      },

      deleteAgent: async (id: string) => {
        set(state => ({
          agents: state.agents.filter(agent => agent.id !== id)
        }));
      },

      createUserCopy: async (agentId: string) => {
        const { agents } = get();
        const originalAgent = agents.find(agent => agent.id === agentId);
        
        if (!originalAgent) {
          throw new Error('Agent not found');
        }

        const userCopy: Agent = {
          ...originalAgent,
          id: Date.now().toString(),
          name: `${originalAgent.name}-user-copy`,
          display_name: `${originalAgent.display_name} (Copy)`,
          is_user_copy: true,
          isCustom: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set(state => ({
          agents: [...state.agents, userCopy]
        }));

        return userCopy;
      },
    }),
    {
      name: 'agents-store',
      partialize: (state) => ({ agents: state.agents, categories: state.categories }),
    }
  )
);

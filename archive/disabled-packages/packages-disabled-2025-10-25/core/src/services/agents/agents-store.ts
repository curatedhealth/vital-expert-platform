'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  businessFunction?: string;
  category?: string;
  capabilities?: string[];
  specialties?: string[];
  tier?: string;
  isActive?: boolean;
  ragEnabled?: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

interface AgentsState {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  selectedAgent: Agent | null;

  // Actions
  loadAgents: () => Promise<void>;
  getAgent: (id: string) => Agent | undefined;
  setSelectedAgent: (agent: Agent | null) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  clearError: () => void;
}

export const __useAgentsStore = create<AgentsState>()(
  persist(
    (set, get) => ({
      agents: [],
      isLoading: false,
      error: null,
      selectedAgent: null,

      loadAgents: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/agents-crud');

          if (!response.ok) {
            throw new Error('Failed to load agents');
          }

          // Handle the response structure from agents-crud API
          const data = await response.json();
          const agentsData = Array.isArray(data) ? data : data.agents || [];

          // Transform agents to match expected interface
          const transformedAgents = agentsData.map((agent: any) => ({
            id: agent.id, // Use actual UUID from database
            name: agent.display_name || agent.name,
            description: agent.description || agent.capabilities?.join(', ') || 'AI Health Agent',
            avatar: agent.avatar,
            businessFunction: agent.business_function || agent.role,
            category: `Tier ${agent.tier}`,
            capabilities: agent.capabilities || [],
            specialties: agent.specializations || [],
            tier: `Tier ${agent.tier}`,
            isActive: agent.status === 'active',
            ragEnabled: agent.rag_enabled || true,
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

          set({
            agents: transformedAgents,
            isLoading: false
          });
        } catch (error) {
          // console.error('Failed to load agents:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to load agents',
            isLoading: false
          });
        }
      },

      getAgent: (id: string) => {
        return get().agents.find(agent => agent.id === id);
      },

      setSelectedAgent: (agent: Agent | null) => {
        set({ selectedAgent: agent });
      },

      addAgent: (agent: Agent) => {
        set(state => ({
          agents: [...state.agents, agent]
        }));
      },

      updateAgent: (id: string, updates: Partial<Agent>) => {
        set(state => ({
          agents: state.agents.map(agent =>
            agent.id === id ? { ...agent, ...updates } : agent
          )
        }));
      },

      deleteAgent: (id: string) => {
        set(state => ({
          agents: state.agents.filter(agent => agent.id !== id),
          selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent
        }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'agents-store',
      partialize: (state) => ({
        agents: state.agents,
        selectedAgent: state.selectedAgent,
      }),
    }
  )
);

// Helper functions for agent management
export const __getAgentsByCategory = (category: string, agents: Agent[]) => {
  return agents.filter(agent =>
    agent.businessFunction === category ||
    agent.category === category
  );
};

export const __getAgentsByCapability = (capability: string, agents: Agent[]) => {
  return agents.filter(agent =>
    agent.capabilities?.some(cap =>
      cap.toLowerCase().includes(capability.toLowerCase())
    )
  );
};

export const __searchAgents = (query: string, agents: Agent[]) => {

  return agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm) ||
    agent.description.toLowerCase().includes(searchTerm) ||
    agent.businessFunction?.toLowerCase().includes(searchTerm) ||
    agent.capabilities?.some(cap => cap.toLowerCase().includes(searchTerm))
  );
};
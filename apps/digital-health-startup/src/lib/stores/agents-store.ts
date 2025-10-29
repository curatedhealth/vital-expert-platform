import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { agentService, type Agent as DbAgent } from '@/features/agents/services/agent-service';

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
  is_custom?: boolean;
  // User ownership fields
  user_id?: string;
  is_user_copy?: boolean;
  original_agent_id?: string;
  copied_at?: string;
  status: 'development' | 'testing' | 'active' | 'deprecated';
  tier: number;
  priority: number;
  implementation_phase: number;
  knowledge_domains?: string[];
  business_function?: string | null; // Business function name
  department?: string | null; // Department name
  role?: string | null; // Role name or UUID
  organizational_role?: string | null; // Organizational role name (mapped from role_id)
  // Foreign key IDs
  business_function_id?: string | null; // UUID foreign key to business_functions table
  department_id?: string | null; // UUID foreign key to departments table
  role_id?: string | null; // UUID foreign key to organizational_roles table
  function_id?: string | null; // UUID foreign key to org_functions table (legacy)
  categories?: string[];
  domain_expertise?: string;

  // Healthcare Compliance Fields
  medical_specialty?: string;
  clinical_validation_status?: 'pending' | 'validated' | 'expired' | 'under_review';
  medical_accuracy_score?: number; // 0-1 scale
  citation_accuracy?: number; // 0-1 scale
  hallucination_rate?: number; // 0-1 scale
  medical_error_rate?: number; // 0-1 scale
  fda_samd_class?: string; // 'I', 'IIa', 'IIb', 'III'
  hipaa_compliant?: boolean;
  pharma_enabled?: boolean;
  verify_enabled?: boolean;
  last_clinical_review?: string;
  medical_reviewer_id?: string;
  cost_per_query?: number;
  average_latency_ms?: number;
  audit_trail?: Record<string, unknown>;

  created_at?: string;
  updated_at?: string;
}

export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  color?: string;
  sort_order: number;
}

export interface AgentsStore {
  // State
  agents: Agent[];
  categories: AgentCategory[];
  selectedAgent: Agent | null;
  isLoading: boolean;
  isLoadingCategories: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  loadAgents: (showAll?: boolean) => Promise<void>;
  loadCategories: () => Promise<void>;
  refreshAgents: () => Promise<void>;
  searchAgents: (searchTerm: string) => Promise<Agent[]>;
  getAgentsByCategory: (categoryName: string) => Promise<Agent[]>;
  getAgentsByTier: (tier: number) => Promise<Agent[]>;
  getAgentsByPhase: (phase: number) => Promise<Agent[]>;
  getAgentById: (id: string) => Agent | null;
  getAgentByName: (name: string) => Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  createCustomAgent: (agentData: Partial<Agent>) => Promise<Agent>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  clearError: () => void;

  // User agent copy functions
  createUserCopy: (originalAgent: Agent) => Promise<Agent>;
  getUserAgents: () => Agent[];
  canEditAgent: (agent: Agent) => boolean;

  // Legacy format conversion (for backwards compatibility)
  convertToLegacyFormat: (agent: Agent) => any;
  convertFromLegacyFormat: (legacyAgent: unknown) => Agent;

  // Global synchronization
  syncAcrossViews: () => void;
  subscribeToChanges: (callback: (agents: Agent[]) => void) => () => void;
}

// Global event emitter for cross-component synchronization
class AgentEventEmitter {
  private listeners: Set<(agents: Agent[]) => void> = new Set();

  subscribe(callback: (agents: Agent[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(agents: Agent[]) {
    this.listeners.forEach(callback => callback(agents));
  }
}

const agentEventEmitter = new AgentEventEmitter();

// Convert database agent to store format
// Note: The API already normalizes display_name and resolves avatar URLs, so we preserve those values
const convertDbAgentToStoreFormat = (dbAgent: DbAgent | any): Agent => {
  const metadata = dbAgent.metadata || {};
  
  // The API already provides normalized data, so we should preserve it
  // Check if dbAgent already has display_name (from API normalization)
  const displayName = dbAgent.display_name || metadata.display_name || dbAgent.name;
  
  // The API already resolves avatar URLs from icons table, so preserve the resolved value
  const avatarValue = dbAgent.avatar || metadata.avatar || '🤖';
  
  const converted = {
    id: dbAgent.id,
    name: dbAgent.name, // Keep unique ID for internal use
    display_name: displayName, // Prefer API-normalized display_name
    description: dbAgent.description,
    system_prompt: dbAgent.system_prompt,
    model: dbAgent.model || metadata.model || 'gpt-4',
    avatar: avatarValue, // Use API-resolved avatar URL/path
    color: dbAgent.color || metadata.color || '#6366f1',
    capabilities: Array.isArray(dbAgent.capabilities) ? dbAgent.capabilities as string[] : [],
    rag_enabled: dbAgent.rag_enabled ?? metadata.rag_enabled ?? false,
    temperature: dbAgent.temperature ?? metadata.temperature ?? 0.7,
    max_tokens: dbAgent.max_tokens ?? metadata.max_tokens ?? 2000,
    is_custom: dbAgent.is_custom ?? metadata.is_custom ?? false,
    status: dbAgent.status || metadata.status || "active",
    tier: dbAgent.tier ?? metadata.tier ?? 1,
    priority: 1, // Default priority since it's not in the actual schema
    implementation_phase: dbAgent.implementation_phase ?? metadata.implementation_phase ?? 1,
    knowledge_domains: dbAgent.knowledge_domains || metadata.knowledge_domains || [],
    business_function: dbAgent.business_function || metadata.business_function || '',
    department: dbAgent.department || metadata.department || '',
    role: dbAgent.role || metadata.role || '',
    organizational_role: dbAgent.organizational_role || metadata.organizational_role || metadata.role || '',
    is_user_copy: dbAgent.is_user_copy ?? metadata.is_user_copy ?? false,
    original_agent_id: dbAgent.original_agent_id || metadata.original_agent_id || null,
    copied_at: dbAgent.copied_at || metadata.copied_at || null,
    created_at: dbAgent.created_at || new Date().toISOString(),
    updated_at: dbAgent.updated_at || new Date().toISOString(),
    // Preserve metadata for any additional fields
    metadata: dbAgent.metadata || metadata,
  };

  console.log(`🔄 Converted agent "${converted.display_name}" (${converted.name}): tier=${converted.tier}, status=${converted.status}, avatar=${converted.avatar}`);
  return converted;
};

// Convert store agent to database format
const convertStoreAgentToDbFormat = (storeAgent: Agent): Partial<DbAgent> => {
  return {
    name: storeAgent.name,
    description: storeAgent.description,
    system_prompt: storeAgent.system_prompt,
    capabilities: storeAgent.capabilities,
    metadata: {
      display_name: storeAgent.display_name,
      model: storeAgent.model,
      avatar: storeAgent.avatar,
      color: storeAgent.color,
      temperature: storeAgent.temperature,
      max_tokens: storeAgent.max_tokens,
      rag_enabled: storeAgent.rag_enabled,
      implementation_phase: storeAgent.implementation_phase,
      business_function: storeAgent.business_function,
      department: storeAgent.department,
      role: storeAgent.role,
      tier: storeAgent.tier,
      status: storeAgent.status,
      is_custom: storeAgent.is_custom,
      knowledge_domains: storeAgent.knowledge_domains,
      is_user_copy: storeAgent.is_user_copy,
      original_agent_id: storeAgent.original_agent_id,
      copied_at: storeAgent.copied_at,
      ...storeAgent.metadata,
    },
  };
};

export const useAgentsStore = create<AgentsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      agents: [],
      categories: [],
      selectedAgent: null,
      isLoading: false,
      isLoadingCategories: false,
      error: null,
      lastUpdated: null,

      // Load agents from database
      // Set showAll=true to load all agents regardless of status (for agents management page)
      // Set showAll=false to load only active/testing agents (for chat/services)
      loadAgents: async (showAll: boolean = true) => {
        console.log(`📦 AgentsStore: loadAgents(showAll=${showAll}) called`);
        set({ isLoading: true, error: null });

        try {
          const dbAgents = await agentService.getActiveAgents(showAll);
          console.log(`📦 AgentsStore: Received ${dbAgents.length} agents from service`);

          const agents = dbAgents.map(convertDbAgentToStoreFormat);
          console.log(`📦 AgentsStore: Converted to ${agents.length} store-format agents`);

          set({
            agents,
            isLoading: false,
            lastUpdated: new Date(),
          });

          console.log(`📦 AgentsStore: State updated with ${agents.length} agents`);

          // Emit change event for global synchronization
          agentEventEmitter.emit(agents);

        } catch (error) {
          console.error('❌ AgentsStore: Failed to load agents:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load agents',
          });
        }
      },

      // Load categories from database
      loadCategories: async () => {
        set({ isLoadingCategories: true });

        try {
          const dbCategories = await agentService.getCategories();
          const categories = dbCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description || '',
            color: cat.color,
            sort_order: cat.sort_order,
          }));

          set({
            categories,
            isLoadingCategories: false,
          });

        } catch (error) {
          console.error('Failed to load categories:', error);
          set({
            isLoadingCategories: false,
            error: error instanceof Error ? error.message : 'Failed to load categories',
          });
        }
      },

      // Refresh agents
      refreshAgents: async () => {
        const { loadAgents } = get();
        await loadAgents();
      },

      // Search agents
      searchAgents: async (searchTerm: string) => {
        try {
          const dbAgents = await agentService.searchAgents(searchTerm);
          return dbAgents.map(convertDbAgentToStoreFormat);
        } catch (error) {
          console.error('Failed to search agents:', error);
          return [];
        }
      },

      // Get agents by category
      getAgentsByCategory: async (categoryName: string) => {
        try {
          const dbAgents = await agentService.getAgentsByCategory(categoryName);
          return dbAgents.map(convertDbAgentToStoreFormat);
        } catch (error) {
          console.error('Failed to get agents by category:', error);
          return [];
        }
      },

      // Get agents by tier
      getAgentsByTier: async (tier: number) => {
        try {
          const dbAgents = await agentService.getAgentsByTier(tier);
          return dbAgents.map(convertDbAgentToStoreFormat);
        } catch (error) {
          console.error('Failed to get agents by tier:', error);
          return [];
        }
      },

      // Get agents by phase
      getAgentsByPhase: async (phase: number) => {
        try {
          const dbAgents = await agentService.getAgentsByPhase(phase);
          return dbAgents.map(convertDbAgentToStoreFormat);
        } catch (error) {
          console.error('Failed to get agents by phase:', error);
          return [];
        }
      },

      // Get agent by ID
      getAgentById: (id: string) => {
        const { agents } = get();
        return agents.find((agent: any) => agent.id === id) || null;
      },

      // Get agent by name
      getAgentByName: (name: string) => {
        const { agents } = get();
        return agents.find((agent: any) => agent.name === name || agent.display_name === name) || null;
      },

      // Set selected agent
      setSelectedAgent: (agent: Agent | null) => {
        set({ selectedAgent: agent });
      },

      // Create custom agent
      createCustomAgent: async (agentData: Partial<Agent>) => {
        const fullAgentData: Partial<DbAgent> = {
          ...convertStoreAgentToDbFormat(agentData as Agent),
          metadata: {
            ...convertStoreAgentToDbFormat(agentData as Agent).metadata,
            is_custom: true,
            status: 'active',
            tier: 1,
            implementation_phase: 1,
          },
        };

        try {
          const dbAgent = await agentService.createCustomAgent(fullAgentData as unknown);
          const newAgent = convertDbAgentToStoreFormat(dbAgent);

          set(state => ({
            agents: [...state.agents, newAgent],
            lastUpdated: new Date(),
          }));

          // Emit change event
          const { agents } = get();
          agentEventEmitter.emit(agents);

          return newAgent;
        } catch (error) {
          console.error('Failed to create custom agent:', error);
          throw error;
        }
      },

      // Update agent
      updateAgent: async (id: string, updates: Partial<Agent>) => {
        const dbUpdates = convertStoreAgentToDbFormat(updates as Agent);

        try {
          await agentService.updateAgent(id, dbUpdates);
          set(state => ({
            agents: state.agents.map((agent: any) =>
              agent.id === id ? { ...agent, ...updates } : agent
            ),
            lastUpdated: new Date(),
          }));

          // Emit change event
          const { agents } = get();
          agentEventEmitter.emit(agents);
        } catch (error) {
          console.error('❌ AgentsStore.updateAgent: Failed to update agent');
          console.error('- Error:', error);
          console.error('- Error type:', typeof error);
          console.error('- Error message:', (error as unknown)?.message);
          console.error('- Error stack:', (error as unknown)?.stack);
          throw error;
        }
      },

      // Delete agent
      deleteAgent: async (id: string) => {
        try {
          await agentService.deleteAgent(id);

          set(state => ({
            agents: state.agents.filter((agent: any) => agent.id !== id),
            selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent,
            lastUpdated: new Date(),
          }));

          // Emit change event
          const { agents } = get();
          agentEventEmitter.emit(agents);

        } catch (error) {
          console.error('Failed to delete agent:', error);
          throw error;
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Convert to legacy format (for backwards compatibility with ChatStore)
      convertToLegacyFormat: (agent: Agent) => {
        return {
          id: agent.name, // Legacy uses name as ID
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
          isCustom: agent.is_custom,
          knowledgeDomains: agent.knowledge_domains,
          businessFunction: agent.business_function,
          role: agent.role,
          department: agent.department,
          organizationalRole: (agent as any).organizational_role || agent.role,
          tier: agent.tier,
        };
      },

      // Convert from legacy format
      convertFromLegacyFormat: (legacyAgent: unknown) => {
        return {
          id: legacyAgent.id,
          name: legacyAgent.id,
          display_name: legacyAgent.name,
          description: legacyAgent.description,
          system_prompt: legacyAgent.systemPrompt,
          model: legacyAgent.model,
          avatar: legacyAgent.avatar,
          color: legacyAgent.color,
          capabilities: legacyAgent.capabilities || [],
          rag_enabled: legacyAgent.ragEnabled,
          temperature: legacyAgent.temperature,
          max_tokens: legacyAgent.maxTokens,
          is_custom: legacyAgent.isCustom,
          status: 'active' as const,
          tier: 1,
          priority: 100,
          implementation_phase: 1,
          knowledge_domains: legacyAgent.knowledgeDomains,
          business_function: legacyAgent.businessFunction,
          role: legacyAgent.role,
        } as Agent;
      },

      // Create user copy of an agent
      createUserCopy: async (originalAgent: Agent) => {
        const userCopyData: Partial<Agent> = {
          ...originalAgent,
          name: `${originalAgent.name}_user_copy_${Date.now()}`, // Add timestamp to ensure uniqueness
          display_name: `${originalAgent.display_name} (My Copy)`,
          is_custom: true, // Mark as custom for now until we have user copy columns
          // Remove ID to generate new one
          id: undefined,
        };

        const dbUpdates = convertStoreAgentToDbFormat(userCopyData as Agent);

        try {
          const dbAgent = await agentService.createCustomAgent(dbUpdates as unknown);
          const newUserCopy = convertDbAgentToStoreFormat(dbAgent);

          // Add user copy metadata to the converted agent
          newUserCopy.is_user_copy = true;
          newUserCopy.original_agent_id = originalAgent.id;
          newUserCopy.copied_at = new Date().toISOString();

          set(state => ({
            agents: [...state.agents, newUserCopy],
            lastUpdated: new Date(),
          }));

          // Emit change event
          const { agents } = get();
          agentEventEmitter.emit(agents);
          return newUserCopy;
        } catch (error) {
          console.error('❌ Failed to create user copy:', error);
          throw error;
        }
      },

      // Get user's personal agents
      getUserAgents: () => {
        const { agents } = get();
        // For now, consider custom agents as user agents until we have proper user copy columns
        return agents.filter((agent: any) => agent.is_user_copy === true || agent.is_custom === true);
      },

      // Check if user can edit agent
      canEditAgent: (agent: Agent) => {
        // Users can only edit their own copies or custom agents
        return agent.is_user_copy === true || agent.is_custom === true;
      },

      // Global synchronization
      syncAcrossViews: () => {
        const { agents } = get();
        agentEventEmitter.emit(agents);
      },

      // Subscribe to changes
      subscribeToChanges: (callback: (agents: Agent[]) => void) => {
        return agentEventEmitter.subscribe(callback);
      },
    }),
    {
      name: 'vitalpath-agents-store',
      version: 3, // Incremented to clear old cache and force refresh with new display_name/avatar format
      partialize: (state) => ({
        // Don't persist agents array - always fetch fresh from API
        // agents: state.agents,
        categories: state.categories,
        selectedAgent: state.selectedAgent,
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.lastUpdated) {
          state.lastUpdated = new Date(state.lastUpdated);
        }
        // Force agents to empty array on rehydration so they'll be loaded fresh
        if (state) {
          state.agents = [];
        }
      },
    }
  )
);

// Export the global agents store instance
export const _agentsStore = useAgentsStore;
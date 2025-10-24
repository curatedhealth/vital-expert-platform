export interface Agent {
  id: string;
  name: string;
  display_name: string;
  description: string;
  system_prompt: string;
  model: string;
  avatar?: string;
  color?: string;
  capabilities?: string[];
  rag_enabled?: boolean;
  temperature?: number;
  max_tokens?: number;
  is_custom?: boolean;
  status?: 'development' | 'testing' | 'active' | 'deprecated';
  tier?: number;
  priority?: number;
  implementation_phase?: number;
  knowledge_domains?: string[];
  business_function?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentWithCategories extends Agent {
  categories?: string[];
}

export interface AgentWithCapabilities extends Agent {
  capabilities: string[];
}

export interface AgentCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  sort_order: number;
}

class AgentService {
  private baseUrl = '/api/agents-crud';

  async getActiveAgents(): Promise<Agent[]> {
    try {

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }

      return data.agents || [];
    } catch (error) {
      // console.error('Failed to fetch active agents:', error);
      return this.getMockAgents();
    }
  }

  async searchAgents(searchTerm: string): Promise<Agent[]> {
    try {

      if (!response.ok) {
        throw new Error(`Failed to search agents: ${response.statusText}`);
      }

      return data.agents || [];
    } catch (error) {
      // console.error('Failed to search agents:', error);
      return [];
    }
  }

  async getAgentsByCategory(categoryName: string): Promise<Agent[]> {
    try {

      if (!response.ok) {
        throw new Error(`Failed to fetch agents by category: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // console.error('Failed to fetch agents by category:', error);
      return [];
    }
  }

  async getAgentsByTier(tier: number): Promise<Agent[]> {
    try {

      if (!response.ok) {
        throw new Error(`Failed to fetch agents by tier: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // console.error('Failed to fetch agents by tier:', error);
      return [];
    }
  }

  async getAgentsByPhase(phase: number): Promise<Agent[]> {
    try {

      if (!response.ok) {
        throw new Error(`Failed to fetch agents by phase: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // console.error('Failed to fetch agents by phase:', error);
      return [];
    }
  }

  async getAgentById(id: string): Promise<Agent | null> {
    try {

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch agent: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // console.error('Failed to fetch agent by ID:', error);
      return null;
    }
  }

  async getCategories(): Promise<AgentCategory[]> {
    try {

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // console.error('Failed to fetch categories:', error);
      return this.getMockCategories();
    }
  }

  async createCustomAgent(agentData: Partial<Agent>): Promise<Agent> {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create agent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Failed to create custom agent:', error);
      throw error;
    }
  }

  convertToLegacyFormat(agent: Agent): unknown {
    return {
      id: agent.id,
      name: agent.display_name,
      description: agent.description,
      systemPrompt: agent.system_prompt,
      model: agent.model || 'gpt-4',
      avatar: agent.avatar || '🤖',
      color: agent.color || '#6366f1',
      capabilities: agent.capabilities || [],
      ragEnabled: agent.rag_enabled || false,
      temperature: agent.temperature || 0.7,
      maxTokens: agent.max_tokens || 2000,
      isCustom: agent.is_custom || false,
      knowledgeDomains: agent.knowledge_domains || [],
      businessFunction: agent.business_function,
      role: agent.role,
    };
  }

  private getMockAgents(): Agent[] {
    return [
      {
        id: 'medical-affairs-specialist',
        name: 'medical_affairs_specialist',
        display_name: 'Medical Affairs Specialist',
        description: 'Expert in medical communications, KOL engagement, and scientific strategy',
        system_prompt: 'You are a medical affairs specialist with expertise in pharmaceutical medical communications, key opinion leader engagement, and scientific strategy development.',
        model: 'gpt-4',
        avatar: '👩‍⚕️',
        color: '#3b82f6',
        capabilities: ['medical_writing', 'kol_engagement', 'scientific_strategy'],
        rag_enabled: true,
        temperature: 0.7,
        max_tokens: 2000,
        is_custom: false,
        status: 'active',
        tier: 1,
        priority: 1,
        implementation_phase: 1,
        knowledge_domains: ['medical_affairs', 'pharmaceutical'],
        business_function: 'Medical Affairs',
        role: 'Medical Affairs Manager',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'regulatory-advisor',
        name: 'regulatory_advisor',
        display_name: 'Regulatory Advisor',
        description: 'Specialist in regulatory compliance, submissions, and approval strategies',
        system_prompt: 'You are a regulatory affairs expert specializing in drug approvals, compliance requirements, and regulatory strategy.',
        model: 'gpt-4',
        avatar: '📋',
        color: '#ef4444',
        capabilities: ['regulatory_strategy', 'compliance', 'submissions'],
        rag_enabled: true,
        temperature: 0.6,
        max_tokens: 2000,
        is_custom: false,
        status: 'active',
        tier: 1,
        priority: 2,
        implementation_phase: 1,
        knowledge_domains: ['regulatory', 'compliance'],
        business_function: 'Regulatory Affairs',
        role: 'Regulatory Manager',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  async createAgent(agentData: Partial<Agent>): Promise<{ success: boolean; agent?: Agent; error?: string }> {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create agent: ${response.statusText}`);
      }

      const agent = await response.json();
      return { success: true, agent };
    } catch (error) {
      // console.error('Failed to create agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateAgent(id: string, agentData: Partial<Agent>): Promise<{ success: boolean; agent?: Agent; error?: string }> {
    try {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {

        throw new Error(errorData.error || `Failed to update agent: ${response.statusText}`);
      }

      return { success: true, agent };
    } catch (error) {
      // console.error('Failed to update agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async deleteAgent(id: string): Promise<{ success: boolean; error?: string }> {
    try {

        method: 'DELETE',
      });

      if (!response.ok) {

        throw new Error(errorData.error || `Failed to delete agent: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      // console.error('Failed to delete agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private getMockCategories(): AgentCategory[] {
    return [
      {
        id: 'medical-affairs',
        name: 'Medical Affairs',
        description: 'Agents specialized in medical communications and scientific strategy',
        color: '#3b82f6',
        sort_order: 1,
      },
      {
        id: 'regulatory',
        name: 'Regulatory Affairs',
        description: 'Agents focused on regulatory compliance and submissions',
        color: '#ef4444',
        sort_order: 2,
      },
      {
        id: 'clinical',
        name: 'Clinical Development',
        description: 'Agents for clinical trial design and execution',
        color: '#10b981',
        sort_order: 3,
      },
    ];
  }
}

export const __agentService = new AgentService();
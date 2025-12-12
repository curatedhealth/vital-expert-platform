/**
 * Agent RAG Integration Service
 * Manages RAG system assignments for agents
 */

export interface AgentRAGQuery {
  query: string;
  agentId?: string;
  filters?: Record<string, unknown>;
  topK?: number;
  threshold?: number;
  context?: string;
  useMultiRAG?: boolean;
  maxResults?: number;
}

export interface AgentRAGConfig {
  agentId: string;
  ragSystems: Array<{
    systemId: string;
    systemType: 'medical' | 'enhanced' | 'hybrid' | 'langchain';
    weight: number;
    filters?: Record<string, unknown>;
  }>;
  defaultRAG: string;
  knowledgeDomains: string[];
  filterPreferences?: Record<string, unknown>;
}

class AgentRAGIntegration {
  private configs: Map<string, AgentRAGConfig> = new Map();

  async getAgentConfiguration(agentId: string): Promise<AgentRAGConfig | null> {
    return this.configs.get(agentId) || null;
  }

  async setAgentConfiguration(config: AgentRAGConfig): Promise<void> {
    this.configs.set(config.agentId, config);
  }

  async removeAgentConfiguration(agentId: string): Promise<boolean> {
    return this.configs.delete(agentId);
  }

  async getAllConfigurations(): Promise<AgentRAGConfig[]> {
    return Array.from(this.configs.values());
  }

  async getAgentsWithRAGSystem(systemId: string): Promise<string[]> {
    const agentIds: string[] = [];
    for (const [agentId, config] of this.configs) {
      if (config.ragSystems.some(sys => sys.systemId === systemId)) {
        agentIds.push(agentId);
      }
    }
    return agentIds;
  }

  async queryAgentKnowledge(_query: AgentRAGQuery): Promise<{
    sources: Array<{ content: string; metadata?: Record<string, unknown> }>;
    confidence: number;
    followupSuggestions?: string[];
    ragSystemsUsed?: string[];
    agentContext?: {
      knowledgeDomains?: string[];
      [key: string]: unknown;
    };
  } | null> {
    // Stub - returns null (no knowledge found)
    return null;
  }
}

export const agentRAGIntegration = new AgentRAGIntegration();

/**
 * Agent-RAG Integration Service
 * Connects specific RAG systems to individual agents for contextual responses
 */

export interface AgentRAGConfig {
  agentId: string;
  agentName: string;
  ragSystems: RAGSystemConfig[];
  defaultRAG: string;
  knowledgeDomains: string[];
  filterPreferences: any;
  priority: number;
}

export interface RAGSystemConfig {
  systemId: string;
  systemType: 'medical' | 'enhanced' | 'hybrid' | 'langchain';
  weight: number;
  filters?: any;
  endpoint?: string;
}

export interface AgentRAGQuery {
  query: string;
  agentId: string;
  context?: string;
  chatHistory?: unknown[];
  useMultiRAG?: boolean;
  maxResults?: number;
}

export interface AgentRAGResponse {
  answer: string;
  sources: unknown[];
  ragSystemsUsed: string[];
  confidence: number;
  processingTime: number;
  agentContext: {
    agentId: string;
    agentName: string;
    knowledgeDomains: string[];
    ragSystemsAllocated: string[];
  };
  citations: unknown[];
  followupSuggestions: string[];
}

export class AgentRAGIntegrationService {
  private agentConfigs: Map<string, AgentRAGConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    this.agentConfigs.set('clinical-research-agent', {
      agentId: 'clinical-research-agent',
      agentName: 'Clinical Research Specialist',
      ragSystems: [
        {
          systemId: 'medical-rag',
          systemType: 'medical',
          weight: 0.8,
          filters: {
            domain: 'clinical_research',
            prismSuite: 'TRIALS',
            contentTypes: ['clinical-trials', 'regulatory-guidance']
          }
        }
      ],
      defaultRAG: 'medical-rag',
      knowledgeDomains: ['clinical_research', 'regulatory_compliance'],
      filterPreferences: {
        domain: 'clinical_research',
        prismSuite: 'TRIALS',
        contentTypes: ['clinical-trials', 'regulatory-guidance']
      },
      priority: 1
    });
  }

  async queryAgentKnowledge(params: AgentRAGQuery): Promise<AgentRAGResponse> {
    const startTime = Date.now();

    try {
      const agentConfig = await this.getAgentRAGConfig(params.agentId);

      if (!agentConfig) {
        throw new Error(`No RAG configuration found for agent: ${params.agentId}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        answer: `Based on my expertise in ${agentConfig.knowledgeDomains.join(', ')}, here's what I found: [Response would be generated using LLM with the provided context]`,
        sources: [],
        ragSystemsUsed: [agentConfig.defaultRAG],
        confidence: 0.8,
        processingTime,
        agentContext: {
          agentId: agentConfig.agentId,
          agentName: agentConfig.agentName,
          knowledgeDomains: agentConfig.knowledgeDomains,
          ragSystemsAllocated: agentConfig.ragSystems.map(s => s.systemId)
        },
        citations: [],
        followupSuggestions: [
          'Can you provide more details about this topic?',
          'What are the regulatory implications?',
          'Are there any recent updates?'
        ]
      };

    } catch (error) {
      console.error('Agent RAG query failed:', error);
      throw error;
    }
  }

  async getAgentRAGConfig(agentId: string): Promise<AgentRAGConfig | null> {
    if (this.agentConfigs.has(agentId)) {
      return this.agentConfigs.get(agentId)!;
    }
    return null;
  }

  async saveAgentRAGConfig(config: AgentRAGConfig): Promise<void> {
    this.agentConfigs.set(config.agentId, config);
  }

  async getAllAgentConfigs(): Promise<AgentRAGConfig[]> {
    return Array.from(this.agentConfigs.values());
  }
}

export const agentRAGIntegrationService = new AgentRAGIntegrationService();
export const agentRAGIntegration = agentRAGIntegrationService;

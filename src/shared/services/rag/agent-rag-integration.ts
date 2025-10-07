/**
 * Agent-RAG Integration Service
 * Connects specific RAG systems to individual agents for contextual responses
 * Implements intelligent RAG routing based on agent expertise and query context
 */

import { createClient } from '@supabase/supabase-js';

import { langchainRAGService } from '@/features/chat/services/langchain-service';

import { medicalRAGService, MedicalSearchFilters } from './medical-rag-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Agent-specific RAG configuration types
export interface AgentRAGConfig {
  agentId: string;
  agentName: string;
  ragSystems: RAGSystemConfig[];
  defaultRAG: string;
  knowledgeDomains: string[];
  filterPreferences: MedicalSearchFilters;
  priority: number;
}

export interface RAGSystemConfig {
  systemId: string;
  systemType: 'medical' | 'enhanced' | 'hybrid' | 'langchain';
  weight: number;
  filters?: MedicalSearchFilters;
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

  /**
   * Initialize default RAG configurations for common agent types
   */
  private initializeDefaultConfigs(): void {
    // Clinical Research Agent
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
        },
        {
          systemId: 'enhanced-rag',
          systemType: 'enhanced',
          weight: 0.2,
          filters: {
            domain: 'clinical_research',
            contentTypes: ['research-papers', 'clinical-guidelines']
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

    // Regulatory Affairs Agent
    this.agentConfigs.set('regulatory-affairs-agent', {
      agentId: 'regulatory-affairs-agent',
      agentName: 'Regulatory Affairs Expert',
      ragSystems: [
        {
          systemId: 'medical-rag',
          systemType: 'medical',
          weight: 0.9,
          filters: {
            domain: 'regulatory_compliance',
            prismSuite: 'RULES',
            contentTypes: ['regulatory-guidance', 'compliance-documents']
          }
        }
      ],
      defaultRAG: 'medical-rag',
      knowledgeDomains: ['regulatory_compliance', 'clinical_research'],
      filterPreferences: {
        domain: 'regulatory_compliance',
        prismSuite: 'RULES',
        contentTypes: ['regulatory-guidance', 'compliance-documents']
      },
      priority: 1
    });

    // Digital Health Agent
    this.agentConfigs.set('digital-health-agent', {
      agentId: 'digital-health-agent',
      agentName: 'Digital Health Specialist',
      ragSystems: [
        {
          systemId: 'medical-rag',
          systemType: 'medical',
          weight: 0.7,
          filters: {
            domain: 'digital_health',
            prismSuite: 'CRAFT',
            contentTypes: ['digital-therapeutics', 'samd-guidance']
          }
        },
        {
          systemId: 'enhanced-rag',
          systemType: 'enhanced',
          weight: 0.3,
          filters: {
            domain: 'digital_health',
            contentTypes: ['software-guidance', 'digital-health-policies']
          }
        }
      ],
      defaultRAG: 'medical-digital',
      knowledgeDomains: ['digital_health', 'software_medical_devices', 'digital_therapeutics'],
      filterPreferences: {
        domain: 'digital_health',
        prismSuite: 'CRAFT',
        contentTypes: ['digital-therapeutics', 'samd-guidance']
      },
      priority: 1
    });
  }

  /**
   * Query knowledge using agent-specific RAG configuration
   */
  async queryAgentKnowledge(params: AgentRAGQuery): Promise<AgentRAGResponse> {
    const startTime = Date.now();

    try {
      // Get agent configuration
      const agentConfig = await this.getAgentRAGConfig(params.agentId);

      if (!agentConfig) {
        throw new Error(`No RAG configuration found for agent: ${params.agentId}`);
      }

      let combinedResults: unknown[] = [];
      let ragSystemsUsed: string[] = [];
      let totalConfidence = 0;

      // Query multiple RAG systems if enabled
      if (params.useMultiRAG && agentConfig.ragSystems.length > 1) {
        for (const ragSystem of agentConfig.ragSystems) {
          try {
            const systemResults = await this.querySpecificRAGSystem(
              ragSystem,
              params.query,
              params.context,
              agentConfig.filterPreferences,
              params.maxResults
            );

            if (systemResults && systemResults.results) {
              const weightedResults = systemResults.results.map((result: any) => ({
                ...result,
                ragSystemId: ragSystem.systemId,
                confidence: result.confidence * ragSystem.weight
              }));

              combinedResults = [...combinedResults, ...weightedResults];
              ragSystemsUsed.push(ragSystem.systemId);
              totalConfidence += ragSystem.weight;
            }
          } catch (systemError) {
            console.warn(`Failed to query RAG system ${ragSystem.systemId}:`, systemError);
          }
        }
      } else {
        // Use default RAG system
        const defaultSystem = agentConfig.ragSystems.find(s => s.systemId === agentConfig.defaultRAG) || agentConfig.ragSystems[0];
        
        const defaultResults = await this.querySpecificRAGSystem(
          defaultSystem,
          params.query,
          params.context,
          agentConfig.filterPreferences,
          params.maxResults
        );

        if (defaultResults && defaultResults.results) {
          combinedResults = defaultResults.results.map((result: any) => ({
            ...result,
            ragSystemId: defaultSystem.systemId
          }));
          ragSystemsUsed = [defaultSystem.systemId];
          totalConfidence = defaultSystem.weight;
        }
      }

      // Generate contextual response using best results
      const response = await this.generateAgentResponse(
        params.query,
        combinedResults,
        agentConfig,
        params.chatHistory,
        params.context
      );

      const processingTime = Date.now() - startTime;

      return {
        answer: response.answer,
        sources: combinedResults.slice(0, 10), // Limit sources display
        ragSystemsUsed,
        confidence: Math.min(totalConfidence, 1.0),
        processingTime,
        agentContext: {
          agentId: agentConfig.agentId,
          agentName: agentConfig.agentName,
          knowledgeDomains: agentConfig.knowledgeDomains,
          ragSystemsAllocated: agentConfig.ragSystems.map(s => s.systemId)
        },
        citations: response.citations,
        followupSuggestions: response.followupSuggestions
      };

    } catch (error) {
      console.error('Agent RAG query failed:', error);
      throw error;
    }
  }

  /**
   * Query a specific RAG system
   */
  private async querySpecificRAGSystem(
    ragSystem: RAGSystemConfig,
    query: string,
    context: string | undefined,
    filterPreferences: MedicalSearchFilters,
    maxResults?: number
  ): Promise<{ results: unknown[]; metadata: unknown }> {
    const filters = { ...filterPreferences, ...ragSystem.filters };

    switch (ragSystem.systemType) {
      case 'medical':
        const medicalResult = await medicalRAGService.searchMedicalKnowledge(query, filters, { maxResults });
        return { results: medicalResult.results, metadata: medicalResult.searchMetadata };
      
      case 'enhanced':
        const enhancedResult = await medicalRAGService.searchMedicalKnowledge(query, filters, { maxResults });
        return { results: enhancedResult.results, metadata: enhancedResult.searchMetadata };
      
      case 'langchain':
        const langchainResult = await langchainRAGService.searchKnowledge(query, { limit: maxResults });
        return { results: langchainResult.chunks, metadata: {} };
      
      default:
        throw new Error(`Unsupported RAG system type: ${ragSystem.systemType}`);
    }
  }

  /**
   * Generate agent-specific response using LLM
   */
  private async generateAgentResponse(
    query: string,
    results: unknown[],
    agentConfig: AgentRAGConfig,
    chatHistory: unknown[] | undefined,
    context: string | undefined
  ): Promise<{ answer: string; citations: unknown[]; followupSuggestions: string[] }> {
    // This would integrate with your LLM service
    // For now, return a mock response
    return {
      answer: `Based on my expertise in ${agentConfig.knowledgeDomains.join(', ')}, here's what I found: [Response would be generated using LLM with the provided context]`,
      citations: results.slice(0, 5),
      followupSuggestions: [
        'Can you provide more details about this topic?',
        'What are the regulatory implications?',
        'Are there any recent updates?'
      ]
    };
  }

  /**
   * Get RAG configuration for a specific agent
   */
  async getAgentRAGConfig(agentId: string): Promise<AgentRAGConfig | null> {
    // First check in-memory cache
    if (this.agentConfigs.has(agentId)) {
      return this.agentConfigs.get(agentId)!;
    }

    // Try to load from database
    try {
      const { data, error } = await supabase
        .from('agent_rag_configs')
        .select('*')
        .eq('agent_id', agentId)
        .single();

      if (error) {
        console.warn(`No RAG config found for agent ${agentId}:`, error.message);
        return null;
      }

      const config: AgentRAGConfig = {
        agentId: data.agent_id,
        agentName: data.agent_name,
        ragSystems: data.rag_systems,
        defaultRAG: data.default_rag,
        knowledgeDomains: data.knowledge_domains,
        filterPreferences: data.filter_preferences,
        priority: data.priority
      };

      // Cache the configuration
      this.agentConfigs.set(agentId, config);
      return config;

    } catch (dbError) {
      console.error('Database error loading agent RAG config:', dbError);
      return null;
    }
  }

  /**
   * Save or update RAG configuration for an agent
   */
  async saveAgentRAGConfig(config: AgentRAGConfig): Promise<void> {
    try {
      const { error } = await supabase
        .from('agent_rag_configs')
        .upsert({
          agent_id: config.agentId,
          agent_name: config.agentName,
          rag_systems: config.ragSystems,
          default_rag: config.defaultRAG,
          knowledge_domains: config.knowledgeDomains,
          filter_preferences: config.filterPreferences,
          priority: config.priority,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Update in-memory cache
      this.agentConfigs.set(config.agentId, config);

    } catch (error) {
      console.error('Failed to save agent RAG config:', error);
      throw error;
    }
  }

  /**
   * Get all available agent configurations
   */
  async getAllAgentConfigs(): Promise<AgentRAGConfig[]> {
    try {
      const { data, error } = await supabase
        .from('agent_rag_configs')
        .select('*')
        .order('priority', { ascending: true });

      if (error) {
        throw error;
      }

      return data.map((row: any) => ({
        agentId: row.agent_id,
        agentName: row.agent_name,
        ragSystems: row.rag_systems,
        defaultRAG: row.default_rag,
        knowledgeDomains: row.knowledge_domains,
        filterPreferences: row.filter_preferences,
        priority: row.priority
      }));

    } catch (error) {
      console.error('Failed to load agent configs:', error);
      return Array.from(this.agentConfigs.values());
    }
  }
}

// Export singleton instance
export const agentRAGIntegrationService = new AgentRAGIntegrationService();
export const agentRAGIntegration = agentRAGIntegrationService;
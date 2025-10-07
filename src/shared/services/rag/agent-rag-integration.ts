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
  citations: string[];
  followupSuggestions: string[];
}

export class AgentRAGIntegrationService {
  private agentConfigurations: Map<string, AgentRAGConfig> = new Map();

  constructor() {
    this.initializeDefaultAgentConfigurations();
  }

  /**
   * Initialize default RAG configurations for specialist agents
   */
  private initializeDefaultAgentConfigurations() {
    // FDA Regulatory Expert
    this.agentConfigurations.set('regulatory-expert', {
      agentId: 'regulatory-expert',
      agentName: 'FDA Regulatory Expert',
      ragSystems: [
        {
          systemId: 'medical-regulatory',
          systemType: 'medical',
          weight: 0.7,
          filters: {
            domain: 'regulatory_compliance',
            prismSuite: 'RULES',
            contentTypes: ['regulatory-guidance', 'fda-documents', 'submission-templates']
          }
        },
        {
          systemId: 'enhanced-regulatory',
          systemType: 'enhanced',
          weight: 0.3,
          filters: {
            domain_filter: 'regulatory',
            evidence_level_filter: ['Level I', 'Level II']
          }
        }
      ],
      defaultRAG: 'medical-regulatory',
      knowledgeDomains: ['regulatory_compliance', 'fda_guidance', 'submission_pathways'],
      filterPreferences: {
        domain: 'regulatory_compliance',
        prismSuite: 'RULES',
        evidenceLevels: ['Level I', 'Level II', 'Level III']
      },
      priority: 1
    });

    // Clinical Research Expert
    this.agentConfigurations.set('clinical-researcher', {
      agentId: 'clinical-researcher',
      agentName: 'Clinical Research Expert',
      ragSystems: [
        {
          systemId: 'medical-clinical',
          systemType: 'medical',
          weight: 0.8,
          filters: {
            domain: 'clinical_research',
            prismSuite: 'TRIALS',
            contentTypes: ['clinical-protocols', 'study-designs', 'statistical-methods']
          }
        },
        {
          systemId: 'langchain-clinical',
          systemType: 'langchain',
          weight: 0.2
        }
      ],
      defaultRAG: 'medical-clinical',
      knowledgeDomains: ['clinical_research', 'biostatistics', 'protocol_design'],
      filterPreferences: {
        domain: 'clinical_research',
        prismSuite: 'TRIALS',
        studyTypes: ['rct', 'systematic review', 'meta-analysis'],
        evidenceLevels: ['Level I', 'Level II']
      },
      priority: 1
    });

    // Market Access Strategist
    this.agentConfigurations.set('market-access', {
      agentId: 'market-access',
      agentName: 'Market Access Strategist',
      ragSystems: [
        {
          systemId: 'medical-market-access',
          systemType: 'medical',
          weight: 0.6,
          filters: {
            domain: 'medical_affairs',
            prismSuite: 'VALUE',
            contentTypes: ['market-access', 'health-economics', 'payer-research']
          }
        },
        {
          systemId: 'enhanced-market',
          systemType: 'enhanced',
          weight: 0.4,
          filters: {
            domain_filter: 'commercial',
            evidence_level_filter: ['Level I', 'Level II', 'Level III']
          }
        }
      ],
      defaultRAG: 'medical-market-access',
      knowledgeDomains: ['market_access', 'health_economics', 'payer_strategy'],
      filterPreferences: {
        domain: 'medical_affairs',
        prismSuite: 'VALUE',
        contentTypes: ['market-access', 'health-economics']
      },
      priority: 1
    });

    // Digital Health Architect
    this.agentConfigurations.set('digital-health-architect', {
      agentId: 'digital-health-architect',
      agentName: 'Digital Health Architect',
      ragSystems: [
        {
          systemId: 'medical-digital',
          systemType: 'medical',
          weight: 0.5,
          filters: {
            domain: 'digital_health',
            prismSuite: 'CRAFT',
            contentTypes: ['digital-therapeutics', 'samd-guidance', 'tech-specs']
          }
        },
        {
          systemId: 'hybrid-digital',
          systemType: 'hybrid',
          weight: 0.3
        },
        {
          systemId: 'langchain-digital',
          systemType: 'langchain',
          weight: 0.2
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

            if (systemResults.results.length > 0) {
              // Weight the results based on system configuration
              const weightedResults = systemResults.results.map(result => ({
                ...result,
                weightedScore: (result.similarity || result.relevanceScore || 0.8) * ragSystem.weight,
                ragSystemId: ragSystem.systemId
              }));

              combinedResults.push(...weightedResults);
              ragSystemsUsed.push(ragSystem.systemId);
              totalConfidence += ragSystem.weight;
            }
          } catch (systemError) {
            // console.warn(`RAG system ${ragSystem.systemId} failed:`, systemError);
          }
        }

        // Sort by weighted score and deduplicate
        combinedResults = this.deduplicateAndRankResults(combinedResults, params.maxResults || 10);

      } else {
        // Use default RAG system
        const defaultSystem = agentConfig.ragSystems.find(s => s.systemId === agentConfig.defaultRAG)
          || agentConfig.ragSystems[0];

        const defaultResults = await this.querySpecificRAGSystem(
          defaultSystem,
          params.query,
          params.context,
          agentConfig.filterPreferences,
          params.maxResults
        );

        combinedResults = defaultResults.results.map((result: unknown) => ({
          ...result,
          ragSystemId: defaultSystem.systemId
        }));
        ragSystemsUsed = [defaultSystem.systemId];
        totalConfidence = defaultSystem.weight;
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
      console.error('❌ Agent-RAG Integration Error:', error);

      // Fallback to basic agent response
      return this.getFallbackResponse(params, Date.now() - startTime);
    }
  }

  /**
   * Query a specific RAG system based on configuration
   */
  private async querySpecificRAGSystem(
    ragSystem: RAGSystemConfig,
    query: string,
    context?: string,
    filterPreferences?: MedicalSearchFilters,
    maxResults?: number
  ) {
    switch (ragSystem.systemType) {
      case 'medical':
        return await medicalRAGService.searchMedicalKnowledge(
          query,
          { ...filterPreferences, ...ragSystem.filters },
          { maxResults: maxResults || 10, includeMetadata: true }
        );

      case 'enhanced':
        // Call enhanced RAG API
        const enhancedResponse = await fetch('/api/rag/enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            max_results: maxResults || 10,
            ...ragSystem.filters
          })
        });

        if (enhancedResponse.ok) {
          const data = await enhancedResponse.json();
          return { results: data.results || [] };
        }
        throw new Error('Enhanced RAG system unavailable');

      case 'hybrid':
        // Call hybrid RAG API
        const hybridResponse = await fetch('/api/rag/hybrid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            max_results: maxResults || 10,
            include_medical_context: true,
            filters: ragSystem.filters
          })
        });

        if (hybridResponse.ok) {
          const data = await hybridResponse.json();
          return { results: data.results || [] };
        }
        throw new Error('Hybrid RAG system unavailable');

      case 'langchain':
        const langchainResult = await langchainRAGService.queryRAGSystem(
          query,
          ragSystem.systemId, // Use as agentId fallback
          [],
          { name: 'Agent', systemPrompt: context || '' }
        );

        return {
          results: langchainResult.sources.map(source => ({
            content: source.content,
            similarity: source.similarity || 0.8,
            title: source.title,
            sourceMetadata: { title: source.title },
            medicalContext: { therapeuticAreas: [], studyTypes: [], regulatoryMentions: [] }
          }))
        };

      default:
        throw new Error(`Unknown RAG system type: ${ragSystem.systemType}`);
    }
  }

  /**
   * Deduplicate and rank combined results from multiple RAG systems
   */
  private deduplicateAndRankResults(results: unknown[], maxResults: number) {
    // Simple deduplication based on content similarity
    const unique = results.filter((result: any, index, arr) => {
      return !arr.slice(0, index).some(prev =>
        this.calculateContentSimilarity(result.content, prev.content) > 0.8
      );
    });

    // Sort by weighted score
    unique.sort((a, b) => (b.weightedScore || 0) - (a.weightedScore || 0));

    return unique.slice(0, maxResults);
  }

  /**
   * Calculate simple content similarity (Jaccard similarity)
   */
  private calculateContentSimilarity(content1: string, content2: string): number {
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  /**
   * Generate agent-specific response using RAG results
   */
  private async generateAgentResponse(
    query: string,
    results: unknown[],
    agentConfig: AgentRAGConfig,
    chatHistory?: unknown[],
    context?: string
  ) {
    // Prepare context from RAG results
    const ragContext = results.map((result: any, index: number) =>
      `[${index + 1}] ${result.content}\nSource: ${result.title || result.sourceMetadata?.title || 'Unknown'}`
    ).join('\n\n---\n\n');

    // Build agent-specific system prompt
    const systemPrompt = `You are an expert in ${agentConfig.knowledgeDomains.join(' and ')}.

Based on the knowledge base search results below, provide a comprehensive and accurate response that:
1. Directly answers the user's question
2. Synthesizes information from multiple sources
3. Provides specific insights relevant to ${agentConfig.knowledgeDomains.join(' and ')}
4. Uses citations [1], [2], etc. to reference sources
5. Maintains your expert perspective and professional judgment

Knowledge Base Results:
${ragContext}

User Query: ${query}
${context ? `\nAdditional Context: ${context}` : ''}

Provide your expert analysis and recommendations:`;

    // For now, return a structured mock response
    // In production, this would call the LLM with the prepared prompt
    const mockAnswer = `${results.length > 0 ?
      `From the knowledge base search (${results.length} relevant sources found), I can provide the following insights:

${results.slice(0, 3).map((result: any, index: number) =>
  `**Point ${index + 1}**: ${result.content?.substring(0, 200)}... [${index + 1}]`
).join('\n\n')}

**Expert Recommendation**: Based on these findings and my specialized knowledge, I recommend focusing on the evidence-based approaches outlined in the sources above.` :
      `Drawing from my specialized knowledge in ${agentConfig.knowledgeDomains.join(' and ')}, I can provide guidance on this topic, though I don't have specific knowledge base matches for this query.`
}

Would you like me to elaborate on any specific aspect or explore related considerations?`;

    const citations = results.slice(0, 3).map((_, index) => `[${index + 1}]`);
    const followupSuggestions = [
      `What are the specific implementation steps for ${agentConfig.knowledgeDomains[0]}?`,
      `How does this relate to current industry best practices?`,
      `What are the potential risks or challenges to consider?`
    ];

    return {
      answer: mockAnswer,
      citations,
      followupSuggestions
    };
  }

  /**
   * Get agent RAG configuration (with fallback to database)
   */
  private async getAgentRAGConfig(agentId: string): Promise<AgentRAGConfig | null> {
    // First try in-memory configuration
    if (this.agentConfigurations.has(agentId)) {
      return this.agentConfigurations.get(agentId)!;
    }

    // Try to load from database
    try {
      const { data: agentData, error } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          knowledge_domains,
          rag_systems,
          default_rag_system,
          filter_preferences
        `)
        .eq('id', agentId)
        .single();

      if (!error && agentData) {
        const config: AgentRAGConfig = {
          agentId: agentData.id,
          agentName: agentData.name,
          ragSystems: agentData.rag_systems || [
            { systemId: 'langchain-default', systemType: 'langchain', weight: 1.0 }
          ],
          defaultRAG: agentData.default_rag_system || 'langchain-default',
          knowledgeDomains: agentData.knowledge_domains || ['general'],
          filterPreferences: agentData.filter_preferences || { /* TODO: implement */ },
          priority: 1
        };

        // Cache the configuration
        this.agentConfigurations.set(agentId, config);
        return config;
      }
    } catch (dbError) {
      // console.warn(`Failed to load agent RAG config from database: ${dbError}`);
    }

    // Return a default configuration
    return {
      agentId,
      agentName: 'General Agent',
      ragSystems: [
        { systemId: 'langchain-default', systemType: 'langchain', weight: 1.0 }
      ],
      defaultRAG: 'langchain-default',
      knowledgeDomains: ['general'],
      filterPreferences: { /* TODO: implement */ },
      priority: 1
    };
  }

  /**
   * Fallback response when RAG systems fail
   */
  private getFallbackResponse(params: AgentRAGQuery, processingTime: number): AgentRAGResponse {
    return {
      answer: `I apologize, but I'm currently experiencing technical difficulties accessing my knowledge base. However, as a specialist agent, I can still provide general guidance on "${params.query}". Please try again in a moment, or contact support if this issue persists.`,
      sources: [],
      ragSystemsUsed: [],
      confidence: 0.3,
      processingTime,
      agentContext: {
        agentId: params.agentId,
        agentName: 'Agent',
        knowledgeDomains: [],
        ragSystemsAllocated: []
      },
      citations: [],
      followupSuggestions: [
        'Please try rephrasing your question',
        'Contact support for technical assistance',
        'Try again in a few moments'
      ]
    };
  }

  /**
   * Update agent RAG configuration
   */
  async updateAgentRAGConfig(agentId: string, config: Partial<AgentRAGConfig>) {
    const existingConfig = this.agentConfigurations.get(agentId);

    if (existingConfig) {
      const updatedConfig = { ...existingConfig, ...config };
      this.agentConfigurations.set(agentId, updatedConfig);

      // Persist to database
      try {
        await supabase
          .from('agents')
          .update({
            rag_systems: updatedConfig.ragSystems,
            default_rag_system: updatedConfig.defaultRAG,
            knowledge_domains: updatedConfig.knowledgeDomains,
            filter_preferences: updatedConfig.filterPreferences
          })
          .eq('id', agentId);
      } catch (error) {
        console.warn('Failed to persist agent RAG config:', error);
      }
    }
  }

  /**
   * Get available RAG systems for agent configuration
   */
  getAvailableRAGSystems(): RAGSystemConfig[] {
    return [
      { systemId: 'medical-regulatory', systemType: 'medical', weight: 1.0 },
      { systemId: 'medical-clinical', systemType: 'medical', weight: 1.0 },
      { systemId: 'medical-market-access', systemType: 'medical', weight: 1.0 },
      { systemId: 'medical-digital', systemType: 'medical', weight: 1.0 },
      { systemId: 'enhanced-enterprise', systemType: 'enhanced', weight: 1.0 },
      { systemId: 'hybrid-search', systemType: 'hybrid', weight: 1.0 },
      { systemId: 'langchain-general', systemType: 'langchain', weight: 1.0 }
    ];
  }
}

// Export singleton instance
export const agentRAGIntegration = new AgentRAGIntegrationService();
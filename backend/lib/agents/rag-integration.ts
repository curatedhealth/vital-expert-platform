import { agentService, type Capability, type AgentWithCapabilities } from './agent-service';
import { supabaseRAGService, type RAGQuery, type SearchResult } from '@/lib/rag/supabase-rag-service';

export interface RAGConfig {
  primaryIndexes: string[];
  embeddingModel: string;
  retrievalStrategy: 'semantic' | 'hybrid' | 'keyword';
  knowledgeDomains: string[];
  filterConfig: Record<string, any>;
}

export interface KnowledgeDomain {
  name: string;
  indexes: string[];
  embeddingModel: string;
  contentTypes: string[];
  updateFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
}

export class RAGIntegrationService {
  private knowledgeDomainMap: Map<string, KnowledgeDomain> = new Map([
    ['regulatory-affairs', {
      name: 'regulatory-affairs',
      indexes: ['regulatory-primary', 'fda-guidance', 'ema-guidance'],
      embeddingModel: 'legal-bert',
      contentTypes: ['guidance', 'regulation', 'policy'],
      updateFrequency: 'weekly'
    }],
    ['clinical-research', {
      name: 'clinical-research',
      indexes: ['clinical-evidence', 'protocols', 'statistical-methods'],
      embeddingModel: 'pubmedbert',
      contentTypes: ['protocol', 'study', 'guideline'],
      updateFrequency: 'daily'
    }],
    ['market-access', {
      name: 'market-access',
      indexes: ['market-intelligence', 'payer-policies', 'hta-submissions'],
      embeddingModel: 'text-embedding-ada-002',
      contentTypes: ['policy', 'coverage', 'economic-analysis'],
      updateFrequency: 'weekly'
    }],
    ['medical-communications', {
      name: 'medical-communications',
      indexes: ['document-templates', 'ich-guidelines', 'medical-writing'],
      embeddingModel: 'scibert',
      contentTypes: ['template', 'guideline', 'example'],
      updateFrequency: 'monthly'
    }],
    ['digital-health', {
      name: 'digital-health',
      indexes: ['dtx-guidance', 'ai-ml-validation', 'digital-endpoints'],
      embeddingModel: 'clinicalbert',
      contentTypes: ['guidance', 'validation', 'biomarker'],
      updateFrequency: 'weekly'
    }],
    ['quality-assurance', {
      name: 'quality-assurance',
      indexes: ['gxp-compliance', 'quality-systems', 'audit-templates'],
      embeddingModel: 'legal-bert',
      contentTypes: ['standard', 'procedure', 'checklist'],
      updateFrequency: 'monthly'
    }],
    ['business-intelligence', {
      name: 'business-intelligence',
      indexes: ['competitive-analysis', 'market-trends', 'partnership-data'],
      embeddingModel: 'text-embedding-ada-002',
      contentTypes: ['report', 'analysis', 'database'],
      updateFrequency: 'daily'
    }],
    ['research', {
      name: 'research',
      indexes: ['literature-database', 'evidence-synthesis', 'meta-analysis'],
      embeddingModel: 'pubmedbert',
      contentTypes: ['article', 'review', 'meta-analysis'],
      updateFrequency: 'daily'
    }]
  ]);

  /**
   * Build RAG configuration for an agent based on its capabilities
   */
  async buildRAGConfigForAgent(agentId: string): Promise<RAGConfig> {
    const agentWithCapabilities = await agentService.getAgentWithCapabilities(agentId);

    if (!agentWithCapabilities) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Extract knowledge domains from agent capabilities
    const knowledgeDomains = this.extractKnowledgeDomainsFromCapabilities(
      agentWithCapabilities.capabilities_detail
    );

    // Build primary indexes based on capabilities
    const primaryIndexes = this.buildPrimaryIndexes(knowledgeDomains);

    // Determine embedding model based on primary domain
    const embeddingModel = this.selectEmbeddingModel(knowledgeDomains);

    // Build retrieval strategy based on agent specialization
    const retrievalStrategy = this.determineRetrievalStrategy(agentWithCapabilities);

    // Create filter configuration
    const filterConfig = this.buildFilterConfig(agentWithCapabilities);

    return {
      primaryIndexes,
      embeddingModel,
      retrievalStrategy,
      knowledgeDomains: knowledgeDomains.map(d => d.name),
      filterConfig
    };
  }

  /**
   * Extract knowledge domains from agent capabilities
   */
  private extractKnowledgeDomainsFromCapabilities(
    capabilities: Array<{ capability: Capability }>
  ): KnowledgeDomain[] {
    const domains = new Set<string>();

    capabilities.forEach(({ capability }) => {
      const domain = capability.domain;
      if (this.knowledgeDomainMap.has(domain)) {
        domains.add(domain);
      }
    });

    return Array.from(domains).map(domain =>
      this.knowledgeDomainMap.get(domain)!
    );
  }

  /**
   * Build primary indexes from knowledge domains
   */
  private buildPrimaryIndexes(domains: KnowledgeDomain[]): string[] {
    const indexes = new Set<string>();

    domains.forEach(domain => {
      domain.indexes.forEach(index => indexes.add(index));
    });

    return Array.from(indexes);
  }

  /**
   * Select appropriate embedding model based on domains
   */
  private selectEmbeddingModel(domains: KnowledgeDomain[]): string {
    // Priority order for embedding models
    const modelPriority = [
      'legal-bert',      // Regulatory/compliance content
      'pubmedbert',      // Clinical/medical content
      'clinicalbert',    // Digital health content
      'scibert',         // Medical writing content
      'text-embedding-ada-002' // General content
    ];

    const domainModels = domains.map(d => d.embeddingModel);

    for (const model of modelPriority) {
      if (domainModels.includes(model)) {
        return model;
      }
    }

    return 'text-embedding-ada-002'; // Fallback
  }

  /**
   * Determine retrieval strategy based on agent type
   */
  private determineRetrievalStrategy(agent: AgentWithCapabilities): 'semantic' | 'hybrid' | 'keyword' {
    const primaryCapabilities = agent.primary_capabilities.map(c => c.capability.name);

    // Regulatory agents benefit from hybrid search (semantic + keyword)
    if (primaryCapabilities.some(cap => cap.includes('regulatory') || cap.includes('compliance'))) {
      return 'hybrid';
    }

    // Clinical and research agents benefit from semantic search
    if (primaryCapabilities.some(cap => cap.includes('clinical') || cap.includes('evidence'))) {
      return 'semantic';
    }

    // Market and business intelligence can use keyword for specific lookups
    if (primaryCapabilities.some(cap => cap.includes('market') || cap.includes('competitive'))) {
      return 'keyword';
    }

    return 'semantic'; // Default
  }

  /**
   * Build filter configuration for precise retrieval
   */
  private buildFilterConfig(agent: AgentWithCapabilities): Record<string, any> {
    const config: Record<string, any> = {
      // Default filters
      confidence_threshold: 0.8,
      max_age_days: 730, // 2 years
      source_tier: 'primary'
    };

    // Agent-specific filters based on capabilities
    agent.capabilities_detail.forEach(({ capability }) => {
      switch (capability.category) {
        case 'regulatory':
          config.regulatory_status = 'active';
          config.jurisdictions = ['us', 'eu', 'global'];
          break;

        case 'clinical':
          config.study_phase = ['I', 'II', 'III', 'IV'];
          config.study_status = ['completed', 'active'];
          break;

        case 'market-access':
          config.payer_types = ['medicare', 'medicaid', 'commercial'];
          config.coverage_status = 'active';
          break;

        case 'digital-health':
          config.device_class = ['I', 'II', 'III'];
          config.software_type = ['samd', 'dtx', 'ai_ml'];
          break;
      }
    });

    return config;
  }

  /**
   * Get recommended knowledge sources for an agent
   */
  async getRecommendedKnowledgeSources(agentId: string): Promise<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    source: string;
    volume: string;
    update_frequency: string;
    description: string;
  }[]> {
    const config = await this.buildRAGConfigForAgent(agentId);
    const recommendations = [];

    for (const domainName of config.knowledgeDomains) {
      const domain = this.knowledgeDomainMap.get(domainName);
      if (!domain) continue;

      // Add domain-specific recommendations
      recommendations.push(...this.getDomainRecommendations(domain));
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get domain-specific knowledge source recommendations
   */
  private getDomainRecommendations(domain: KnowledgeDomain): Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    source: string;
    volume: string;
    update_frequency: string;
    description: string;
  }> {
    const baseRecommendations = {
      'regulatory-affairs': [
        {
          priority: 'critical' as const,
          source: 'FDA Guidance Database',
          volume: '15GB',
          update_frequency: 'weekly',
          description: 'Complete FDA guidance documents and regulatory pathways'
        },
        {
          priority: 'critical' as const,
          source: '510(k) Clearance Database',
          volume: '25GB',
          update_frequency: 'daily',
          description: 'FDA 510(k) clearance database with predicates and decisions'
        },
        {
          priority: 'high' as const,
          source: 'EMA Guidelines',
          volume: '8GB',
          update_frequency: 'monthly',
          description: 'European regulatory guidelines and MDR/IVDR documentation'
        }
      ],
      'clinical-research': [
        {
          priority: 'critical' as const,
          source: 'ClinicalTrials.gov',
          volume: '50GB',
          update_frequency: 'daily',
          description: 'Complete clinical trials database with protocols and results'
        },
        {
          priority: 'high' as const,
          source: 'ICH Guidelines',
          volume: '1GB',
          update_frequency: 'quarterly',
          description: 'International harmonization guidelines for clinical trials'
        }
      ],
      'market-access': [
        {
          priority: 'critical' as const,
          source: 'CMS Coverage Database',
          volume: '10GB',
          update_frequency: 'weekly',
          description: 'Medicare coverage policies and local coverage determinations'
        },
        {
          priority: 'high' as const,
          source: 'Commercial Payer Policies',
          volume: '15GB',
          update_frequency: 'monthly',
          description: 'Top 10 commercial payer coverage and prior auth policies'
        }
      ]
    };

    return baseRecommendations[domain.name as keyof typeof baseRecommendations] || [];
  }

  /**
   * Perform knowledge search for an agent using Supabase RAG
   */
  async performAgentSearch(
    agentId: string,
    query: string,
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    try {
      const results = await supabaseRAGService.searchForAgent(agentId, query, maxResults);
      return results;
    } catch (error) {
      console.error('Error in agent search:', error);
      throw new Error('Failed to perform agent search');
    }
  }

  /**
   * Perform domain-specific search using agent capabilities
   */
  async performCapabilityBasedSearch(
    agentId: string,
    query: string,
    capability?: string
  ): Promise<SearchResult[]> {
    const agent = await agentService.getAgentWithCapabilities(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Determine domain based on capability or use agent's primary domains
    let searchDomain: string | undefined;

    if (capability) {
      const cap = agent.capabilities_detail.find(c => c.capability.name === capability);
      if (cap) {
        searchDomain = cap.capability.domain;
      }
    } else {
      // Use the primary capability's domain
      const primaryCap = agent.primary_capabilities[0];
      if (primaryCap) {
        searchDomain = primaryCap.capability.domain;
      }
    }

    const ragQuery: RAGQuery = {
      text: query,
      agent_id: agentId,
      domain: searchDomain,
      embedding_model: this.selectEmbeddingModel([{
        name: searchDomain || 'general',
        indexes: [],
        embeddingModel: this.getEmbeddingModelForDomain(searchDomain || 'general'),
        contentTypes: [],
        updateFrequency: 'daily'
      }]) as 'openai' | 'clinical' | 'legal' | 'scientific',
      max_results: 10
    };

    return await supabaseRAGService.searchKnowledge(ragQuery);
  }

  /**
   * Get embedding model for a domain
   */
  private getEmbeddingModelForDomain(domain: string): 'openai' | 'clinical' | 'legal' | 'scientific' {
    const domainModelMap: Record<string, 'openai' | 'clinical' | 'legal' | 'scientific'> = {
      'regulatory-affairs': 'legal',
      'quality-assurance': 'legal',
      'clinical-research': 'clinical',
      'digital-health': 'clinical',
      'research': 'clinical',
      'medical-communications': 'scientific',
      'market-access': 'openai',
      'business-intelligence': 'openai'
    };

    return domainModelMap[domain] || 'openai';
  }

  /**
   * Get contextual search results with conversation history
   */
  async performContextualSearch(
    agentId: string,
    query: string,
    conversationHistory: string[] = []
  ): Promise<SearchResult[]> {
    const ragQuery: RAGQuery = {
      text: query,
      agent_id: agentId,
      max_results: 10
    };

    return await supabaseRAGService.searchWithContext(
      ragQuery,
      conversationHistory,
      0.3 // Context weight
    );
  }

  /**
   * Add knowledge source for an agent's domain
   */
  async addKnowledgeSourceForAgent(
    agentId: string,
    sourceData: {
      name: string;
      title: string;
      description?: string;
      content: string;
      source_type: string;
      source_url?: string;
      publication_date?: string;
      authors?: string[];
      tags?: string[];
    }
  ): Promise<void> {
    const agent = await agentService.getAgentWithCapabilities(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get agent's primary domain
    const primaryCapability = agent.primary_capabilities[0];
    const domain = primaryCapability?.capability.domain || 'general';

    // Add knowledge source
    const knowledgeSource = await supabaseRAGService.addKnowledgeSource({
      ...sourceData,
      domain,
      category: this.getCategoryForDomain(domain)
    });

    // Process and chunk the content (simplified for demo)
    const chunks = this.chunkContent(sourceData.content);

    // Add document chunks with embeddings (mock embeddings for demo)
    await supabaseRAGService.addDocumentChunks(
      chunks.map((chunk, index) => ({
        knowledge_source_id: knowledgeSource.id,
        content: chunk,
        chunk_index: index,
        embeddings: {
          // In production, call actual embedding services
          openai: Array.from({ length: 1536 }, () => Math.random()),
          clinical: Array.from({ length: 768 }, () => Math.random())
        }
      }))
    );
  }

  /**
   * Simple content chunking (in production, use more sophisticated methods)
   */
  private chunkContent(content: string, chunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    const sentences = content.split(/[.!?]+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        }
      } else {
        currentChunk += sentence + '.';
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 50); // Filter very short chunks
  }

  /**
   * Get category for domain
   */
  private getCategoryForDomain(domain: string): string {
    const domainCategoryMap: Record<string, string> = {
      'regulatory-affairs': 'guidance',
      'clinical-research': 'protocol',
      'market-access': 'policy',
      'medical-communications': 'template',
      'digital-health': 'guidance',
      'quality-assurance': 'standard',
      'business-intelligence': 'report',
      'research': 'article'
    };

    return domainCategoryMap[domain] || 'document';
  }

  /**
   * Get agent's RAG performance metrics
   */
  async getAgentRAGMetrics(agentId: string): Promise<{
    total_queries: number;
    avg_retrieval_time_ms: number;
    avg_user_rating: number;
    most_accessed_sources: Array<{
      source_name: string;
      access_count: number;
    }>;
    domain_usage: Record<string, number>;
  }> {
    const healthMetrics = await supabaseRAGService.getHealthMetrics();

    // In a real implementation, you'd query specific metrics for this agent
    // This is a simplified version
    return {
      total_queries: Math.floor(Math.random() * 1000),
      avg_retrieval_time_ms: healthMetrics.avg_query_time_ms,
      avg_user_rating: 4.2,
      most_accessed_sources: [
        { source_name: 'FDA Guidance Database', access_count: 150 },
        { source_name: 'Clinical Trials Database', access_count: 89 },
        { source_name: 'Regulatory Intelligence', access_count: 67 }
      ],
      domain_usage: healthMetrics.domains
    };
  }

  /**
   * Validate RAG configuration
   */
  validateRAGConfig(config: RAGConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.primaryIndexes || config.primaryIndexes.length === 0) {
      errors.push('Primary indexes cannot be empty');
    }

    if (!config.embeddingModel) {
      errors.push('Embedding model is required');
    }

    if (!config.knowledgeDomains || config.knowledgeDomains.length === 0) {
      errors.push('Knowledge domains cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const ragIntegrationService = new RAGIntegrationService();
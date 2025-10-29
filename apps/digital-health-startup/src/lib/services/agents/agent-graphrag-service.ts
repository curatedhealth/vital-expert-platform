/**
 * Agent GraphRAG Service
 * 
 * Provides unified interface for hybrid agent search:
 * - Pinecone: Vector similarity search for semantic matching
 * - Supabase: Metadata filtering and relational queries
 * 
 * Combines best of both worlds for optimal agent discovery
 */

import { pineconeVectorService } from '../vectorstore/pinecone-vector-service';
import { createClient } from '@supabase/supabase-js';
import type { Agent } from '@/lib/types/agent.types';
import { getEmbeddingCache } from '../cache/embedding-cache';
import { embeddingService } from '../embeddings/openai-embedding-service';
import { getTracingService } from '../observability/tracing';
import { createLogger } from '../observability/structured-logger';

export interface AgentSearchQuery {
  query?: string;
  embedding?: number[];
  topK?: number;
  minSimilarity?: number;
  filters?: {
    tier?: number;
    status?: string;
    business_function?: string;
    department?: string;
    knowledge_domain?: string;
    capabilities?: string[];
  };
}

export interface AgentSearchResult {
  agent: Agent;
  similarity: number;
  matchReason: string[];
  metadata: Record<string, any>;
}

export class AgentGraphRAGService {
  private supabase: ReturnType<typeof createClient>;
  private embeddingCache;
  private tracing;
  private logger;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing for AgentGraphRAGService');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.embeddingCache = getEmbeddingCache();
    this.tracing = getTracingService();
    this.logger = createLogger();
  }

  /**
   * Hybrid search: Pinecone (semantic) + Supabase (metadata)
   * With embedding cache and distributed tracing
   */
  async searchAgents(query: AgentSearchQuery): Promise<AgentSearchResult[]> {
    const spanId = this.tracing.startSpan('AgentGraphRAGService.searchAgents', undefined, {
      operation: 'searchAgents',
      topK: query.topK,
      minSimilarity: query.minSimilarity,
    });

    const {
      query: queryText,
      embedding,
      topK = 10,
      minSimilarity = 0.7,
      filters = {},
    } = query;

    const startTime = Date.now();
    const operationId = `graphrag_search_${Date.now()}`;

    this.logger.info('graphrag_search_started', {
      operation: 'searchAgents',
      operationId,
      queryPreview: queryText?.substring(0, 100),
      hasEmbedding: !!embedding,
      filters,
    });

    try {
      // Step 1: Get or generate query embedding (with cache)
      let queryEmbedding = embedding;
      
      if (!queryEmbedding && queryText) {
        // Check cache first
        const cached = this.embeddingCache.get(queryText);
        if (cached) {
          this.logger.debug('graphrag_cache_hit', {
            operationId,
            queryPreview: queryText.substring(0, 50),
          });
          queryEmbedding = cached;
          this.tracing.addTags(spanId, { cacheHit: true });
        } else {
          // Generate and cache
          const embeddingResult = await embeddingService.generateQueryEmbedding(queryText);
          queryEmbedding = embeddingResult;
          this.embeddingCache.set(queryText, embeddingResult);
          this.logger.debug('graphrag_cache_miss', {
            operationId,
            queryPreview: queryText.substring(0, 50),
          });
          this.tracing.addTags(spanId, { cacheHit: false });
        }
      }

      // Step 2: Vector search in Pinecone
      const pineconeResults = await pineconeVectorService.hybridAgentSearch({
        text: queryText,
        embedding: queryEmbedding,
        topK: topK * 2, // Get more candidates for filtering
        minScore: minSimilarity - 0.1, // Slightly lower threshold
        filters: {
          tier: filters.tier,
          status: filters.status || 'active',
          business_function: filters.business_function,
          knowledge_domain: filters.knowledge_domain,
        },
      });

    // Step 2: Additional metadata filtering in Supabase
    let filteredResults = pineconeResults;

    // Filter by department if specified
    if (filters.department) {
      filteredResults = filteredResults.filter(result =>
        result.agent.department === filters.department ||
        result.metadata.department === filters.department
      );
    }

    // Filter by capabilities if specified
    if (filters.capabilities && filters.capabilities.length > 0) {
      filteredResults = filteredResults.filter(result => {
        const agentCaps = Array.isArray(result.agent.capabilities)
          ? result.agent.capabilities
          : [];
        return filters.capabilities!.some(cap =>
          agentCaps.some(ac => ac.toLowerCase().includes(cap.toLowerCase()))
        );
      });
    }

    // Step 3: Enhance with match reasons
    const enhancedResults: AgentSearchResult[] = filteredResults
      .slice(0, topK)
      .map(result => {
        const reasons: string[] = [];

        if (result.similarity >= 0.9) {
          reasons.push('High semantic similarity');
        } else if (result.similarity >= 0.8) {
          reasons.push('Good semantic match');
        } else {
          reasons.push('Relevant semantic match');
        }

        if (queryText) {
          const queryLower = queryText.toLowerCase();
          const descLower = (result.agent.description || '').toLowerCase();
          if (descLower.includes(queryLower)) {
            reasons.push('Description match');
          }
        }

        if (filters.knowledge_domain) {
          const domains = Array.isArray(result.agent.knowledge_domains)
            ? result.agent.knowledge_domains
            : [];
          if (domains.includes(filters.knowledge_domain)) {
            reasons.push('Knowledge domain match');
          }
        }

        return {
          agent: result.agent,
          similarity: result.similarity,
          matchReason: reasons,
          metadata: result.metadata,
        };
      });

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('graphrag_search_completed', duration, {
        operation: 'searchAgents',
        operationId,
        resultCount: enhancedResults.length,
        topSimilarity: enhancedResults[0]?.similarity,
      });

      this.tracing.endSpan(spanId, true);

      return enhancedResults;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'graphrag_search_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'searchAgents',
          operationId,
          duration,
        }
      );
      
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Find similar agents to a given agent
   */
  async findSimilarAgents(
    agentId: string,
    options: {
      topK?: number;
      excludeSelf?: boolean;
    } = {}
  ): Promise<AgentSearchResult[]> {
    const { topK = 10, excludeSelf = true } = options;

    // Get the agent
    const { data: agent, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error || !agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Build search query from agent description
    const searchQuery = agent.description || agent.display_name || agent.name;

    // Search for similar agents
    const results = await this.searchAgents({
      query: searchQuery,
      topK: excludeSelf ? topK + 1 : topK,
      filters: {
        status: 'active',
      },
    });

    // Exclude self if requested
    if (excludeSelf) {
      return results.filter(r => r.agent.id !== agentId).slice(0, topK);
    }

    return results;
  }

  /**
   * Recommend agents for a business function or use case
   */
  async recommendAgents(
    criteria: {
      businessFunction?: string;
      knowledgeDomain?: string;
      capabilities?: string[];
      tier?: number;
    }
  ): Promise<AgentSearchResult[]> {
    // Build a descriptive query
    const queryParts: string[] = [];

    if (criteria.businessFunction) {
      queryParts.push(criteria.businessFunction);
    }

    if (criteria.knowledgeDomain) {
      queryParts.push(criteria.knowledgeDomain);
    }

    if (criteria.capabilities && criteria.capabilities.length > 0) {
      queryParts.push(criteria.capabilities.join(', '));
    }

    const query = queryParts.join(' ');

    return this.searchAgents({
      query,
      topK: 10,
      minSimilarity: 0.6,
      filters: {
        business_function: criteria.businessFunction,
        knowledge_domain: criteria.knowledgeDomain,
        capabilities: criteria.capabilities,
        tier: criteria.tier,
        status: 'active',
      },
    });
  }
}

// Singleton instance
let agentGraphRAGServiceInstance: AgentGraphRAGService | null = null;

export function getAgentGraphRAGService(): AgentGraphRAGService {
  if (!agentGraphRAGServiceInstance) {
    agentGraphRAGServiceInstance = new AgentGraphRAGService();
  }
  return agentGraphRAGServiceInstance;
}

export const agentGraphRAGService = getAgentGraphRAGService();


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
import { agentGraphService } from './agent-graph-service';
import { getSupabaseCircuitBreaker } from '../resilience/circuit-breaker';
import { withRetry } from '../resilience/retry';

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

/**
 * Graph traversal configuration
 */
interface GraphTraversalConfig {
  maxDepth?: number; // Maximum hops in graph traversal (default: 2)
  maxCandidates?: number; // Maximum candidate agents from graph (default: 10)
  relationshipWeights?: {
    collaborates: number;
    supervises: number;
    delegates: number;
    consults: number;
    reports_to: number;
  };
}

const DEFAULT_GRAPH_CONFIG: Required<GraphTraversalConfig> = {
  maxDepth: 2,
  maxCandidates: 10,
  relationshipWeights: {
    collaborates: 0.8,
    supervises: 0.6,
    delegates: 0.7,
    consults: 0.75,
    reports_to: 0.5,
  },
};

export class AgentGraphRAGService {
  private supabase: ReturnType<typeof createClient> | null;
  private embeddingCache;
  private tracing;
  private logger;
  private circuitBreaker;
  private supabaseAvailable: boolean;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ [AgentGraphRAGService] Supabase configuration missing. Service will operate in degraded mode.');
      this.supabase = null;
      this.supabaseAvailable = false;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.supabaseAvailable = true;
    }

    this.embeddingCache = getEmbeddingCache();
    this.tracing = getTracingService();
    this.logger = createLogger();
    this.circuitBreaker = getSupabaseCircuitBreaker();
  }

  /**
   * Check if Supabase is available
   */
  private isSupabaseAvailable(): boolean {
    return this.supabaseAvailable && this.supabase !== null;
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

      // Step 2: Vector search in Pinecone (primary search)
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

      this.tracing.addTags(spanId, {
        pineconeResultsCount: pineconeResults.length,
      });

      // Step 3: Graph traversal - Multi-hop reasoning
      const graphResults = await this.traverseAgentGraph(
        pineconeResults.map((r) => r.agentId),
        queryText,
        {
          maxDepth: 2,
          maxCandidates: topK,
        }
      );

      this.tracing.addTags(spanId, {
        graphResultsCount: graphResults.length,
        graphTraversalEnabled: true,
      });

      // Step 4: Merge vector search + graph traversal results
      const mergedResults = this.mergeSearchResults(
        pineconeResults,
        graphResults,
        topK
      );

      this.logger.debug('graphrag_search_merged', {
        operationId,
        pineconeCount: pineconeResults.length,
        graphCount: graphResults.length,
        mergedCount: mergedResults.length,
      });

      // Step 5: Additional metadata filtering in Supabase
      let filteredResults = mergedResults;

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

        // Add knowledge graph node matches (if available)
        if (result.metadata.knowledgeNodes && result.metadata.knowledgeNodes.length > 0) {
          reasons.push(
            `${result.metadata.knowledgeNodes.length} knowledge entity match(es)`
          );
        }

        // Add relationship-based match reasons
        if (result.metadata.relationshipType) {
          reasons.push(
            `Graph relationship: ${result.metadata.relationshipType}`
          );
        }

        return {
          agent: result.agent,
          similarity: result.similarity,
          matchReason: reasons,
          metadata: {
            ...result.metadata,
            searchMethod: result.metadata.fromGraph
              ? 'graph_traversal'
              : 'vector_search',
          },
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

    // Check if Supabase is available
    if (!this.isSupabaseAvailable()) {
      this.logger.warn('findSimilarAgents_supabase_unavailable', {
        agentId,
        message: 'Supabase not available, falling back to vector search only',
      });
      // Fallback to vector search only
      return this.searchAgents({
        query: agentId,
        topK: excludeSelf ? topK + 1 : topK,
        filters: {
          status: 'active',
        },
      });
    }

    // Get the agent
    const { data: agent, error } = await this.supabase!
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error || !agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Build search query from agent description
    // Type assertion needed as Supabase returns generic type
    const agentData = agent as Agent;
    const searchQuery = agentData.description || agentData.display_name || agentData.name;

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

  /**
   * Traverse agent relationship graph for multi-hop reasoning
   * 
   * Implements graph traversal following SOLID principles:
   * - Single Responsibility: Dedicated graph traversal logic
   * - Dependency Injection: Uses agentGraphService (testable)
   * - Interface Segregation: Clean interface with config
   * 
   * @param seedAgentIds - Initial agent IDs from vector search
   * @param queryText - Original query text for knowledge graph matching
   * @param config - Graph traversal configuration
   * @returns Enhanced search results from graph traversal
   */
  private async traverseAgentGraph(
    seedAgentIds: string[],
    queryText?: string,
    config: GraphTraversalConfig = {}
  ): Promise<
    Array<{
      agent: Agent;
      similarity: number;
      metadata: Record<string, any>;
    }>
  > {
    const graphSpanId = this.tracing.startSpan(
      'AgentGraphRAGService.traverseAgentGraph',
      undefined,
      {
        seedCount: seedAgentIds.length,
        maxDepth: config.maxDepth || DEFAULT_GRAPH_CONFIG.maxDepth,
      }
    );

    const graphStartTime = Date.now();
    const finalConfig = { ...DEFAULT_GRAPH_CONFIG, ...config };

    try {
      const discoveredAgents = new Map<
        string,
        {
          agent: Agent;
          similarity: number;
          relationshipPath: string[];
          relationshipTypes: string[];
          metadata: Record<string, any>;
        }
      >();

      // Step 1: For each seed agent, find collaborators and related agents
      const traversalPromises = seedAgentIds.map(async (seedId) => {
        return withRetry(
          async () => {
            return this.circuitBreaker.execute(async () => {
              // Find collaborators (1 hop)
              const collaborators = await agentGraphService.findCollaborators(
                seedId
              );

              // Find supervisors (1 hop)
              const supervisors = await agentGraphService.findSupervisors(
                seedId
              );

              // Find delegation targets (1 hop)
              const delegates =
                await agentGraphService.findDelegationTargets(seedId);

              // Combine 1-hop relationships
              const oneHopIds = Array.from(
                new Set([...collaborators, ...supervisors, ...delegates])
              ).slice(0, finalConfig.maxCandidates);

              // Fetch agent details
              const { data: agents, error } = await this.supabase
                .from('agents')
                .select('*')
                .in('id', oneHopIds)
                .eq('is_active', true)
                .limit(finalConfig.maxCandidates);

              if (error) {
                this.logger.warn('graphrag_traversal_query_failed', {
                  seedId,
                  error: error.message,
                });
                return [];
              }

              // Get knowledge graph nodes for query matching (if query provided)
              const knowledgeMatches: Array<{
                agentId: string;
                nodes: string[];
              }> = [];

              if (queryText) {
                for (const agentId of oneHopIds) {
                  try {
                    const expertise =
                      await agentGraphService.getAgentExpertise(agentId);
                    const queryLower = queryText.toLowerCase();

                    // Match knowledge nodes against query
                    const matchingNodes = expertise
                      .filter(
                        (node) =>
                          node.entity_name.toLowerCase().includes(queryLower) ||
                          queryLower.includes(
                            node.entity_name.toLowerCase()
                          )
                      )
                      .map((node) => node.entity_name);

                    if (matchingNodes.length > 0) {
                      knowledgeMatches.push({
                        agentId,
                        nodes: matchingNodes,
                      });
                    }
                  } catch (err) {
                    // Non-critical - log and continue
                    this.logger.debug('graphrag_knowledge_lookup_failed', {
                      agentId,
                      error:
                        err instanceof Error ? err.message : String(err),
                    });
                  }
                }
              }

              // Build relationship-aware results
              return (agents || []).map((agent: Agent) => {
                const relationshipTypes: string[] = [];
                let relationshipWeight = 0.5; // Default weight

                if (collaborators.includes(agent.id!)) {
                  relationshipTypes.push('collaborates');
                  relationshipWeight +=
                    finalConfig.relationshipWeights.collaborates;
                }
                if (supervisors.includes(agent.id!)) {
                  relationshipTypes.push('supervises');
                  relationshipWeight +=
                    finalConfig.relationshipWeights.supervises;
                }
                if (delegates.includes(agent.id!)) {
                  relationshipTypes.push('delegates');
                  relationshipWeight +=
                    finalConfig.relationshipWeights.delegates;
                }

                // Boost similarity if knowledge graph matches
                let knowledgeBoost = 0;
                const knowledgeMatch = knowledgeMatches.find(
                  (km) => km.agentId === agent.id
                );
                if (knowledgeMatch) {
                  knowledgeBoost = Math.min(0.2, knowledgeMatch.nodes.length * 0.05);
                }

                // Calculate relationship-adjusted similarity
                // Base similarity from graph traversal (moderate, since it's indirect)
                const baseSimilarity = 0.6;
                const adjustedSimilarity = Math.min(
                  1.0,
                  baseSimilarity + relationshipWeight * 0.2 + knowledgeBoost
                );

                return {
                  agent,
                  similarity: adjustedSimilarity,
                  relationshipPath: [seedId, agent.id!],
                  relationshipTypes,
                  metadata: {
                    fromGraph: true,
                    relationshipType: relationshipTypes[0] || 'related',
                    relationshipTypes,
                    knowledgeNodes: knowledgeMatch?.nodes || [],
                    graphDepth: 1,
                  },
                };
              });
            });
          },
          {
            maxRetries: 2,
            initialDelayMs: 100,
            onRetry: (attempt, error) => {
              this.logger.warn('graphrag_traversal_retry', {
                seedId,
                attempt,
                error: error instanceof Error ? error.message : String(error),
              });
            },
          }
        );
      });

      const traversalResults = await Promise.all(traversalPromises);
      const flatResults = traversalResults.flat();

      // Deduplicate and aggregate results
      for (const result of flatResults) {
        const existing = discoveredAgents.get(result.agent.id!);
        if (!existing || result.similarity > existing.similarity) {
          discoveredAgents.set(result.agent.id!, result);
        } else {
          // Merge relationship types
          existing.relationshipTypes = Array.from(
            new Set([
              ...existing.relationshipTypes,
              ...result.relationshipTypes,
            ])
          );
          existing.metadata = {
            ...existing.metadata,
            ...result.metadata,
          };
        }
      }

      const graphDuration = Date.now() - graphStartTime;
      this.logger.infoWithMetrics(
        'graphrag_traversal_completed',
        graphDuration,
        {
          operation: 'traverseAgentGraph',
          seedCount: seedAgentIds.length,
          discoveredCount: discoveredAgents.size,
        }
      );

      this.tracing.endSpan(graphSpanId, true);

      // Convert to standard format and sort by similarity
      return Array.from(discoveredAgents.values())
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, finalConfig.maxCandidates);
    } catch (error) {
      const graphDuration = Date.now() - graphStartTime;
      this.logger.warn('graphrag_traversal_failed', {
        operation: 'traverseAgentGraph',
        duration: graphDuration,
        error: error instanceof Error ? error.message : String(error),
      });

      this.tracing.endSpan(
        graphSpanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Return empty array on failure (graceful degradation)
      return [];
    }
  }

  /**
   * Merge vector search results with graph traversal results
   * 
   * Implements intelligent fusion:
   * - Prefers vector search results (higher confidence)
   * - Adds graph results not already found
   * - Boosts agents found in both sources
   * - Relationship-aware ranking
   * 
   * @param vectorResults - Results from Pinecone vector search
   * @param graphResults - Results from graph traversal
   * @param topK - Final result count
   * @returns Merged and ranked results
   */
  private mergeSearchResults(
    vectorResults: Array<{
      agentId: string;
      similarity: number;
      agent: Agent;
      metadata: Record<string, any>;
    }>,
    graphResults: Array<{
      agent: Agent;
      similarity: number;
      metadata: Record<string, any>;
    }>,
    topK: number
  ): Array<{
    agentId: string;
    similarity: number;
    agent: Agent;
    metadata: Record<string, any>;
  }> {
    const merged = new Map<
      string,
      {
        agentId: string;
        similarity: number;
        agent: Agent;
        metadata: Record<string, any>;
        sources: Set<'vector' | 'graph'>;
      }
    >();

    // Add vector search results (higher priority)
    for (const result of vectorResults) {
      merged.set(result.agentId, {
        agentId: result.agentId,
        similarity: result.similarity,
        agent: result.agent,
        metadata: { ...result.metadata, searchMethod: 'vector_search' },
        sources: new Set<'vector' | 'graph'>(['vector']),
      });
    }

    // Add graph traversal results (boost if already exists)
    for (const result of graphResults) {
      const agentId = result.agent.id!;
      const existing = merged.get(agentId);

      if (existing) {
        // Agent found in both sources - boost similarity
        const boostedSimilarity = Math.min(
          1.0,
          existing.similarity * 0.7 + result.similarity * 0.3 + 0.1
        );
        existing.similarity = boostedSimilarity;
        existing.sources.add('graph');
        existing.metadata = {
          ...existing.metadata,
          ...result.metadata,
          searchMethod: 'hybrid', // Found via both methods
          foundInBothSources: true,
        };
      } else {
        // New agent from graph traversal
        merged.set(agentId, {
          agentId,
          similarity: result.similarity,
          agent: result.agent,
          metadata: result.metadata,
          sources: new Set<'vector' | 'graph'>(['graph']),
        });
      }
    }

    // Sort by similarity and return top K
    return Array.from(merged.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map((item) => ({
        agentId: item.agentId,
        similarity: item.similarity,
        agent: item.agent,
        metadata: {
          ...item.metadata,
          searchSources: Array.from(item.sources),
        },
      }));
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

// Lazy-loaded singleton using Proxy to prevent module-load-time instantiation
let _agentGraphRAGServiceInstance: AgentGraphRAGService | null = null;

export const agentGraphRAGService = new Proxy({} as AgentGraphRAGService, {
  get(target, prop) {
    if (!_agentGraphRAGServiceInstance) {
      try {
        _agentGraphRAGServiceInstance = new AgentGraphRAGService();
      } catch (error) {
        // If initialization fails, create a minimal instance that handles errors gracefully
        console.warn('⚠️ [AgentGraphRAGService] Failed to initialize, using fallback:', error);
        // Return a proxy that logs warnings for all method calls
        return new Proxy({}, {
          get() {
            return () => {
              console.warn('⚠️ [AgentGraphRAGService] Service not available');
              return Promise.resolve([]);
            };
          }
        });
      }
    }
    return (_agentGraphRAGServiceInstance as any)[prop];
  }
});


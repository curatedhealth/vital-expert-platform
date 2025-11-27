/**
 * AGENT SELECTOR SERVICE
 * 
 * Shared utilities for intelligent agent selection in Mode 2.
 * Provides query analysis, agent search, and ranking capabilities.
 * 
 * Features:
 * - Query analysis using OpenAI to extract intent and domains
 * - GraphRAG hybrid search for candidate agents (Pinecone + Supabase)
 * - Multi-criteria agent ranking (similarity, domain, tier, capabilities)
 * - Confidence scoring and reasoning generation
 * - Enterprise-grade observability and error handling
 */

import { createClient } from '@supabase/supabase-js';
import { Pinecone } from '@pinecone-database/pinecone';
import { createLogger } from '@/lib/services/observability/structured-logger';
import {
  AgentSelectionError,
  PineconeConnectionError,
  GraphRAGSearchError,
  AgentNotFoundError,
} from '@/lib/errors/agent-errors';
import {
  validateAgentSearchQuery,
  safeValidate,
  getValidationErrors,
  AgentSearchQuerySchema,
} from '@/lib/validators/user-agents-schema';
import { agentGraphRAGService } from '@/lib/services/agents/agent-graphrag-service';
import type { AgentSearchResult } from '@/lib/services/agents/agent-graphrag-service';
import { getSupabaseCircuitBreaker } from '@/lib/services/resilience/circuit-breaker';
import { getEmbeddingCache } from '@/lib/services/cache/embedding-cache';
import { getTracingService } from '@/lib/services/observability/tracing';
import { getAgentMetricsService } from '@/lib/services/observability/agent-metrics-service';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || process.env.API_GATEWAY_URL || 'http://localhost:3001';
const DEFAULT_TENANT_ID =
  process.env.API_GATEWAY_TENANT_ID ||
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ||
  '00000000-0000-0000-0000-000000000001';

// ============================================================================
// TYPES
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  display_name: string;
  description: string;
  system_prompt: string;
  tier: number;
  capabilities?: string[];
  knowledge_domains?: string[];
  specialties?: string[];
  model?: string;
  metadata?: any;
}

export interface QueryAnalysis {
  intent: string;
  domains: string[];
  complexity: 'low' | 'medium' | 'high';
  keywords: string[];
  medicalTerms: string[];
  confidence: number;
}

export interface AgentRanking {
  agent: Agent;
  score: number;
  reason: string;
  breakdown: {
    semanticSimilarity: number;
    domainRelevance: number;
    tierPreference: number;
    capabilityMatch: number;
  };
}

export interface AgentSelectionResult {
  selectedAgent: Agent;
  confidence: number;
  reasoning: string;
  alternativeAgents: AgentRanking[];
  analysis: QueryAnalysis;
}

// ============================================================================
// AGENT SELECTOR SERVICE CLASS
// ============================================================================

export class AgentSelectorService {
  private supabase;
  private pinecone: Pinecone | null;
  private logger;
  private supabaseCircuitBreaker;
  private embeddingCache;
  private tracing;
  private metricsService;
  private tenantId?: string;

  constructor(options?: { requestId?: string; userId?: string; tenantId?: string }) {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ [AgentSelectorService] Supabase configuration missing, some features may be disabled');
      // Create a minimal client that will fail gracefully when used
      this.supabase = null as any;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Initialize Pinecone client (optional - for vector search)
    if (process.env.PINECONE_API_KEY) {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
    } else {
      console.warn('⚠️  PINECONE_API_KEY not set - Vector search disabled in AgentSelectorService');
      this.pinecone = null;
    }

    // OpenAI API key no longer needed - using Python AI Engine via API Gateway
    // this.openaiApiKey = process.env.OPENAI_API_KEY!;

    // Initialize structured logger
    this.logger = createLogger({
      requestId: options?.requestId,
      userId: options?.userId,
    });

    // Initialize circuit breaker, cache, tracing, and metrics for resilience and observability
    this.supabaseCircuitBreaker = getSupabaseCircuitBreaker();
    this.embeddingCache = getEmbeddingCache();
    this.tracing = getTracingService();
    this.metricsService = getAgentMetricsService();
    this.tenantId = options?.tenantId;
  }

  /**
   * Analyze query to extract intent, domains, and complexity
   * Uses Python AI Engine via API Gateway to classify medical query characteristics
   */
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    const operationId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();

    this.logger.info('query_analysis_started', {
      operation: 'analyzeQuery',
      operationId,
      queryLength: query.length,
      queryPreview: query.substring(0, 100),
    });

    try {
      const correlationId = operationId;

      const response = await fetch(`${API_GATEWAY_URL}/api/agents/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': this.tenantId || DEFAULT_TENANT_ID,
        },
        body: JSON.stringify({
          query,
          user_id: undefined, // Can be passed if available
          tenant_id: this.tenantId,
          correlation_id: correlationId,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`API Gateway error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const analysis = await response.json();

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('query_analysis_completed', duration, {
        operation: 'analyzeQuery',
        operationId,
        intent: analysis.intent,
        domains: analysis.domains,
        complexity: analysis.complexity,
        confidence: analysis.confidence,
      });

      return {
        intent: analysis.intent || 'general',
        domains: analysis.domains || [],
        complexity: analysis.complexity || 'medium',
        keywords: analysis.keywords || [],
        medicalTerms: analysis.medical_terms || analysis.medicalTerms || [],
        confidence: analysis.confidence || 0.7
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'query_analysis_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'analyzeQuery',
          operationId,
          duration,
        }
      );
      
      // Fallback analysis
      return {
        intent: 'general',
        domains: [],
        complexity: 'medium',
        keywords: query.toLowerCase().split(' ').slice(0, 5),
        medicalTerms: [],
        confidence: 0.5
      };
    }
  }

  /**
   * Search for candidate agents using GraphRAG hybrid search
   * Falls back to database search if GraphRAG fails
   * 
   * Uses enterprise-grade:
   * - Zod validation
   * - Structured logging
   * - Typed error handling
   * - Performance metrics
   */
  async findCandidateAgents(
    query: string,
    domains: string[],
    limit: number = 10
  ): Promise<Agent[]> {
    const spanId = this.tracing.startSpan('AgentSelectorService.findCandidateAgents', undefined, {
      operation: 'findCandidateAgents',
      queryLength: query.length,
      domains: domains.join(','),
      limit,
    });

    const operationId = `search_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();

    this.logger.info('agent_search_started', {
      operation: 'findCandidateAgents',
      operationId,
      queryLength: query.length,
      queryPreview: query.substring(0, 100),
      domains,
      limit,
    });

    try {
      // Validate inputs with Zod
      const queryValidation = safeValidate(
        AgentSearchQuerySchema,
        {
          query,
          topK: limit,
          minSimilarity: 0.6,
          filters: {
            knowledge_domain: domains.length > 0 ? domains[0] : undefined,
            status: 'active',
          },
        }
      );

      if (!queryValidation.success) {
        const errors = getValidationErrors(queryValidation.errors);
        this.logger.warn('agent_search_validation_failed', {
          operationId,
          errors,
        });
        // Continue with defaults, but log the issue
      }

      // Step 1: Try GraphRAG hybrid search first (preferred method)
      try {
        const graphRAGResults = await agentGraphRAGService.searchAgents({
          query,
          topK: limit,
          minSimilarity: 0.6,
          filters: {
            knowledge_domain: domains.length > 0 ? domains[0] : undefined,
            status: 'active',
          },
        });

        const agents = graphRAGResults.map((result: AgentSearchResult) => result.agent);

        const duration = Date.now() - startTime;
        const graphragHit = true; // GraphRAG succeeded
        const graphragFallback = false;

        this.logger.infoWithMetrics('agent_search_completed', duration, {
          operation: 'findCandidateAgents',
          operationId,
          method: 'graphrag_hybrid',
          resultCount: agents.length,
          topSimilarity: graphRAGResults[0]?.similarity,
        });

        this.tracing.addTags(spanId, { method: 'graphrag', resultCount: agents.length });

        // Record search metrics (fire-and-forget)
        if (this.tenantId && agents.length > 0) {
          // Record for the top agent found
          this.metricsService.recordOperation({
            agentId: agents[0].id,
            tenantId: this.tenantId,
            operationType: 'search',
            responseTimeMs: duration,
            success: true,
            queryText: query.substring(0, 1000),
            searchMethod: 'graphrag_hybrid',
            graphragHit,
            graphragFallback,
            graphTraversalDepth: graphRAGResults[0]?.metadata?.graphDepth || 0,
            metadata: {
              operationId,
              resultCount: agents.length,
              topSimilarity: graphRAGResults[0]?.similarity,
            },
          }).catch(() => {
            // Silent fail
          });
        }

        this.tracing.endSpan(spanId, true);
        return agents;
      } catch (graphRAGError) {
        // GraphRAG failed, fall back to database search
        this.logger.warn('graphrag_search_failed', {
          operationId,
          error: graphRAGError instanceof Error ? graphRAGError.message : String(graphRAGError),
          fallback: 'database',
        });

        this.tracing.addTags(spanId, { fallback: 'database', graphragError: true });
        throw new GraphRAGSearchError(
          'GraphRAG search failed, falling back to database',
          {
            cause: graphRAGError instanceof Error ? graphRAGError : new Error(String(graphRAGError)),
            context: { operationId, query: query.substring(0, 100), domains },
          }
        );
      }
    } catch (error) {
      // If it's a GraphRAG error, fall back to database
      if (error instanceof GraphRAGSearchError) {
        const fallbackAgents = await this.fallbackAgentSearch(query, domains, limit, operationId);
        this.tracing.addTags(spanId, { method: 'fallback', resultCount: fallbackAgents.length });
        this.tracing.endSpan(spanId, true);
        return fallbackAgents;
      }

      // For other errors, log and fall back
      this.logger.error(
        'agent_search_error',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'findCandidateAgents',
          operationId,
          query: query.substring(0, 100),
          domains,
        }
      );

      const fallbackAgents = await this.fallbackAgentSearch(query, domains, limit, operationId);
      this.tracing.addTags(spanId, { method: 'error_fallback', resultCount: fallbackAgents.length });
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      return fallbackAgents;
    }
  }

  /**
   * Fallback agent search using database text search
   * Enhanced with structured logging and error handling
   */
  private async fallbackAgentSearch(
    query: string,
    domains: string[],
    limit: number,
    operationId?: string
  ): Promise<Agent[]> {
    const fallbackId = operationId || `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();

    this.logger.info('fallback_agent_search_started', {
      operation: 'fallbackAgentSearch',
      operationId: fallbackId,
      queryPreview: query.substring(0, 100),
      domains,
      limit,
    });

    try {
      // Use circuit breaker for database query resilience
      const { data: agents, error } = await this.supabaseCircuitBreaker.execute(async () => {
        // Build optimized query with proper filtering
        let queryBuilder = this.supabase
          .from('agents')
          .select(`
            id,
            name,
            description,
            system_prompt,
            tier,
            capabilities,
            knowledge_domains,
            specialties,
            model,
            metadata
          `);

        // Add domain filtering if available
        if (domains.length > 0) {
          queryBuilder = queryBuilder.overlaps('knowledge_domains', domains);
        }

        // Order by tier and priority (higher tier = better, tier 1 is best)
        queryBuilder = queryBuilder
          .order('tier', { ascending: true })
          .limit(limit * 2); // Get more candidates for filtering

        const result = await queryBuilder;
        return result;
      });

      if (error) {
        this.logger.error(
          'fallback_agent_search_failed',
          new AgentSelectionError('Database fallback search failed', {
            cause: error as Error,
            context: { operationId: fallbackId, domains, limit },
          }),
          { operation: 'fallbackAgentSearch', operationId: fallbackId }
        );
        return await this.getAnyAvailableAgent(limit, fallbackId);
      }

      // If no domain-specific results, relax filters
      if (!agents || agents.length === 0) {
        this.logger.warn('no_domain_specific_agents', {
          operationId: fallbackId,
          domains,
          fallingBackToGeneral: true,
        });

        const generalStartTime = Date.now();
        const { data: generalAgents, error: generalError } = await this.supabaseCircuitBreaker.execute(async () => {
          return await this.supabase
            .from('agents')
            .select('*')
            .eq('status', 'active') // Filter by active status
            .order('tier', { ascending: true })
            .limit(limit);
        });

        if (generalError) {
          this.logger.error(
            'general_fallback_search_failed',
            generalError as Error,
            { operationId: fallbackId }
          );
          return await this.getAnyAvailableAgent(limit, fallbackId);
        }

        const duration = Date.now() - generalStartTime;
        this.logger.infoWithMetrics('general_fallback_search_completed', duration, {
          operation: 'fallbackAgentSearch',
          operationId: fallbackId,
          resultCount: generalAgents?.length || 0,
          method: 'general_fallback',
        });

        // Record fallback search metrics (fire-and-forget)
        if (this.tenantId && generalAgents && generalAgents.length > 0) {
          this.metricsService.recordOperation({
            agentId: generalAgents[0].id,
            tenantId: this.tenantId,
            operationType: 'search',
            responseTimeMs: duration,
            success: true,
            queryText: 'general_fallback',
            searchMethod: 'database',
            graphragHit: false,
            graphragFallback: true,
            metadata: {
              operationId: fallbackId,
              resultCount: generalAgents.length,
            },
          }).catch(() => {
            // Silent fail
          });
        }

        return generalAgents || [];
      }

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('fallback_agent_search_completed', duration, {
        operation: 'fallbackAgentSearch',
        operationId: fallbackId,
        resultCount: agents.length,
        method: 'domain_filtered',
      });

      return agents;
    } catch (error) {
      this.logger.error(
        'fallback_agent_search_error',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'fallbackAgentSearch', operationId: fallbackId }
      );
      // Last resort: get any available agents
      return await this.getAnyAvailableAgent(limit, fallbackId);
    }
  }

  /**
   * Get any available agent as last resort
   * Enhanced with structured logging and status filtering
   */
  private async getAnyAvailableAgent(
    limit: number = 5,
    operationId?: string
  ): Promise<Agent[]> {
    const emergencyId = operationId || `emergency_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();

    this.logger.warn('using_emergency_agent_fallback', {
      operation: 'getAnyAvailableAgent',
      operationId: emergencyId,
      limit,
    });

    try {
      const { data: agents, error } = await this.supabaseCircuitBreaker.execute(async () => {
        return await this.supabase
          .from('agents')
          .select('*')
          .eq('status', 'active') // Filter by active status
          .order('tier', { ascending: true }) // Prefer higher tier agents
          .order('priority', { ascending: false }) // Then by priority
          .limit(limit);
      });

      if (error) {
        this.logger.error(
          'emergency_fallback_failed',
          new AgentSelectionError('Emergency fallback failed', {
            cause: error as Error,
            context: { operationId: emergencyId, limit },
          }),
          { operation: 'getAnyAvailableAgent', operationId: emergencyId }
        );
        return [];
      }

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('emergency_fallback_success', duration, {
        operation: 'getAnyAvailableAgent',
        operationId: emergencyId,
        resultCount: agents?.length || 0,
      });

      return agents || [];
    } catch (error) {
      this.logger.error(
        'emergency_fallback_error',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'getAnyAvailableAgent', operationId: emergencyId }
      );
      return [];
    }
  }

  /**
   * Rank agents based on multiple criteria
   * - Semantic similarity to query
   * - Domain relevance
   * - Tier level (higher tier preferred)
   * - Capability match
   */
  rankAgents(
    agents: Agent[],
    query: string,
    analysis: QueryAnalysis
  ): AgentRanking[] {
    const operationId = `ranking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();

    this.logger.info('agent_ranking_started', {
      operation: 'rankAgents',
      operationId,
      candidateCount: agents.length,
      queryPreview: query.substring(0, 100),
      intent: analysis.intent,
    });

    try {
      const rankings: AgentRanking[] = agents.map(agent => {
        const breakdown = this.calculateScoreBreakdown(agent, query, analysis);
        const totalScore = this.calculateTotalScore(breakdown);
        const reason = this.generateRankingReason(agent, breakdown, analysis);

        return {
          agent,
          score: totalScore,
          reason,
          breakdown
        };
      });

      // Sort by score (highest first)
      rankings.sort((a, b) => b.score - a.score);

      const duration = Date.now() - startTime;
      
      this.logger.infoWithMetrics('agent_ranking_completed', duration, {
        operation: 'rankAgents',
        operationId,
        rankedCount: rankings.length,
        topAgent: rankings[0]?.agent.name,
        topScore: rankings[0]?.score,
        scoreDistribution: {
          min: rankings.length > 0 ? Math.min(...rankings.map(r => r.score)) : 0,
          max: rankings.length > 0 ? Math.max(...rankings.map(r => r.score)) : 0,
          avg: rankings.length > 0
            ? rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length
            : 0,
        },
      });

      return rankings;
    } catch (error) {
      this.logger.error(
        'agent_ranking_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'rankAgents', operationId }
      );
      throw new AgentSelectionError('Ranking failed', {
        cause: error instanceof Error ? error : new Error(String(error)),
        context: { operationId, agentCount: agents.length },
      });
    }
  }

  /**
   * Calculate detailed score breakdown for an agent
   */
  private calculateScoreBreakdown(
    agent: Agent,
    query: string,
    analysis: QueryAnalysis
  ): AgentRanking['breakdown'] {
    // 1. Semantic similarity (based on description and capabilities)
    const semanticSimilarity = this.calculateSemanticSimilarity(agent, query);

    // 2. Domain relevance
    const domainRelevance = this.calculateDomainRelevance(agent, analysis.domains);

    // 3. Tier preference (higher tier = higher score)
    const tierPreference = this.calculateTierPreference(agent.tier);

    // 4. Capability match
    const capabilityMatch = this.calculateCapabilityMatch(agent, analysis);

    return {
      semanticSimilarity,
      domainRelevance,
      tierPreference,
      capabilityMatch
    };
  }

  /**
   * Calculate semantic similarity based on text overlap
   */
  private calculateSemanticSimilarity(agent: Agent, query: string): number {
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    const agentText = `${agent.name} ${agent.description} ${agent.system_prompt}`.toLowerCase();
    
    const matchingTerms = queryTerms.filter(term => agentText.includes(term));
    return matchingTerms.length / Math.max(queryTerms.length, 1);
  }

  /**
   * Calculate domain relevance score
   */
  private calculateDomainRelevance(agent: Agent, queryDomains: string[]): number {
    if (queryDomains.length === 0) return 0.5; // Neutral if no domains specified
    
    const agentDomains = agent.knowledge_domains || [];
    const matchingDomains = queryDomains.filter(domain => 
      agentDomains.some(agentDomain => 
        agentDomain.toLowerCase().includes(domain.toLowerCase()) ||
        domain.toLowerCase().includes(agentDomain.toLowerCase())
      )
    );
    
    return matchingDomains.length / queryDomains.length;
  }

  /**
   * Calculate tier preference score
   */
  private calculateTierPreference(tier: number): number {
    // Normalize tier to 0-1 scale (assuming tiers 1-5)
    return Math.min(tier / 5, 1);
  }

  /**
   * Calculate capability match score
   */
  private calculateCapabilityMatch(agent: Agent, analysis: QueryAnalysis): number {
    const agentCapabilities = agent.capabilities || [];
    const queryKeywords = [...analysis.keywords, ...analysis.medicalTerms];
    
    if (queryKeywords.length === 0) return 0.5; // Neutral if no keywords
    
    const matchingCapabilities = queryKeywords.filter(keyword =>
      agentCapabilities.some(capability =>
        capability.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(capability.toLowerCase())
      )
    );
    
    return matchingCapabilities.length / queryKeywords.length;
  }

  /**
   * Calculate total weighted score
   */
  private calculateTotalScore(breakdown: AgentRanking['breakdown']): number {
    // Weighted combination of all factors
    const weights = {
      semanticSimilarity: 0.4,
      domainRelevance: 0.3,
      tierPreference: 0.2,
      capabilityMatch: 0.1
    };

    return (
      breakdown.semanticSimilarity * weights.semanticSimilarity +
      breakdown.domainRelevance * weights.domainRelevance +
      breakdown.tierPreference * weights.tierPreference +
      breakdown.capabilityMatch * weights.capabilityMatch
    );
  }

  /**
   * Generate human-readable ranking reason
   */
  private generateRankingReason(
    agent: Agent,
    breakdown: AgentRanking['breakdown'],
    analysis: QueryAnalysis
  ): string {
    const reasons: string[] = [];

    if (breakdown.domainRelevance > 0.7) {
      reasons.push(`expertise in ${analysis.domains.join(', ')}`);
    }

    if (breakdown.semanticSimilarity > 0.6) {
      reasons.push('highly relevant to your query');
    }

    if (breakdown.tierPreference > 0.8) {
      reasons.push('high-tier specialist');
    }

    if (breakdown.capabilityMatch > 0.5) {
      reasons.push('matching capabilities');
    }

    if (reasons.length === 0) {
      return 'general purpose agent';
    }

    return reasons.join(', ');
  }

  /**
   * Generate embedding for text using Python AI Engine via API Gateway
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/embeddings/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': this.tenantId || DEFAULT_TENANT_ID,
        },
        body: JSON.stringify({
          text,
          model: 'text-embedding-3-small',
          provider: 'openai',
        }),
        signal: AbortSignal.timeout(10000), // 10 second timeout for embeddings
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Embedding generation failed: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data.embedding;

    } catch (error) {
      this.logger.error(
        'embedding_generation_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'generateEmbedding' }
      );
      throw error;
    }
  }

  /**
   * Complete agent selection workflow
   * Combines query analysis, agent search, and ranking
   */
  async selectBestAgent(query: string): Promise<AgentSelectionResult> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();

    this.logger.info('agent_selection_workflow_started', {
      operation: 'selectAgent',
      workflowId,
      queryPreview: query.substring(0, 100),
    });

    try {
      // Step 1: Analyze query
      const analysis = await this.analyzeQuery(query);

      // Step 2: Find candidate agents
      const candidates = await this.findCandidateAgents(query, analysis.domains, 10);

      if (candidates.length === 0) {
        throw new Error('No agents found for the given query');
      }

      // Step 3: Rank agents
      const rankings = this.rankAgents(candidates, query, analysis);

      // Step 4: Select best agent
      const selectedAgent = rankings[0];
      const confidence = Math.min(selectedAgent.score + analysis.confidence, 1);

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('agent_selection_workflow_completed', duration, {
        operation: 'selectAgent',
        workflowId,
        selectedAgent: selectedAgent.agent.name,
        confidence: confidence.toFixed(3),
        totalCandidates: candidates.length
      });

      // Record metrics (fire-and-forget)
      if (this.tenantId) {
        this.metricsService.recordOperation({
          agentId: selectedAgent.agent.id,
          tenantId: this.tenantId,
          operationType: 'selection',
          responseTimeMs: duration,
          success: true,
          queryText: query.substring(0, 1000),
          selectedAgentId: selectedAgent.agent.id,
          confidenceScore: confidence,
          metadata: {
            workflowId,
            candidateCount: candidates.length,
            rankingReason: selectedAgent.reason,
          },
        }).catch(() => {
          // Silent fail - metrics recording should never break the main flow
        });
      }

      return {
        selectedAgent: selectedAgent.agent,
        confidence,
        reasoning: selectedAgent.reason,
        alternativeAgents: rankings.slice(1, 4), // Top 3 alternatives
        analysis
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'agent_selection_workflow_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'selectAgent',
          workflowId,
          duration,
        }
      );

      // Record error metrics (fire-and-forget)
      if (this.tenantId && rankings && rankings.length > 0) {
        // If we got rankings but failed afterwards, record with selected agent
        this.metricsService.recordOperation({
          agentId: rankings[0].agent.id,
          tenantId: this.tenantId,
          operationType: 'selection',
          responseTimeMs: duration,
          success: false,
          errorOccurred: true,
          errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
          queryText: query.substring(0, 1000),
        }).catch(() => {
          // Silent fail
        });
      }

      throw error;
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const agentSelectorService = new AgentSelectorService();

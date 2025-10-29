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
  private pinecone: Pinecone;
  private openaiApiKey: string;
  private logger;

  constructor(options?: { requestId?: string; userId?: string }) {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Pinecone client
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.openaiApiKey = process.env.OPENAI_API_KEY!;

    // Initialize structured logger
    this.logger = createLogger({
      requestId: options?.requestId,
      userId: options?.userId,
    });
  }

  /**
   * Analyze query to extract intent, domains, and complexity
   * Uses OpenAI to classify medical query characteristics
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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [{
            role: 'system',
            content: `Analyze this medical/healthcare query and extract structured information. 
            
            Return a JSON object with:
            - intent: Primary intent (diagnosis, treatment, research, consultation, education, etc.)
            - domains: Array of medical domains (cardiology, oncology, neurology, etc.)
            - complexity: Complexity level (low, medium, high)
            - keywords: Key medical terms and concepts
            - medicalTerms: Specific medical terminology
            - confidence: Confidence score (0-1) in your analysis
            
            Focus on medical/healthcare context. If not medical, still analyze for general intent.`
          }, {
            role: 'user',
            content: query
          }],
          response_format: { type: 'json_object' },
          temperature: 0.3
        })
      });

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);

      console.log(`✅ [AgentSelector] Query analysis complete:`, {
        intent: analysis.intent,
        domains: analysis.domains,
        complexity: analysis.complexity,
        confidence: analysis.confidence
      });

      return {
        intent: analysis.intent || 'general',
        domains: analysis.domains || [],
        complexity: analysis.complexity || 'medium',
        keywords: analysis.keywords || [],
        medicalTerms: analysis.medicalTerms || [],
        confidence: analysis.confidence || 0.7
      };

    } catch (error) {
      console.error('❌ [AgentSelector] Query analysis failed:', error);
      
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
        this.logger.infoWithMetrics('agent_search_completed', duration, {
          operation: 'findCandidateAgents',
          operationId,
          method: 'graphrag_hybrid',
          resultCount: agents.length,
          topSimilarity: graphRAGResults[0]?.similarity,
        });

        return agents;
      } catch (graphRAGError) {
        // GraphRAG failed, fall back to database search
        this.logger.warn('graphrag_search_failed', {
          operationId,
          error: graphRAGError instanceof Error ? graphRAGError.message : String(graphRAGError),
          fallback: 'database',
        });

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
        return await this.fallbackAgentSearch(query, domains, limit, operationId);
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

      return await this.fallbackAgentSearch(query, domains, limit, operationId);
    }
  }

  /**
   * Fallback agent search using database text search
   */
  private async fallbackAgentSearch(
    query: string,
    domains: string[],
    limit: number
  ): Promise<Agent[]> {
    console.log('🔄 [AgentSelector] Using fallback database search...');

    try {
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

      // Order by tier and priority (higher tier = better)
      queryBuilder = queryBuilder
        .order('tier', { ascending: true })
        .limit(limit * 2); // Get more candidates for filtering

      const { data: agents, error } = await queryBuilder;

      if (error) {
        console.error('❌ [AgentSelector] Fallback search failed:', error);
        // Return any available agent as last resort
        return await this.getAnyAvailableAgent(limit);
      }

      // If no domain-specific results, relax filters
      if (!agents || agents.length === 0) {
        console.log('⚠️ [AgentSelector] No domain-specific agents found, using general fallback');
        
        const { data: generalAgents } = await this.supabase
          .from('agents')
          .select('*')
          .order('tier', { ascending: true })
          .limit(limit);
        
        console.log(`✅ [AgentSelector] General fallback found ${generalAgents?.length || 0} agents`);
        return generalAgents || [];
      }

      console.log(`✅ [AgentSelector] Fallback search found ${agents.length} agents`);
      return agents;

    } catch (error) {
      console.error('❌ [AgentSelector] Fallback search error:', error);
      // Return any available agent as last resort
      return await this.getAnyAvailableAgent(limit);
    }
  }

  /**
   * Get any available agent as a last resort fallback
   */
  private async getAnyAvailableAgent(limit: number = 5): Promise<Agent[]> {
    console.log('🔄 [AgentSelector] Getting any available agent as emergency fallback...');
    
    try {
      const { data: agents, error } = await this.supabase
        .from('agents')
        .select('*')
        .order('tier', { ascending: true })
        .order('priority', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [AgentSelector] Failed to get any agent:', error);
        return [];
      }

      console.log(`✅ [AgentSelector] Found ${agents?.length || 0} agents as fallback`);
      return agents || [];
    } catch (error) {
      console.error('❌ [AgentSelector] Error getting fallback agents:', error);
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
    console.log(`📊 [AgentSelector] Ranking ${agents.length} agents...`);

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

    console.log(`✅ [AgentSelector] Agent ranking complete. Top agent: ${rankings[0]?.agent.name} (score: ${rankings[0]?.score.toFixed(3)})`);

    return rankings;
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
   * Generate embedding for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small'
        })
      });

      const data = await response.json();
      return data.data[0].embedding;

    } catch (error) {
      console.error('❌ [AgentSelector] Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Complete agent selection workflow
   * Combines query analysis, agent search, and ranking
   */
  async selectBestAgent(query: string): Promise<AgentSelectionResult> {
    console.log('🎯 [AgentSelector] Starting complete agent selection workflow...');

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

      console.log(`✅ [AgentSelector] Agent selection complete:`, {
        selectedAgent: selectedAgent.agent.name,
        confidence: confidence.toFixed(3),
        totalCandidates: candidates.length
      });

      return {
        selectedAgent: selectedAgent.agent,
        confidence,
        reasoning: selectedAgent.reason,
        alternativeAgents: rankings.slice(1, 4), // Top 3 alternatives
        analysis
      };

    } catch (error) {
      console.error('❌ [AgentSelector] Agent selection failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const agentSelectorService = new AgentSelectorService();

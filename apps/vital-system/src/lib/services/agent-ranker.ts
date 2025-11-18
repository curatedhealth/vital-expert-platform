/**
 * Agent Ranker Service
 *
 * Ranks agents by relevance to user query using multi-factor scoring:
 * - Semantic similarity (40%): Profile embedding similarity
 * - Tier score (30%): Tier 1 > Tier 2 > Tier 3
 * - Domain match (20%): Knowledge domain overlap
 * - Performance (10%): Success rate and latency
 */

import { OpenAIEmbeddings } from '@langchain/openai';

import { supabaseAdmin } from '@vital/sdk/lib/supabase/admin';
import type { Agent } from '@/types/agent';

export interface RankingWeights {
  semantic: number;
  tier: number;
  domain: number;
  performance: number;
}

export interface RankedAgent {
  agent: Agent;
  scores: {
    semantic: number;
    tier: number;
    domain: number;
    performance: number;
    final: number;
  };
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RankingOptions {
  weights?: Partial<RankingWeights>;
  detectedDomains?: string[];
  minScore?: number;
  maxResults?: number;
  useCache?: boolean;
}

export class AgentRanker {
  private static instance: AgentRanker;
  private embeddings: OpenAIEmbeddings;
  private profileCache = new Map<string, number[]>();
  private performanceCache = new Map<string, PerformanceMetrics>();

  private readonly DEFAULT_WEIGHTS: RankingWeights = {
    semantic: 0.40,
    tier: 0.30,
    domain: 0.20,
    performance: 0.10,
  };

  private constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'text-embedding-3-large',
    });
  }

  static getInstance(): AgentRanker {
    if (!AgentRanker.instance) {
      AgentRanker.instance = new AgentRanker();
    }
    return AgentRanker.instance;
  }

  /**
   * Main ranking method - ranks agents by relevance to query
   */
  async rankAgents(
    query: string,
    candidates: Agent[],
    options: RankingOptions = {}
  ): Promise<RankedAgent[]> {
    const {
      weights = {},
      detectedDomains = [],
      minScore = 0.4,
      maxResults = 10,
      useCache = true,
    } = options;

    const finalWeights = { ...this.DEFAULT_WEIGHTS, ...weights };

    // Get query embedding
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Score each candidate
    const ranked = await Promise.all(
      candidates.map(async (agent) => {
        // Calculate individual scores
        const semanticScore = await this.calculateSemanticScore(
          queryEmbedding,
          agent,
          useCache
        );

        const tierScore = this.calculateTierScore(agent.tier);

        const domainScore = this.calculateDomainScore(
          agent,
          detectedDomains,
          query
        );

        const performanceScore = await this.calculatePerformanceScore(
          agent,
          useCache
        );

        // Calculate weighted final score
        const finalScore =
          semanticScore * finalWeights.semantic +
          tierScore * finalWeights.tier +
          domainScore * finalWeights.domain +
          performanceScore * finalWeights.performance;

        // Generate reasoning
        const reasoning = this.generateReasoning({
          agent,
          semanticScore,
          tierScore,
          domainScore,
          performanceScore,
          finalScore,
          detectedDomains,
        });

        // Determine confidence level
        const confidence = this.calculateConfidence(finalScore);

        return {
          agent,
          scores: {
            semantic: semanticScore,
            tier: tierScore,
            domain: domainScore,
            performance: performanceScore,
            final: finalScore,
          },
          reasoning,
          confidence,
        };
      })
    );

    // Sort by final score and filter
    return ranked
      .filter((r: any) => r.scores.final >= minScore)
      .sort((a, b) => b.scores.final - a.scores.final)
      .slice(0, maxResults);
  }

  /**
   * Calculate semantic similarity score (0-1)
   */
  private async calculateSemanticScore(
    queryEmbedding: number[],
    agent: Agent,
    useCache: boolean
  ): Promise<number> {
    try {
      // Check cache first
      if (useCache && this.profileCache.has(agent.id)) {
        const cachedEmbedding = this.profileCache.get(agent.id)!;
        return this.cosineSimilarity(queryEmbedding, cachedEmbedding);
      }

      // Build agent profile
      const profile = this.buildAgentProfile(agent);

      // Get profile embedding
      const profileEmbedding = await this.embeddings.embedQuery(profile);

      // Cache for future use
      if (useCache) {
        this.profileCache.set(agent.id, profileEmbedding);
      }

      // Calculate cosine similarity
      return this.cosineSimilarity(queryEmbedding, profileEmbedding);
    } catch (error) {
      console.error(`Failed to calculate semantic score for ${agent.name}:`, error);
      return 0.5; // Default middle score on error
    }
  }

  /**
   * Build comprehensive agent profile for embedding
   */
  private buildAgentProfile(agent: Agent): string {
    const parts: string[] = [
      `Name: ${agent.display_name || agent.name}`,
      `Role: ${agent.role || ''}`,
      `Description: ${agent.description || ''}`,
    ];

    // Add capabilities
    if (agent.capabilities && agent.capabilities.length > 0) {
      parts.push(`Capabilities: ${agent.capabilities.join(', ')}`);
    }

    // Add knowledge domains
    if (agent.knowledge_domains && agent.knowledge_domains.length > 0) {
      parts.push(`Knowledge Domains: ${agent.knowledge_domains.join(', ')}`);
    }

    // Add prompt keywords
    if (agent.prompt) {
      // Extract key phrases from prompt (first 200 chars)
      const promptSnippet = agent.prompt.substring(0, 200);
      parts.push(`Expertise: ${promptSnippet}`);
    }

    // Add tools
    if (agent.tools && agent.tools.length > 0) {
      const toolNames = agent.tools.map((t: any) =>
        typeof t === 'string' ? t : t.name
      ).join(', ');
      parts.push(`Tools: ${toolNames}`);
    }

    return parts.join('\n');
  }

  /**
   * Calculate tier-based score (0-1)
   * Tier 1 = 1.0, Tier 2 = 0.7, Tier 3 = 0.4
   */
  private calculateTierScore(tier?: number): number {
    if (!tier) return 0.5;

    switch (tier) {
      case 1:
        return 1.0; // Core domain specialists
      case 2:
        return 0.7; // Specialized domain experts
      case 3:
        return 0.4; // Emerging domain assistants
      default:
        return 0.5; // Unknown tier
    }
  }

  /**
   * Calculate domain match score (0-1)
   */
  private calculateDomainScore(
    agent: Agent,
    detectedDomains: string[],
    query: string
  ): number {
    if (!agent.knowledge_domains || agent.knowledge_domains.length === 0) {
      return 0.3; // Low score for agents without domains
    }

    if (detectedDomains.length === 0) {
      // If no domains detected, use general scoring
      return 0.5;
    }

    // Calculate overlap between agent domains and detected domains
    const overlap = agent.knowledge_domains.filter((d: any) =>
      detectedDomains.includes(d)
    ).length;

    const overlapRatio = overlap / detectedDomains.length;

    // Bonus for exact match
    if (overlapRatio === 1.0 && agent.knowledge_domains.length === detectedDomains.length) {
      return 1.0;
    }

    // Score based on overlap ratio
    return Math.min(0.95, 0.4 + (overlapRatio * 0.6));
  }

  /**
   * Calculate performance score based on historical metrics (0-1)
   */
  private async calculatePerformanceScore(
    agent: Agent,
    useCache: boolean
  ): Promise<number> {
    try {
      // Check cache first
      if (useCache && this.performanceCache.has(agent.id)) {
        const metrics = this.performanceCache.get(agent.id)!;
        return this.metricsToScore(metrics);
      }

      // Query conversation metrics
      const { data: conversations } = await supabaseAdmin
        .from('conversations')
        .select('status, created_at, updated_at, metadata')
        .eq('agent_id', agent.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!conversations || conversations.length === 0) {
        // New agent with no history - neutral score
        return 0.6;
      }

      // Calculate metrics
      const totalConversations = conversations.length;
      const successfulConversations = conversations.filter(
        c => c.status === 'completed' || c.status === 'active'
      ).length;

      const successRate = successfulConversations / totalConversations;

      // Calculate average response time if available
      let avgResponseTime = 0;
      let responseTimeCount = 0;

      for (const conv of conversations) {
        if (conv.metadata?.avg_response_time) {
          avgResponseTime += conv.metadata.avg_response_time;
          responseTimeCount++;
        }
      }

      const avgTime = responseTimeCount > 0
        ? avgResponseTime / responseTimeCount
        : 5000; // Default 5s

      // Response time score (faster is better)
      // < 2s = 1.0, < 5s = 0.8, < 10s = 0.6, > 10s = 0.4
      const timeScore = avgTime < 2000 ? 1.0
        : avgTime < 5000 ? 0.8
        : avgTime < 10000 ? 0.6
        : 0.4;

      const metrics: PerformanceMetrics = {
        successRate,
        avgResponseTime: avgTime,
        totalConversations,
      };

      // Cache metrics
      if (useCache) {
        this.performanceCache.set(agent.id, metrics);
      }

      // Combine success rate (70%) and response time (30%)
      return successRate * 0.7 + timeScore * 0.3;
    } catch (error) {
      console.error(`Failed to calculate performance score for ${agent.name}:`, error);
      return 0.6; // Default middle score on error
    }
  }

  /**
   * Convert metrics to score
   */
  private metricsToScore(metrics: PerformanceMetrics): number {
    const timeScore = metrics.avgResponseTime < 2000 ? 1.0
      : metrics.avgResponseTime < 5000 ? 0.8
      : metrics.avgResponseTime < 10000 ? 0.6
      : 0.4;

    return metrics.successRate * 0.7 + timeScore * 0.3;
  }

  /**
   * Generate human-readable reasoning for ranking
   */
  private generateReasoning(params: {
    agent: Agent;
    semanticScore: number;
    tierScore: number;
    domainScore: number;
    performanceScore: number;
    finalScore: number;
    detectedDomains: string[];
  }): string {
    const {
      agent,
      semanticScore,
      tierScore,
      domainScore,
      performanceScore,
      finalScore,
      detectedDomains,
    } = params;

    const reasons: string[] = [];

    // Semantic relevance
    if (semanticScore > 0.8) {
      reasons.push('Highly relevant to query');
    } else if (semanticScore > 0.6) {
      reasons.push('Moderately relevant to query');
    } else {
      reasons.push('Somewhat relevant to query');
    }

    // Tier
    if (agent.tier === 1) {
      reasons.push('Core domain specialist');
    } else if (agent.tier === 2) {
      reasons.push('Specialized domain expert');
    } else if (agent.tier === 3) {
      reasons.push('Emerging domain assistant');
    }

    // Domain match
    if (domainScore >= 0.9 && detectedDomains.length > 0) {
      reasons.push(`Perfect match for ${detectedDomains.join(', ')}`);
    } else if (domainScore >= 0.7 && detectedDomains.length > 0) {
      const matchedDomains = agent.knowledge_domains?.filter((d: any) =>
        detectedDomains.includes(d)
      ) || [];
      reasons.push(`Covers ${matchedDomains.join(', ')}`);
    }

    // Performance
    if (performanceScore > 0.8) {
      reasons.push('Excellent track record');
    } else if (performanceScore > 0.6) {
      reasons.push('Good performance history');
    }

    // Final summary
    const confidenceText = finalScore > 0.8 ? 'Excellent'
      : finalScore > 0.6 ? 'Good'
      : 'Fair';

    return `${confidenceText} match: ${reasons.join('; ')}`;
  }

  /**
   * Calculate confidence level based on final score
   */
  private calculateConfidence(finalScore: number): 'high' | 'medium' | 'low' {
    if (finalScore >= 0.75) return 'high';
    if (finalScore >= 0.55) return 'medium';
    return 'low';
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.profileCache.clear();
    this.performanceCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      profileCacheSize: this.profileCache.size,
      performanceCacheSize: this.performanceCache.size,
    };
  }
}

interface PerformanceMetrics {
  successRate: number;
  avgResponseTime: number;
  totalConversations: number;
}

export const agentRanker = AgentRanker.getInstance();

/**
 * AGENT SELECTOR SERVICE
 * 
 * Shared utilities for intelligent agent selection in Mode 2.
 * Provides query analysis, agent search, and ranking capabilities.
 * 
 * Features:
 * - Query analysis using OpenAI to extract intent and domains
 * - Pinecone semantic search for candidate agents
 * - Multi-criteria agent ranking (similarity, domain, tier, capabilities)
 * - Confidence scoring and reasoning generation
 */

import { createClient } from '@supabase/supabase-js';
import { Pinecone } from '@pinecone-database/pinecone';

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

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Pinecone client
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.openaiApiKey = process.env.OPENAI_API_KEY!;
  }

  /**
   * Analyze query to extract intent, domains, and complexity
   * Uses OpenAI to classify medical query characteristics
   */
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    console.log('🔍 [AgentSelector] Analyzing query for intent and domains...');

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
   * Search for candidate agents using Pinecone semantic search
   * Filters by domains and capabilities
   */
  async findCandidateAgents(
    query: string,
    domains: string[],
    limit: number = 10
  ): Promise<Agent[]> {
    console.log('🔍 [AgentSelector] Searching for candidate agents...');
    console.log(`   Query: "${query}"`);
    console.log(`   Domains: ${domains.join(', ')}`);
    console.log(`   Limit: ${limit}`);

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Search Pinecone for similar agents
      const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME!);
      
      const searchParams: any = {
        vector: queryEmbedding,
        topK: limit,
        includeMetadata: true
      };

      // Add domain filter if domains are specified
      if (domains.length > 0) {
        searchParams.filter = {
          knowledge_domains: { $in: domains }
        };
      }

      const searchResults = await index.query(searchParams);

      // Extract agent IDs from Pinecone results
      const agentIds = searchResults.matches
        .map(match => match.metadata?.agent_id)
        .filter(Boolean);

      if (agentIds.length === 0) {
        console.log('⚠️  [AgentSelector] No agents found in Pinecone, falling back to database search');
        return await this.fallbackAgentSearch(query, domains, limit);
      }

      // Fetch full agent details from Supabase
      const { data: agents, error } = await this.supabase
        .from('agents')
        .select(`
          id,
          name,
          display_name,
          description,
          system_prompt,
          tier,
          capabilities,
          knowledge_domains,
          specialties,
          model,
          metadata
        `)
        .in('id', agentIds);

      if (error) {
        console.error('❌ [AgentSelector] Failed to fetch agent details:', error);
        return await this.fallbackAgentSearch(query, domains, limit);
      }

      console.log(`✅ [AgentSelector] Found ${agents?.length || 0} candidate agents`);
      return agents || [];

    } catch (error) {
      console.error('❌ [AgentSelector] Pinecone search failed:', error);
      return await this.fallbackAgentSearch(query, domains, limit);
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
      let queryBuilder = this.supabase
        .from('agents')
        .select(`
          id,
          name,
          display_name,
          description,
          system_prompt,
          tier,
          capabilities,
          knowledge_domains,
          specialties,
          model,
          metadata
        `)
        .limit(limit);

      // Add domain filter if specified
      if (domains.length > 0) {
        queryBuilder = queryBuilder.overlaps('knowledge_domains', domains);
      }

      // Add text search on name and description
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      if (searchTerms.length > 0) {
        queryBuilder = queryBuilder.or(
          searchTerms.map(term => `name.ilike.%${term}%,description.ilike.%${term}%`).join(',')
        );
      }

      const { data: agents, error } = await queryBuilder;

      if (error) {
        console.error('❌ [AgentSelector] Fallback search failed:', error);
        return [];
      }

      console.log(`✅ [AgentSelector] Fallback search found ${agents?.length || 0} agents`);
      return agents || [];

    } catch (error) {
      console.error('❌ [AgentSelector] Fallback search error:', error);
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

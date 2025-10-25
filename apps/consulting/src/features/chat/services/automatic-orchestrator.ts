/**
 * Automatic Agent Orchestrator
 *
 * Automatically selects and executes the most relevant agent based on user query.
 *
 * 4-Phase Selection Process:
 * 1. Domain Detection (~100ms) - Regex + RAG fallback
 * 2. PostgreSQL Filtering (~50ms) - Domain overlap, tier, status
 * 3. RAG Ranking (~200ms) - Multi-factor scoring
 * 4. Execution - EnhancedAgentOrchestrator with selected agent
 *
 * Total latency target: < 500ms
 */

import { agentRanker, type RankedAgent } from '@/lib/services/agent-ranker';
import { domainDetector, type DetectedDomain } from '@/lib/services/knowledge-domain-detector';
import { modelSelector } from '@/lib/services/model-selector';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Agent } from '@/types/agent';

import { EnhancedAgentOrchestrator } from './enhanced-agent-orchestrator';


import type { Message } from 'ai';

export interface AutomaticOrchestratorOptions {
  /**
   * Maximum number of candidate agents to consider
   * @default 10
   */
  maxCandidates?: number;

  /**
   * Maximum tier to consider (1 = only Tier 1, 3 = all tiers)
   * @default 3
   */
  maxTier?: number;

  /**
   * Minimum confidence score to execute agent
   * @default 0.4
   */
  minConfidence?: number;

  /**
   * Use specialized models for Tier 1 agents
   * @default true
   */
  useSpecializedModels?: boolean;

  /**
   * Enable panel mode (multiple agents)
   * @default false
   */
  enablePanelMode?: boolean;

  /**
   * Number of agents in panel mode
   * @default 3
   */
  panelSize?: number;

  /**
   * Override model selection
   */
  modelOverride?: string;

  /**
   * User ID for personalization
   */
  userId?: string;

  /**
   * Conversation ID for context
   */
  conversationId?: string;
}

export interface AutomaticOrchestratorResult {
  selectedAgent: Agent;
  rankedAgents: RankedAgent[];
  detectedDomains: DetectedDomain[];
  performance: {
    domainDetection: number;
    filtering: number;
    ranking: number;
    execution: number;
    total: number;
  };
  response: ReadableStream<Uint8Array>;
  reasoning: string;
}

export class AutomaticAgentOrchestrator {
  private enhancedOrchestrator: EnhancedAgentOrchestrator;

  constructor() {
    this.enhancedOrchestrator = new EnhancedAgentOrchestrator();
  }

  /**
   * Main chat method - automatically selects and executes best agent
   */
  async chat(
    query: string,
    conversationHistory: Message[] = [],
    options: AutomaticOrchestratorOptions = {}
  ): Promise<AutomaticOrchestratorResult> {
    const startTime = Date.now();
    const {
      maxCandidates = 10,
      maxTier = 3,
      minConfidence = 0.4,
      useSpecializedModels = true,
      modelOverride,
      userId,
      conversationId,
    } = options;

    console.log('[AutomaticOrchestrator] Starting agent selection for query:', query.substring(0, 100));

    // Phase 1: Domain Detection (~100ms)
    const domainDetectionStart = Date.now();
    const detectedDomains = await domainDetector.detectDomains(query, {
      maxDomains: 5,
      minConfidence: 0.3,
      useRAG: true,
    });
    const domainDetectionTime = Date.now() - domainDetectionStart;

    console.log('[AutomaticOrchestrator] Detected domains:', detectedDomains.map(d => ({
      domain: d.domain,
      confidence: d.confidence.toFixed(2),
      method: d.method,
    })));

    // Phase 2: PostgreSQL Filtering (~50ms)
    const filteringStart = Date.now();
    const candidates = await this.filterCandidates({
      detectedDomains: detectedDomains.map(d => d.domain),
      maxTier,
      maxCandidates: maxCandidates * 2, // Get more for ranking
    });
    const filteringTime = Date.now() - filteringStart;

    console.log('[AutomaticOrchestrator] Found', candidates.length, 'candidate agents');

    if (candidates.length === 0) {
      throw new Error('No suitable agents found for this query. Please try rephrasing or contact support.');
    }

    // Phase 3: RAG Ranking (~200ms)
    const rankingStart = Date.now();
    const rankedAgents = await agentRanker.rankAgents(query, candidates, {
      detectedDomains: detectedDomains.map(d => d.domain),
      minScore: minConfidence,
      maxResults: maxCandidates,
      useCache: true,
    });
    const rankingTime = Date.now() - rankingStart;

    console.log('[AutomaticOrchestrator] Top ranked agents:', rankedAgents.slice(0, 3).map(r => ({
      name: r.agent.name,
      score: r.scores.final.toFixed(3),
      confidence: r.confidence,
      reasoning: r.reasoning,
    })));

    if (rankedAgents.length === 0) {
      throw new Error('No agents meet the minimum confidence threshold. Please try a more specific query.');
    }

    // Phase 4: Execution
    const executionStart = Date.now();
    const selectedAgent = rankedAgents[0].agent;
    const selectedRanking = rankedAgents[0];

    console.log('[AutomaticOrchestrator] Selected agent:', selectedAgent.name, 'with score:', selectedRanking.scores.final.toFixed(3));

    // Get recommended model for this agent
    let selectedModel = modelOverride;
    if (!selectedModel) {
      selectedModel = await modelSelector.getChatModel({
        knowledgeDomains: selectedAgent.knowledge_domains || [],
        tier: selectedAgent.tier,
        useSpecialized: useSpecializedModels && selectedAgent.tier === 1,
      });
    }

    console.log('[AutomaticOrchestrator] Using model:', selectedModel);

    // Execute with EnhancedAgentOrchestrator
    const response = await this.enhancedOrchestrator.chat({
      agentId: selectedAgent.id,
      message: query,
      conversationHistory,
      modelOverride: selectedModel,
      userId,
      conversationId,
    });

    const executionTime = Date.now() - executionStart;
    const totalTime = Date.now() - startTime;

    console.log('[AutomaticOrchestrator] Performance:', {
      domainDetection: `${domainDetectionTime}ms`,
      filtering: `${filteringTime}ms`,
      ranking: `${rankingTime}ms`,
      execution: `${executionTime}ms`,
      total: `${totalTime}ms`,
    });

    // Generate reasoning
    const reasoning = this.generateReasoning({
      selectedAgent,
      selectedRanking,
      detectedDomains,
      rankedAgents: rankedAgents.slice(0, 3),
      selectedModel,
    });

    return {
      selectedAgent,
      rankedAgents,
      detectedDomains,
      performance: {
        domainDetection: domainDetectionTime,
        filtering: filteringTime,
        ranking: rankingTime,
        execution: executionTime,
        total: totalTime,
      },
      response,
      reasoning,
    };
  }

  /**
   * Filter candidate agents using PostgreSQL
   */
  private async filterCandidates(params: {
    detectedDomains: string[];
    maxTier: number;
    maxCandidates: number;
  }): Promise<Agent[]> {
    const { detectedDomains, maxTier, maxCandidates } = params;

    // Build query
    let query = supabaseAdmin
      .from('agents')
      .select('*')
      .eq('status', 'active')
      .lte('tier', maxTier)
      .order('tier', { ascending: true })
      .order('priority', { ascending: false });

    // Filter by knowledge domains if detected
    if (detectedDomains.length > 0) {
      query = query.overlaps('knowledge_domains', detectedDomains);
    }

    query = query.limit(maxCandidates);

    const { data: agents, error } = await query;

    if (error) {
      console.error('[AutomaticOrchestrator] Failed to filter candidates:', error);
      throw new Error('Failed to load candidate agents');
    }

    // If no domain-specific agents found, fall back to general agents
    if (!agents || agents.length === 0) {
      console.log('[AutomaticOrchestrator] No domain-specific agents, falling back to top-tier agents');

      const { data: fallbackAgents, error: fallbackError } = await supabaseAdmin
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .lte('tier', maxTier)
        .order('tier', { ascending: true })
        .order('priority', { ascending: false })
        .limit(maxCandidates);

      if (fallbackError) {
        console.error('[AutomaticOrchestrator] Fallback query failed:', fallbackError);
        throw new Error('Failed to load fallback agents');
      }

      return fallbackAgents || [];
    }

    return agents;
  }

  /**
   * Generate human-readable reasoning for agent selection
   */
  private generateReasoning(params: {
    selectedAgent: Agent;
    selectedRanking: RankedAgent;
    detectedDomains: DetectedDomain[];
    rankedAgents: RankedAgent[];
    selectedModel: string;
  }): string {
    const {
      selectedAgent,
      selectedRanking,
      detectedDomains,
      rankedAgents,
      selectedModel,
    } = params;

    const parts: string[] = [];

    // Agent selection
    parts.push(`Selected **${selectedAgent.display_name || selectedAgent.name}** as the most suitable agent.`);

    // Domain detection
    if (detectedDomains.length > 0) {
      const topDomains = detectedDomains
        .slice(0, 3)
        .map(d => d.domain)
        .join(', ');
      parts.push(`Detected domains: ${topDomains}`);
    }

    // Scoring breakdown
    const scores = selectedRanking.scores;
    parts.push(
      `Confidence: **${selectedRanking.confidence}** (score: ${scores.final.toFixed(2)})`
    );

    // Reasoning
    parts.push(`Reasoning: ${selectedRanking.reasoning}`);

    // Model selection
    parts.push(`Using model: ${selectedModel}`);

    // Alternative agents
    if (rankedAgents.length > 1) {
      const alternatives = rankedAgents
        .slice(1, 3)
        .map(r => `${r.agent.display_name || r.agent.name} (${r.scores.final.toFixed(2)})`)
        .join(', ');
      parts.push(`Other considered agents: ${alternatives}`);
    }

    return parts.join('\n\n');
  }

  /**
   * Get agent selection preview without execution
   */
  async preview(
    query: string,
    options: AutomaticOrchestratorOptions = {}
  ): Promise<{
    selectedAgent: Agent;
    rankedAgents: RankedAgent[];
    detectedDomains: DetectedDomain[];
    reasoning: string;
  }> {
    const {
      maxCandidates = 10,
      maxTier = 3,
      minConfidence = 0.4,
    } = options;

    // Phase 1: Domain Detection
    const detectedDomains = await domainDetector.detectDomains(query, {
      maxDomains: 5,
      minConfidence: 0.3,
      useRAG: true,
    });

    // Phase 2: Filtering
    const candidates = await this.filterCandidates({
      detectedDomains: detectedDomains.map(d => d.domain),
      maxTier,
      maxCandidates: maxCandidates * 2,
    });

    if (candidates.length === 0) {
      throw new Error('No suitable agents found');
    }

    // Phase 3: Ranking
    const rankedAgents = await agentRanker.rankAgents(query, candidates, {
      detectedDomains: detectedDomains.map(d => d.domain),
      minScore: minConfidence,
      maxResults: maxCandidates,
      useCache: true,
    });

    if (rankedAgents.length === 0) {
      throw new Error('No agents meet minimum confidence');
    }

    const selectedAgent = rankedAgents[0].agent;
    const selectedRanking = rankedAgents[0];

    const selectedModel = await modelSelector.getChatModel({
      knowledgeDomains: selectedAgent.knowledge_domains || [],
      tier: selectedAgent.tier,
    });

    const reasoning = this.generateReasoning({
      selectedAgent,
      selectedRanking,
      detectedDomains,
      rankedAgents: rankedAgents.slice(0, 3),
      selectedModel,
    });

    return {
      selectedAgent,
      rankedAgents,
      detectedDomains,
      reasoning,
    };
  }

  /**
   * Panel mode - execute query with multiple agents
   */
  async chatPanel(
    query: string,
    conversationHistory: Message[] = [],
    options: AutomaticOrchestratorOptions = {}
  ): Promise<{
    results: Array<{
      agent: Agent;
      response: ReadableStream<Uint8Array>;
      ranking: RankedAgent;
    }>;
    detectedDomains: DetectedDomain[];
    reasoning: string;
  }> {
    const {
      panelSize = 3,
      maxTier = 3,
      minConfidence = 0.4,
    } = options;

    // Get top N agents
    const preview = await this.preview(query, {
      ...options,
      maxCandidates: panelSize,
    });

    // Execute all agents in parallel
    const results = await Promise.all(
      preview.rankedAgents.map(async (ranking) => {
        const selectedModel = await modelSelector.getChatModel({
          knowledgeDomains: ranking.agent.knowledge_domains || [],
          tier: ranking.agent.tier,
        });

        const response = await this.enhancedOrchestrator.chat({
          agentId: ranking.agent.id,
          message: query,
          conversationHistory,
          modelOverride: selectedModel,
        });

        return {
          agent: ranking.agent,
          response,
          ranking,
        };
      })
    );

    const reasoning = `Executing query with ${results.length} agents:\n\n` +
      results.map((r, i) =>
        `${i + 1}. **${r.agent.display_name || r.agent.name}** (score: ${r.ranking.scores.final.toFixed(2)})\n   ${r.ranking.reasoning}`
      ).join('\n\n');

    return {
      results,
      detectedDomains: preview.detectedDomains,
      reasoning,
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    agentRanker.clearCache();
    console.log('[AutomaticOrchestrator] Caches cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return agentRanker.getCacheStats();
  }
}

export const automaticOrchestrator = new AutomaticAgentOrchestrator();

/**
 * Agent Orchestrator Service - Core service for intelligent agent selection
 * 
 * This service implements the core business logic for selecting the most
 * appropriate AI agent based on query analysis, agent capabilities, and
 * user context. It follows clean architecture principles by being
 * framework-agnostic and focused on business logic.
 */

import { Agent, QueryIntent } from '@/core/domain/entities';

export interface AgentSelectionResult {
  selected: Agent | null;
  confidence: number;
  reasoning: string;
  alternatives: Agent[];
  processingTime: number;
}

export interface AgentScoringResult {
  agent: Agent;
  score: number;
  reasoning: string;
  factors: {
    capabilityMatch: number;
    domainExpertise: number;
    performanceScore: number;
    userPreference: number;
    availability: number;
  };
}

export interface AgentSelectionContext {
  chatHistory?: any[];
  userPreferences?: {
    preferredAgents?: string[];
    avoidAgents?: string[];
  };
  currentMode?: 'manual' | 'automatic';
  urgency?: 'low' | 'medium' | 'high';
  complexity?: 'low' | 'medium' | 'high';
}

export interface IIntentAnalyzer {
  analyze(query: string): Promise<QueryIntent>;
}

export interface IAgentScorer {
  scoreAgents(
    agents: Agent[],
    intent: QueryIntent,
    context?: AgentSelectionContext
  ): Promise<AgentScoringResult[]>;
}

export class AgentOrchestrator {
  constructor(
    private readonly intentAnalyzer: IIntentAnalyzer,
    private readonly agentScorer: IAgentScorer
  ) {}

  /**
   * Select the best agent for a given query
   */
  async selectBestAgent(
    query: string,
    availableAgents: Agent[],
    context?: AgentSelectionContext
  ): Promise<AgentSelectionResult> {
    const startTime = Date.now();

    try {
      console.log('🔍 [AgentOrchestrator] Starting agent selection process');
      console.log(`📝 Query: "${query.substring(0, 100)}..."`);
      console.log(`🎯 Available agents: ${availableAgents.length}`);

      // Step 1: Analyze query intent
      console.log('🧠 [Step 1] Analyzing query intent...');
      const intent = await this.intentAnalyzer.analyze(query);
      console.log('✅ Intent analysis complete:', {
        domain: intent.domain,
        capabilities: intent.requiredCapabilities,
        complexity: intent.complexity,
        urgency: intent.urgency
      });

      // Step 2: Filter agents by basic requirements
      console.log('🔍 [Step 2] Filtering agents by requirements...');
      const suitableAgents = this.filterSuitableAgents(availableAgents, intent, context);
      console.log(`✅ Filtered to ${suitableAgents.length} suitable agents`);

      if (suitableAgents.length === 0) {
        return this.createNoAgentResult(query, startTime);
      }

      // Step 3: Score all suitable agents
      console.log('📊 [Step 3] Scoring agents...');
      const scoredAgents = await this.agentScorer.scoreAgents(
        suitableAgents,
        intent,
        context
      );

      // Step 4: Select best agent
      console.log('🏆 [Step 4] Selecting best agent...');
      const bestAgent = scoredAgents[0];
      const alternatives = scoredAgents.slice(1, 4);

      const processingTime = Date.now() - startTime;

      console.log(`✅ Agent selected: ${bestAgent.agent.name} (score: ${bestAgent.score.toFixed(3)})`);
      console.log(`⏱️ Processing time: ${processingTime}ms`);

      return {
        selected: bestAgent.agent,
        confidence: bestAgent.score,
        reasoning: bestAgent.reasoning,
        alternatives: alternatives.map(a => a.agent),
        processingTime
      };

    } catch (error) {
      console.error('❌ [AgentOrchestrator] Error during agent selection:', error);
      return this.createErrorResult(error, startTime);
    }
  }

  /**
   * Suggest multiple agents for a query (for manual selection)
   */
  async suggestAgents(
    query: string,
    agents: Agent[],
    count: number = 3,
    context?: AgentSelectionContext
  ): Promise<Agent[]> {
    try {
      console.log(`💡 [AgentOrchestrator] Suggesting ${count} agents for query`);

      const intent = await this.intentAnalyzer.analyze(query);
      const suitableAgents = this.filterSuitableAgents(agents, intent, context);
      
      if (suitableAgents.length === 0) {
        return [];
      }

      const scoredAgents = await this.agentScorer.scoreAgents(
        suitableAgents,
        intent,
        context
      );

      return scoredAgents
        .slice(0, count)
        .map(result => result.agent);

    } catch (error) {
      console.error('❌ [AgentOrchestrator] Error suggesting agents:', error);
      return [];
    }
  }

  /**
   * Get agent recommendations based on user history
   */
  async getAgentRecommendations(
    userId: string,
    userHistory: any[],
    availableAgents: Agent[]
  ): Promise<Agent[]> {
    try {
      console.log(`👤 [AgentOrchestrator] Getting recommendations for user: ${userId}`);

      // Analyze user's historical preferences
      const preferences = this.analyzeUserPreferences(userHistory);
      
      // Score agents based on user preferences
      const scoredAgents = availableAgents.map(agent => ({
        agent,
        score: this.calculatePreferenceScore(agent, preferences)
      }));

      // Return top recommendations
      return scoredAgents
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(result => result.agent);

    } catch (error) {
      console.error('❌ [AgentOrchestrator] Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Filter agents based on basic requirements
   */
  private filterSuitableAgents(
    agents: Agent[],
    intent: QueryIntent,
    context?: AgentSelectionContext
  ): Agent[] {
    return agents.filter(agent => {
      // Check if agent can handle the query
      if (!agent.canHandleQuery(intent)) {
        return false;
      }

      // Check if agent matches the domain
      if (!agent.matchesDomain(intent.domain)) {
        return false;
      }

      // Check user preferences
      if (context?.userPreferences?.avoidAgents?.includes(agent.id)) {
        return false;
      }

      // Check if agent is suitable for the complexity level
      if (intent.complexity === 'high' && agent.tier < 2) {
        return false;
      }

      // Check if agent is suitable for urgency
      if (intent.urgency === 'high' && !agent.isAutonomousCapable()) {
        return false;
      }

      return true;
    });
  }

  /**
   * Analyze user preferences from history
   */
  private analyzeUserPreferences(userHistory: any[]): {
    preferredDomains: string[];
    preferredCapabilities: string[];
    preferredTiers: number[];
    averageComplexity: 'low' | 'medium' | 'high';
  } {
    const domains = new Map<string, number>();
    const capabilities = new Map<string, number>();
    const tiers = new Map<number, number>();
    let complexitySum = 0;

    userHistory.forEach(interaction => {
      if (interaction.agent) {
        // Track domain usage
        interaction.agent.knowledgeDomains?.forEach((domain: string) => {
          domains.set(domain, (domains.get(domain) || 0) + 1);
        });

        // Track capability usage
        interaction.agent.capabilities?.forEach((capability: string) => {
          capabilities.set(capability, (capabilities.get(capability) || 0) + 1);
        });

        // Track tier usage
        if (interaction.agent.tier) {
          tiers.set(interaction.agent.tier, (tiers.get(interaction.agent.tier) || 0) + 1);
        }
      }

      // Track complexity
      if (interaction.complexity) {
        const complexityValue = interaction.complexity === 'low' ? 1 : 
                               interaction.complexity === 'medium' ? 2 : 3;
        complexitySum += complexityValue;
      }
    });

    const averageComplexity = complexitySum / userHistory.length;
    const complexityLevel = averageComplexity <= 1.5 ? 'low' : 
                           averageComplexity <= 2.5 ? 'medium' : 'high';

    return {
      preferredDomains: Array.from(domains.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([domain]) => domain),
      preferredCapabilities: Array.from(capabilities.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([capability]) => capability),
      preferredTiers: Array.from(tiers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tier]) => tier),
      averageComplexity: complexityLevel as 'low' | 'medium' | 'high'
    };
  }

  /**
   * Calculate preference score for an agent
   */
  private calculatePreferenceScore(
    agent: Agent,
    preferences: ReturnType<typeof this.analyzeUserPreferences>
  ): number {
    let score = 0;

    // Domain match
    const domainMatches = agent.knowledgeDomains.filter(domain =>
      preferences.preferredDomains.includes(domain)
    ).length;
    score += (domainMatches / preferences.preferredDomains.length) * 0.4;

    // Capability match
    const capabilityMatches = agent.capabilities.filter(capability =>
      preferences.preferredCapabilities.includes(capability)
    ).length;
    score += (capabilityMatches / preferences.preferredCapabilities.length) * 0.3;

    // Tier preference
    if (preferences.preferredTiers.includes(agent.tier)) {
      score += 0.2;
    }

    // Complexity match
    const complexityMatch = (
      (preferences.averageComplexity === 'low' && agent.tier <= 2) ||
      (preferences.averageComplexity === 'medium' && agent.tier >= 2) ||
      (preferences.averageComplexity === 'high' && agent.tier >= 3)
    );
    if (complexityMatch) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * Create result when no suitable agent is found
   */
  private createNoAgentResult(query: string, startTime: number): AgentSelectionResult {
    const processingTime = Date.now() - startTime;
    
    return {
      selected: null,
      confidence: 0,
      reasoning: `No suitable agents found for query: "${query.substring(0, 50)}...". Please try rephrasing your question or contact support.`,
      alternatives: [],
      processingTime
    };
  }

  /**
   * Create result when an error occurs
   */
  private createErrorResult(error: unknown, startTime: number): AgentSelectionResult {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      selected: null,
      confidence: 0,
      reasoning: `Error during agent selection: ${errorMessage}. Please try again or contact support.`,
      alternatives: [],
      processingTime
    };
  }
}

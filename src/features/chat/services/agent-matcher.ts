import { Agent } from '@/types/agent';
import { QueryAnalysis } from './query-analyzer';

export interface AgentMatch {
  agent: Agent;
  score: number;
  confidence: number;
  reasoning: string[];
  capabilities: string[];
  tier: number;
}

export class AgentMatcher {
  private agents: Agent[];
  private performanceHistory: Map<string, AgentPerformance>;
  
  constructor(agents: Agent[]) {
    this.agents = agents;
    this.performanceHistory = new Map();
    this.loadPerformanceHistory();
  }
  
  async findBestAgents(
    analysis: QueryAnalysis,
    options?: {
      maxAgents?: number;
      minConfidence?: number;
      includeTiers?: number[];
    }
  ): Promise<AgentMatch[]> {
    const matches: AgentMatch[] = [];
    
    for (const agent of this.agents) {
      // Skip if tier filtering is applied
      if (options?.includeTiers && !options.includeTiers.includes(agent.tier || 1)) {
        continue;
      }
      
      const match = await this.scoreAgent(agent, analysis);
      
      if (match.confidence >= (options?.minConfidence || 0.5)) {
        matches.push(match);
      }
    }
    
    // Sort by score (descending)
    matches.sort((a, b) => b.score - a.score);
    
    // Return top N agents
    return matches.slice(0, options?.maxAgents || 5);
  }
  
  private async scoreAgent(agent: Agent, analysis: QueryAnalysis): Promise<AgentMatch> {
    const scores = {
      domainMatch: this.scoreDomainMatch(agent, analysis),
      capabilityMatch: this.scoreCapabilityMatch(agent, analysis),
      complexityFit: this.scoreComplexityFit(agent, analysis),
      historicalPerformance: this.scoreHistoricalPerformance(agent, analysis),
      availability: this.scoreAvailability(agent),
      tierBonus: this.getTierBonus(agent.tier || 1, analysis.complexity.score)
    };
    
    // Weighted scoring
    const weights = {
      domainMatch: 0.35,
      capabilityMatch: 0.30,
      complexityFit: 0.15,
      historicalPerformance: 0.10,
      availability: 0.05,
      tierBonus: 0.05
    };
    
    const totalScore = Object.entries(scores).reduce(
      (sum, [key, score]) => sum + score * weights[key as keyof typeof weights],
      0
    );
    
    // Generate reasoning
    const reasoning = this.generateReasoning(agent, analysis, scores);
    
    return {
      agent,
      score: totalScore,
      confidence: this.calculateConfidence(scores, analysis),
      reasoning,
      capabilities: this.matchedCapabilities(agent, analysis),
      tier: agent.tier || 1
    };
  }
  
  private scoreDomainMatch(agent: Agent, analysis: QueryAnalysis): number {
    let score = 0;
    
    // Primary domain match
    if (agent.business_function?.toLowerCase() === analysis.domain.primary.toLowerCase()) {
      score += 1.0;
    } else if (agent.knowledge_domains?.includes(analysis.domain.primary)) {
      score += 0.8;
    }
    
    // Secondary domain matches
    analysis.domain.secondary?.forEach(domain => {
      if (agent.knowledge_domains?.includes(domain)) {
        score += 0.3;
      }
    });
    
    // Interdisciplinary bonus
    if (analysis.domain.interdisciplinary && agent.capabilities?.includes('interdisciplinary')) {
      score += 0.5;
    }
    
    return Math.min(score, 1.0);
  }
  
  private scoreCapabilityMatch(agent: Agent, analysis: QueryAnalysis): number {
    if (!agent.capabilities || !analysis.requiredCapabilities) {
      return 0;
    }
    
    const requiredCaps = new Set(analysis.requiredCapabilities);
    const agentCaps = new Set(agent.capabilities);
    
    let matchCount = 0;
    for (const cap of requiredCaps) {
      if (agentCaps.has(cap)) {
        matchCount++;
      }
    }
    
    return requiredCaps.size > 0 ? matchCount / requiredCaps.size : 0;
  }
  
  private scoreComplexityFit(agent: Agent, analysis: QueryAnalysis): number {
    const complexity = analysis.complexity.score;
    const agentTier = agent.tier || 1;
    
    // Tier 1: Best for complexity 1-4
    // Tier 2: Best for complexity 4-7
    // Tier 3: Best for complexity 7-10
    
    if (agentTier === 1) {
      if (complexity <= 4) return 1.0;
      if (complexity <= 6) return 0.7;
      return 0.4;
    } else if (agentTier === 2) {
      if (complexity >= 4 && complexity <= 7) return 1.0;
      if (complexity < 4) return 0.7; // Overqualified
      if (complexity > 7) return 0.8; // Might need escalation
      return 0.5;
    } else if (agentTier === 3) {
      if (complexity >= 7) return 1.0;
      if (complexity >= 5) return 0.8;
      return 0.5; // Overqualified for simple queries
    }
    
    return 0.5;
  }
  
  private scoreHistoricalPerformance(agent: Agent, analysis: QueryAnalysis): number {
    const performance = this.performanceHistory.get(agent.id || '');
    if (!performance) return 0.7; // Default for new agents
    
    // Consider success rate for similar queries
    const similarQueries = performance.queries.filter(q => 
      q.domain === analysis.domain.primary
    );
    
    if (similarQueries.length === 0) return 0.7;
    
    const successRate = similarQueries.filter(q => q.success).length / similarQueries.length;
    const avgResponseTime = similarQueries.reduce((sum, q) => sum + q.responseTime, 0) / similarQueries.length;
    const avgUserRating = similarQueries.reduce((sum, q) => sum + (q.rating || 3), 0) / similarQueries.length;
    
    // Combine metrics
    const performanceScore = (
      successRate * 0.5 +
      (1 - Math.min(avgResponseTime / 30, 1)) * 0.3 + // Normalize response time to 30s max
      (avgUserRating / 5) * 0.2
    );
    
    return performanceScore;
  }
  
  private scoreAvailability(agent: Agent): number {
    // In production, check real-time availability
    // For now, return high availability
    return 0.95;
  }
  
  private getTierBonus(tier: number, complexity: number): number {
    // Higher tier agents get bonus for complex queries
    if (tier === 3 && complexity >= 7) return 0.2;
    if (tier === 2 && complexity >= 5) return 0.1;
    return 0;
  }
  
  private calculateConfidence(scores: any, analysis: QueryAnalysis): number {
    // Base confidence on how well the agent matches
    const avgScore = Object.values(scores).reduce((sum: number, score: any) => 
      sum + (score as number), 0
    ) / Object.values(scores).length;
    
    // Adjust for query complexity
    const complexityFactor = 1 - (analysis.complexity.score / 20);
    
    return avgScore * complexityFactor;
  }
  
  private generateReasoning(agent: Agent, analysis: QueryAnalysis, scores: any): string[] {
    const reasoning = [];
    
    if (scores.domainMatch > 0.8) {
      reasoning.push(`Strong expertise in ${analysis.domain.primary}`);
    }
    
    if (scores.capabilityMatch > 0.7) {
      reasoning.push(`Matches ${Math.round(scores.capabilityMatch * 100)}% of required capabilities`);
    }
    
    if (scores.complexityFit > 0.8) {
      reasoning.push(`Tier ${agent.tier || 1} agent well-suited for complexity level ${analysis.complexity.score}`);
    }
    
    if (scores.historicalPerformance > 0.8) {
      reasoning.push(`Excellent track record with similar queries`);
    }
    
    if (agent.rag_enabled && analysis.complexity.score > 5) {
      reasoning.push(`RAG-enabled for comprehensive knowledge retrieval`);
    }
    
    // Add specific capability matches
    const matchedCaps = this.matchedCapabilities(agent, analysis);
    if (matchedCaps.length > 0) {
      reasoning.push(`Key capabilities: ${matchedCaps.slice(0, 3).join(', ')}`);
    }
    
    return reasoning;
  }
  
  private matchedCapabilities(agent: Agent, analysis: QueryAnalysis): string[] {
    if (!agent.capabilities || !analysis.requiredCapabilities) {
      return [];
    }
    
    return agent.capabilities.filter(cap => 
      analysis.requiredCapabilities.includes(cap)
    );
  }
  
  private loadPerformanceHistory() {
    // Load from database or cache
    // This is a placeholder implementation
    this.performanceHistory = new Map();
  }
}

interface AgentPerformance {
  agentId: string;
  totalQueries: number;
  successRate: number;
  avgResponseTime: number;
  avgRating: number;
  queries: QueryPerformance[];
}

interface QueryPerformance {
  queryId: string;
  domain: string;
  complexity: number;
  success: boolean;
  responseTime: number;
  rating?: number;
  timestamp: Date;
}

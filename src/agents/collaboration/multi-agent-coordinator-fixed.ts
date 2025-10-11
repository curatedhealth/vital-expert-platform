/**
 * Multi-Agent Coordinator
 * Manages coordination strategies and communication between agents
 */

import { agentConflictResolver } from '../core/conflict-resolver';
import { DigitalHealthAgent } from '../core/DigitalHealthAgent';

// Response type for multi-agent coordination
interface CoordinationAgentResponse {
  id: string;
  agentId: string;
  content: string;
  confidence: number;
  metadata: {
    agentName: string;
    capabilities: string[];
    responseTime: number;
  };
  timestamp: Date;
}

export interface CoordinationStrategy {
  name: 'sequential' | 'parallel' | 'hierarchical' | 'consensus' | 'adaptive';
  description: string;
  execute: (agents: DigitalHealthAgent[], query: string, context: any) => Promise<CoordinationResult>;
  requirements: {
    minAgents: number;
    maxAgents: number;
    capabilities: string[];
  };
}

export interface AgentInfo {
  id: string;
  name: string;
  capabilities: string[];
  tier: number;
  specialization: string[];
  performance: {
    accuracy: number;
    responseTime: number;
    reliability: number;
  };
  status: 'available' | 'busy' | 'offline';
}

export interface CoordinationResult {
  strategy: string;
  responses: CoordinationAgentResponse[];
  conflicts: any[];
  resolutions: any[];
  finalResponse: CoordinationAgentResponse;
  performance: {
    totalTime: number;
    coordinationTime: number;
    conflictResolutionTime: number;
    synthesisTime: number;
  };
  metadata: {
    participatingAgents: string[];
    coordinationOverhead: number;
    qualityScore: number;
    confidence: number;
    timestamp: Date;
  };
}

export class MultiAgentCoordinator {
  private strategies: Map<string, CoordinationStrategy> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();
  private conflictHistory: any[] = [];

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // Sequential Strategy
    this.strategies.set('sequential', {
      name: 'sequential',
      description: 'Execute agents one after another, passing context between them',
      execute: this.executeSequentialStrategy.bind(this),
      requirements: {
        minAgents: 1,
        maxAgents: 5,
        capabilities: ['context_passing', 'sequential_processing']
      }
    });

    // Parallel Strategy
    this.strategies.set('parallel', {
      name: 'parallel',
      description: 'Execute all agents simultaneously and synthesize results',
      execute: this.executeParallelStrategy.bind(this),
      requirements: {
        minAgents: 2,
        maxAgents: 10,
        capabilities: ['parallel_processing', 'result_synthesis']
      }
    });

    // Hierarchical Strategy
    this.strategies.set('hierarchical', {
      name: 'hierarchical',
      description: 'Master agent coordinates specialist agents',
      execute: this.executeHierarchicalStrategy.bind(this),
      requirements: {
        minAgents: 3,
        maxAgents: 15,
        capabilities: ['hierarchical_coordination', 'specialization']
      }
    });

    // Consensus Strategy
    this.strategies.set('consensus', {
      name: 'consensus',
      description: 'All agents vote on the best response',
      execute: this.executeConsensusStrategy.bind(this),
      requirements: {
        minAgents: 3,
        maxAgents: 20,
        capabilities: ['voting', 'consensus_building']
      }
    });

    // Adaptive Strategy
    this.strategies.set('adaptive', {
      name: 'adaptive',
      description: 'Dynamically select the best strategy based on context',
      execute: this.executeAdaptiveStrategy.bind(this),
      requirements: {
        minAgents: 1,
        maxAgents: 25,
        capabilities: ['adaptive_planning', 'strategy_selection']
      }
    });
  }

  async coordinate(
    agents: DigitalHealthAgent[],
    query: string,
    context: any,
    strategyName?: string
  ): Promise<CoordinationResult> {
    const startTime = Date.now();
    
    try {
      // Validate agents
      if (!agents || agents.length === 0) {
        throw new Error('No agents provided for coordination');
      }

      // Select strategy
      const strategy = strategyName 
        ? this.strategies.get(strategyName)
        : this.selectOptimalStrategy(agents, query, context);

      if (!strategy) {
        throw new Error(`Strategy ${strategyName || 'optimal'} not found or not suitable`);
      }

      // Validate strategy requirements
      if (!this.validateStrategyRequirements(agents, strategy)) {
        throw new Error(`Strategy ${strategy.name} requirements not met`);
      }

      // Execute strategy
      const result = await strategy.execute(agents, query, context);
      
      // Record performance metrics
      const totalTime = Date.now() - startTime;
      this.recordPerformanceMetrics(strategy.name, totalTime);
      
      // Update result with performance data
      result.performance.totalTime = totalTime;
      result.metadata.timestamp = new Date();
      
      return result;
      
    } catch (error) {
      console.error('❌ Multi-agent coordination failed:', error);
      throw error;
    }
  }

  private validateStrategyRequirements(agents: DigitalHealthAgent[], strategy: CoordinationStrategy): boolean {
    const { minAgents, maxAgents, capabilities } = strategy.requirements;
    
    // Check agent count
    if (agents.length < minAgents || agents.length > maxAgents) {
      return false;
    }
    
    // Check capabilities
    if (capabilities.length > 0) {
      return this.hasRequiredCapabilities(agents, capabilities);
    }
    
    return true;
  }

  private selectOptimalStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): CoordinationStrategy | null {
    const availableStrategies = Array.from(this.strategies.values())
      .filter(strategy => this.validateStrategyRequirements(agents, strategy));
    
    if (availableStrategies.length === 0) {
      return null;
    }
    
    // Simple strategy selection based on agent count and query complexity
    const agentCount = agents.length;
    const queryComplexity = this.analyzeQueryComplexity(query);
    
    if (agentCount === 1) {
      return availableStrategies.find(s => s.name === 'sequential') || availableStrategies[0];
    } else if (agentCount <= 3 && queryComplexity < 0.5) {
      return availableStrategies.find(s => s.name === 'parallel') || availableStrategies[0];
    } else if (agentCount <= 5 && queryComplexity >= 0.5) {
      return availableStrategies.find(s => s.name === 'hierarchical') || availableStrategies[0];
    } else if (agentCount > 5) {
      return availableStrategies.find(s => s.name === 'consensus') || availableStrategies[0];
    }
    
    return availableStrategies[0];
  }

  private analyzeQueryComplexity(query: string): number {
    // Simple complexity analysis based on query length and keywords
    const length = query.length;
    const keywordCount = (query.match(/\b(and|or|but|however|therefore|because|although|unless|if|when|where|why|how|what|who|which)\b/gi) || []).length;
    
    return Math.min(1, (length / 1000) + (keywordCount * 0.2));
  }

  // Strategy Implementations
  private async executeSequentialStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    const startTime = Date.now();
    const responses: CoordinationAgentResponse[] = [];
    let currentContext = { ...context };
    
    for (const agent of agents) {
      try {
        console.log(`🔄 Executing agent: ${agent.getStatus().name}`);
        
        const response = await this.executeAgent(agent, query, currentContext);
        responses.push(response);
        
        // Update context with response
        currentContext = this.updateContextWithResponse(currentContext, response);
        
      } catch (error) {
        console.error(`❌ Agent ${agent.getStatus().name} failed:`, error);
        // Continue with next agent
      }
    }
    
    const coordinationTime = Date.now() - startTime;
    const finalResponse = await this.synthesizeSequentialResponse(responses, []);
    
    return {
      strategy: 'sequential',
      responses,
      conflicts: [],
      resolutions: [],
      finalResponse,
      performance: {
        totalTime: coordinationTime,
        coordinationTime,
        conflictResolutionTime: 0,
        synthesisTime: 0
      },
      metadata: {
        participatingAgents: responses.map(r => r.agentId),
        coordinationOverhead: 0.1,
        qualityScore: this.calculateQualityScore(responses, finalResponse),
        confidence: finalResponse.confidence,
        timestamp: new Date()
      }
    };
  }

  private async executeParallelStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    const startTime = Date.now();
    
    // Execute all agents in parallel
    const agentPromises = agents.map(agent => 
      this.executeAgent(agent, query, context).catch(error => {
        console.error(`❌ Agent ${agent.getStatus().name} failed:`, error);
        return null;
      })
    );
    
    const responses = (await Promise.all(agentPromises)).filter(Boolean) as CoordinationAgentResponse[];
    const coordinationTime = Date.now() - startTime;
    
    // Detect and resolve conflicts
    const conflicts = await agentConflictResolver.detectConflicts(responses);
    const resolutions = await agentConflictResolver.resolveConflicts(conflicts, responses);
    
    // Synthesize final response
    const finalResponse = await this.synthesizeParallelResponse(responses, resolutions);
    
    return {
      strategy: 'parallel',
      responses,
      conflicts,
      resolutions,
      finalResponse,
      performance: {
        totalTime: coordinationTime,
        coordinationTime,
        conflictResolutionTime: 0,
        synthesisTime: 0
      },
      metadata: {
        participatingAgents: responses.map(r => r.agentId),
        coordinationOverhead: 0.05,
        qualityScore: this.calculateQualityScore(responses, finalResponse),
        confidence: finalResponse.confidence,
        timestamp: new Date()
      }
    };
  }

  private async executeHierarchicalStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    const startTime = Date.now();
    
    // Select master coordinator (first agent as fallback)
    const masterAgent = agents[0];
    
    // Group other agents by specialization
    const specialistGroups = this.groupAgentsBySpecialization(
      agents.filter(a => a.getStatus().name !== masterAgent.getStatus().name)
    );
    
    // Master agent coordinates specialists
    const coordinationResults = await Promise.all(
      specialistGroups.map(async (group) => {
        const groupResponses = await Promise.all(
          group.map(agent => 
            this.executeAgent(agent, query, context).catch(error => {
              console.error(`❌ Specialist ${agent.getStatus().name} failed:`, error);
              return null;
            })
          )
        );
        return groupResponses.filter(Boolean) as CoordinationAgentResponse[];
      })
    );
    
    // Flatten all responses
    const allResponses = coordinationResults.flat();
    
    // Master agent synthesizes results
    const masterResponse = await this.executeAgent(masterAgent, query, context);
    const finalResponse = await this.synthesizeHierarchicalResponse(
      masterResponse,
      allResponses,
      []
    );
    
    const coordinationTime = Date.now() - startTime;
    
    return {
      strategy: 'hierarchical',
      responses: [masterResponse, ...allResponses],
      conflicts: [],
      resolutions: [],
      finalResponse,
      performance: {
        totalTime: coordinationTime,
        coordinationTime,
        conflictResolutionTime: 0,
        synthesisTime: 0
      },
      metadata: {
        participatingAgents: [masterResponse.agentId, ...allResponses.map(r => r.agentId)],
        coordinationOverhead: 0.15,
        qualityScore: this.calculateQualityScore([masterResponse, ...allResponses], finalResponse),
        confidence: finalResponse.confidence,
        timestamp: new Date()
      }
    };
  }

  private async executeConsensusStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    const startTime = Date.now();
    
    // Execute all agents in parallel
    const agentPromises = agents.map(agent => 
      this.executeAgent(agent, query, context).catch(error => {
        console.error(`❌ Agent ${agent.getStatus().name} failed:`, error);
        return null;
      })
    );
    
    const responses = (await Promise.all(agentPromises)).filter(Boolean) as CoordinationAgentResponse[];
    const coordinationTime = Date.now() - startTime;
    
    // Build consensus
    const consensusResponse = await this.buildConsensus(responses, query, context);
    
    // Detect and resolve conflicts
    const conflicts = await agentConflictResolver.detectConflicts(responses);
    const resolutions = await agentConflictResolver.resolveConflicts(conflicts, responses);
    
    // Synthesize final response
    const finalResponse = await this.synthesizeConsensusResponse(
      responses,
      consensusResponse,
      resolutions
    );
    
    return {
      strategy: 'consensus',
      responses,
      conflicts,
      resolutions,
      finalResponse,
      performance: {
        totalTime: coordinationTime,
        coordinationTime,
        conflictResolutionTime: 0,
        synthesisTime: 0
      },
      metadata: {
        participatingAgents: responses.map(r => r.agentId),
        coordinationOverhead: 0.2,
        qualityScore: this.calculateQualityScore(responses, finalResponse),
        confidence: finalResponse.confidence,
        timestamp: new Date()
      }
    };
  }

  private async executeAdaptiveStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    // Analyze context and select best strategy dynamically
    const contextAnalysis = this.analyzeContext(context);
    const queryAnalysis = this.analyzeQuery(query);
    const agentAnalysis = this.analyzeAgents(agents);
    
    // Select strategy based on analysis
    const strategyScore = this.calculateStrategyScore(
      contextAnalysis,
      queryAnalysis,
      agentAnalysis
    );
    
    const selectedStrategy = this.strategies.get(strategyScore.bestStrategy);
    
    if (!selectedStrategy) {
      throw new Error('No suitable strategy found for adaptive coordination');
    }
    
    // Execute selected strategy
    return selectedStrategy.execute(agents, query, context);
  }

  // Helper methods
  private hasRequiredCapabilities(agents: DigitalHealthAgent[], requiredCapabilities: string[]): boolean {
    const availableCapabilities = new Set(
      agents.flatMap(agent => agent.getCapabilities())
    );
    
    return requiredCapabilities.every(capability => 
      availableCapabilities.has(capability)
    );
  }

  private analyzeContext(context: any): any {
    // Analyze context complexity and requirements
    return {
      complexity: Object.keys(context).length,
      hasPreviousResponses: !!(context.previousResponses && context.previousResponses.length > 0),
      hasConflicts: !!(context.conflicts && context.conflicts.length > 0),
      urgency: context.urgency || 'normal'
    };
  }

  private analyzeQuery(query: string): any {
    // Analyze query characteristics
    return {
      length: query.length,
      complexity: this.analyzeQueryComplexity(query),
      hasMultipleQuestions: (query.match(/\?/g) || []).length > 1,
      requiresSpecialization: this.requiresSpecialization(query)
    };
  }

  private analyzeAgents(agents: DigitalHealthAgent[]): any {
    // Analyze agent capabilities and performance
    const capabilities = this.analyzeAgentCapabilities(agents);
    
    return {
      count: agents.length,
      capabilities: Array.from(capabilities),
      averageTier: agents.reduce((sum, agent) => sum + agent.config.tier, 0) / agents.length,
      specialization: agents.map(agent => agent.config.specialization)
    };
  }

  private requiresSpecialization(query: string): boolean {
    const specializationKeywords = [
      'medical', 'clinical', 'diagnosis', 'treatment', 'patient',
      'drug', 'medication', 'therapy', 'surgery', 'procedure'
    ];
    
    return specializationKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private calculateStrategyScore(contextAnalysis: any, queryAnalysis: any, agentAnalysis: any): any {
    const strategies = Array.from(this.strategies.values());
    const scores = strategies.map(strategy => ({
      strategy: strategy.name,
      score: this.calculateStrategyRelevance(strategy, contextAnalysis, queryAnalysis, agentAnalysis)
    }));
    
    scores.sort((a, b) => b.score - a.score);
    
    return {
      bestStrategy: scores[0].strategy,
      scores
    };
  }

  private calculateStrategyRelevance(strategy: CoordinationStrategy, contextAnalysis: any, queryAnalysis: any, agentAnalysis: any): number {
    let score = 0;
    
    // Base score
    score += 0.3;
    
    // Context-based scoring
    if (strategy.name === 'sequential' && contextAnalysis.hasPreviousResponses) {
      score += 0.2;
    }
    
    if (strategy.name === 'parallel' && !contextAnalysis.hasConflicts) {
      score += 0.2;
    }
    
    if (strategy.name === 'hierarchical' && queryAnalysis.requiresSpecialization) {
      score += 0.3;
    }
    
    if (strategy.name === 'consensus' && agentAnalysis.count > 5) {
      score += 0.2;
    }
    
    // Query-based scoring
    if (queryAnalysis.complexity > 0.7 && strategy.name === 'hierarchical') {
      score += 0.2;
    }
    
    if (queryAnalysis.hasMultipleQuestions && strategy.name === 'parallel') {
      score += 0.1;
    }
    
    // Agent-based scoring
    if (agentAnalysis.count >= strategy.requirements.minAgents && 
        agentAnalysis.count <= strategy.requirements.maxAgents) {
      score += 0.2;
    }
    
    return Math.min(1, score);
  }

  private analyzeAgentCapabilities(agents: DigitalHealthAgent[]): Set<string> {
    return new Set(agents.flatMap(agent => agent.getCapabilities()));
  }

  private sortAgentsByRelevance(agents: DigitalHealthAgent[], query: string): DigitalHealthAgent[] {
    return agents.sort((a, b) => {
      // Sort by tier first (lower tier = higher priority)
      if (a.config.tier !== b.config.tier) return a.config.tier - b.config.tier;
      
      // Then by specialization relevance
      const aRelevance = this.calculateSpecializationRelevance(a, query);
      const bRelevance = this.calculateSpecializationRelevance(b, query);
      
      return bRelevance - aRelevance;
    });
  }

  private calculateSpecializationRelevance(agent: DigitalHealthAgent, query: string): number {
    const queryLower = query.toLowerCase();
    return agent.getCapabilities().reduce((score, spec) => {
      const specLower = spec.toLowerCase();
      if (queryLower.includes(specLower)) {
        return score + 1;
      }
      return score;
    }, 0);
  }

  private async executeAgent(agent: DigitalHealthAgent, query: string, context: any): Promise<CoordinationAgentResponse> {
    const startTime = Date.now();
    
    // In production, this would call the actual agent service
    return {
      id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId: agent.getStatus().name,
      content: `Response from ${agent.getStatus().name} for query: ${query.substring(0, 50)}...`,
      confidence: agent.config.confidence || 0.8,
      metadata: {
        agentName: agent.getStatus().name,
        capabilities: agent.getCapabilities(),
        responseTime: Date.now() - startTime
      },
      timestamp: new Date()
    };
  }

  private updateContextWithResponse(context: any, response: CoordinationAgentResponse): any {
    return {
      ...context,
      previousResponses: [...(context.previousResponses || []), response],
      lastAgentId: response.agentId
    };
  }

  private groupAgentsBySpecialization(agents: DigitalHealthAgent[]): DigitalHealthAgent[][] {
    const groups: Map<string, DigitalHealthAgent[]> = new Map();
    
    agents.forEach(agent => {
      agent.getCapabilities().forEach(spec => {
        if (!groups.has(spec)) {
          groups.set(spec, []);
        }
        groups.get(spec)!.push(agent);
      });
    });
    
    return Array.from(groups.values());
  }

  private async buildConsensus(responses: CoordinationAgentResponse[], query: string, context: any): Promise<CoordinationAgentResponse> {
    // Simple consensus building - in production, this would be more sophisticated
    const consensusContent = responses
      .map(r => r.content)
      .join('\n\n---\n\n');
    
    const averageConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    
    return {
      id: `consensus-${Date.now()}`,
      agentId: 'consensus',
      content: `Consensus Response:\n\n${consensusContent}`,
      confidence: averageConfidence,
      metadata: {
        agentName: 'Consensus Builder',
        capabilities: ['consensus_building'],
        responseTime: 0
      },
      timestamp: new Date()
    };
  }

  private async synthesizeSequentialResponse(responses: CoordinationAgentResponse[], resolutions: any[]): Promise<CoordinationAgentResponse> {
    // Synthesize responses from sequential execution
    const synthesizedContent = responses
      .map((r, index) => `Step ${index + 1} (${r.metadata.agentName}): ${r.content}`)
      .join('\n\n');
    
    const averageConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    
    return {
      id: `synthesized-${Date.now()}`,
      agentId: 'synthesizer',
      content: `Sequential Synthesis:\n\n${synthesizedContent}`,
      confidence: averageConfidence,
      metadata: {
        agentName: 'Sequential Synthesizer',
        capabilities: ['sequential_synthesis'],
        responseTime: 0
      },
      timestamp: new Date()
    };
  }

  private async synthesizeParallelResponse(responses: CoordinationAgentResponse[], resolutions: any[]): Promise<CoordinationAgentResponse> {
    // Synthesize responses from parallel execution
    const synthesizedContent = responses
      .map(r => `${r.metadata.agentName}: ${r.content}`)
      .join('\n\n');
    
    const averageConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    
    return {
      id: `synthesized-${Date.now()}`,
      agentId: 'synthesizer',
      content: `Parallel Synthesis:\n\n${synthesizedContent}`,
      confidence: averageConfidence,
      metadata: {
        agentName: 'Parallel Synthesizer',
        capabilities: ['parallel_synthesis'],
        responseTime: 0
      },
      timestamp: new Date()
    };
  }

  private async synthesizeHierarchicalResponse(
    masterResponse: CoordinationAgentResponse,
    specialistResponses: CoordinationAgentResponse[],
    resolutions: any[]
  ): Promise<CoordinationAgentResponse> {
    // Synthesize master and specialist responses
    const specialistContent = specialistResponses
      .map(r => `${r.metadata.agentName}: ${r.content}`)
      .join('\n\n');
    
    const synthesizedContent = `Master Response (${masterResponse.metadata.agentName}):\n${masterResponse.content}\n\nSpecialist Responses:\n${specialistContent}`;
    
    const allResponses = [masterResponse, ...specialistResponses];
    const averageConfidence = allResponses.reduce((sum, r) => sum + r.confidence, 0) / allResponses.length;
    
    return {
      id: `synthesized-${Date.now()}`,
      agentId: 'synthesizer',
      content: `Hierarchical Synthesis:\n\n${synthesizedContent}`,
      confidence: averageConfidence,
      metadata: {
        agentName: 'Hierarchical Synthesizer',
        capabilities: ['hierarchical_synthesis'],
        responseTime: 0
      },
      timestamp: new Date()
    };
  }

  private async synthesizeConsensusResponse(
    responses: CoordinationAgentResponse[],
    consensusResponse: CoordinationAgentResponse,
    resolutions: any[]
  ): Promise<CoordinationAgentResponse> {
    // Synthesize consensus response
    const synthesizedContent = `Consensus Response:\n${consensusResponse.content}\n\nIndividual Responses:\n${responses.map(r => `${r.metadata.agentName}: ${r.content}`).join('\n\n')}`;
    
    const averageConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    
    return {
      id: `synthesized-${Date.now()}`,
      agentId: 'synthesizer',
      content: `Consensus Synthesis:\n\n${synthesizedContent}`,
      confidence: averageConfidence,
      metadata: {
        agentName: 'Consensus Synthesizer',
        capabilities: ['consensus_synthesis'],
        responseTime: 0
      },
      timestamp: new Date()
    };
  }

  private calculateQualityScore(responses: CoordinationAgentResponse[], finalResponse: CoordinationAgentResponse): number {
    // Simple quality score calculation
    const responseCount = responses.length;
    const averageConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responseCount;
    const contentLength = finalResponse.content.length;
    
    // Normalize score between 0 and 1
    const score = (averageConfidence * 0.6) + (Math.min(1, contentLength / 1000) * 0.4);
    
    return Math.min(1, score);
  }

  private recordPerformanceMetrics(strategy: string, time: number): void {
    if (!this.performanceMetrics.has(strategy)) {
      this.performanceMetrics.set(strategy, []);
    }
    
    const metrics = this.performanceMetrics.get(strategy)!;
    metrics.push(time);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  // Public methods for monitoring and debugging
  getPerformanceMetrics(): Map<string, number[]> {
    return new Map(this.performanceMetrics);
  }

  getConflictHistory(): any[] {
    return [...this.conflictHistory];
  }

  getAvailableStrategies(): CoordinationStrategy[] {
    return Array.from(this.strategies.values());
  }
}

// Export singleton instance
export const multiAgentCoordinator = new MultiAgentCoordinator();

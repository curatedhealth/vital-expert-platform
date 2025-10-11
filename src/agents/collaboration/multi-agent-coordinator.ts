/**
 * Multi-Agent Coordinator
 * Manages coordination strategies and communication between agents
 */

import type { AgentResponse } from '@/types/agent.types';
import { agentConflictResolver } from '../core/conflict-resolver';
import { DigitalHealthAgent } from '../core/DigitalHealthAgent';

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
  responses: AgentResponse[];
  conflicts: any[];
  resolutions: any[];
  finalResponse: AgentResponse;
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
  };
}

export interface CommunicationProtocol {
  type: 'broadcast' | 'point_to_point' | 'hierarchical' | 'consensus';
  messageFormat: 'json' | 'xml' | 'protobuf';
  compression: boolean;
  encryption: boolean;
  timeout: number;
}

export class MultiAgentCoordinator {
  private strategies: Map<string, CoordinationStrategy> = new Map();
  private communicationProtocol: CommunicationProtocol;
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor() {
    this.initializeStrategies();
    this.communicationProtocol = {
      type: 'consensus',
      messageFormat: 'json',
      compression: true,
      encryption: true,
      timeout: 30000
    };
  }

  /**
   * Initialize coordination strategies
   */
  private initializeStrategies(): void {
    // Sequential Strategy
    this.strategies.set('sequential', {
      name: 'sequential',
      description: 'Agents execute one after another, building on previous results',
      execute: this.executeSequentialStrategy.bind(this),
      requirements: {
        minAgents: 2,
        maxAgents: 5,
        capabilities: ['analysis', 'synthesis']
      }
    });

    // Parallel Strategy
    this.strategies.set('parallel', {
      name: 'parallel',
      description: 'All agents execute simultaneously and results are synthesized',
      execute: this.executeParallelStrategy.bind(this),
      requirements: {
        minAgents: 2,
        maxAgents: 10,
        capabilities: ['analysis']
      }
    });

    // Hierarchical Strategy
    this.strategies.set('hierarchical', {
      name: 'hierarchical',
      description: 'Agents organized in hierarchy with master coordinator',
      execute: this.executeHierarchicalStrategy.bind(this),
      requirements: {
        minAgents: 3,
        maxAgents: 15,
        capabilities: ['coordination', 'analysis', 'synthesis']
      }
    });

    // Consensus Strategy
    this.strategies.set('consensus', {
      name: 'consensus',
      description: 'Agents work together to reach consensus on response',
      execute: this.executeConsensusStrategy.bind(this),
      requirements: {
        minAgents: 3,
        maxAgents: 8,
        capabilities: ['analysis', 'reasoning', 'consensus']
      }
    });

    // Adaptive Strategy
    this.strategies.set('adaptive', {
      name: 'adaptive',
      description: 'Strategy adapts based on query complexity and agent availability',
      execute: this.executeAdaptiveStrategy.bind(this),
      requirements: {
        minAgents: 2,
        maxAgents: 20,
        capabilities: ['analysis', 'adaptation']
      }
    });
  }

  /**
   * Coordinate multiple agents
   */
  async coordinate(
    agents: AgentInfo[],
    query: string,
    context: any,
    strategyName?: string
  ): Promise<CoordinationResult> {
    const startTime = Date.now();
    
    try {
      // Select appropriate strategy
      const strategy = strategyName 
        ? this.strategies.get(strategyName)
        : this.selectOptimalStrategy(agents, query, context);

      if (!strategy) {
        throw new Error(`No suitable coordination strategy found`);
      }

      console.log(`🤝 Coordinating ${agents.length} agents using ${strategy.name} strategy`);

      // Execute coordination strategy
      const result = await strategy.execute(agents, query, context);
      
      // Record performance metrics
      this.recordPerformanceMetrics(strategy.name, Date.now() - startTime);

      return result;
    } catch (error) {
      console.error('❌ Multi-agent coordination failed:', error);
      throw error;
    }
  }

  /**
   * Select optimal strategy based on agents and query
   */
  private selectOptimalStrategy(
    agents: AgentInfo[],
    query: string,
    context: any
  ): CoordinationStrategy | null {
    const availableStrategies = Array.from(this.strategies.values())
      .filter(strategy => 
        agents.length >= strategy.requirements.minAgents &&
        agents.length <= strategy.requirements.maxAgents &&
        this.hasRequiredCapabilities(agents, strategy.requirements.capabilities)
      );

    if (availableStrategies.length === 0) {
      return null;
    }

    // Score strategies based on query complexity and agent capabilities
    const scoredStrategies = availableStrategies.map(strategy => ({
      strategy,
      score: this.calculateStrategyScore(strategy, agents, query, context)
    }));

    // Return highest scoring strategy
    return scoredStrategies
      .sort((a, b) => b.score - a.score)[0]
      .strategy;
  }

  /**
   * Execute sequential coordination strategy
   */
  private   async executeSequentialStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    const startTime = Date.now();
    const responses: AgentResponse[] = [];
    let currentContext = { ...context };

    // Sort agents by tier and specialization relevance
    const sortedAgents = this.sortAgentsByRelevance(agents, query);

    for (const agent of sortedAgents) {
      try {
        console.log(`🔄 Executing agent: ${agent.name}`);
        
        // Execute agent with current context
        const response = await this.executeAgent(agent, query, currentContext);
        responses.push(response);

        // Update context with agent's response
        currentContext = this.updateContextWithResponse(currentContext, response);

        // Add delay between agents for context processing
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Agent ${agent.name} failed:`, error);
        // Continue with next agent
      }
    }

    // Detect and resolve conflicts
    const conflicts = agentConflictResolver.detectConflicts(
      agents,
      responses,
      query,
      context
    );
    const resolutions = await agentConflictResolver.resolveConflicts(conflicts);

    // Synthesize final response
    const finalResponse = await this.synthesizeSequentialResponse(responses, resolutions);

    return {
      strategy: 'sequential',
      responses,
      conflicts,
      resolutions,
      finalResponse,
      performance: {
        totalTime: Date.now() - startTime,
        coordinationTime: Date.now() - startTime,
        conflictResolutionTime: 0, // Conflicts resolved during synthesis
        synthesisTime: 0
      },
      metadata: {
        participatingAgents: agents.map(a => a.id),
        coordinationOverhead: 0.1, // 10% overhead for sequential
        qualityScore: this.calculateQualityScore(responses, finalResponse)
      }
    };
  }

  /**
   * Execute parallel coordination strategy
   */
  private   async executeParallelStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    const startTime = Date.now();

    // Execute all agents in parallel
    const agentPromises = agents.map(agent => 
      this.executeAgent(agent, query, context).catch(error => {
        console.error(`❌ Agent ${agent.name} failed:`, error);
        return null;
      })
    );

    const responses = (await Promise.all(agentPromises)).filter(Boolean) as AgentResponse[];

    // Detect and resolve conflicts
    const conflictStartTime = Date.now();
    const conflicts = agentConflictResolver.detectConflicts(
      agents,
      responses,
      query,
      context
    );
    const resolutions = await agentConflictResolver.resolveConflicts(conflicts);
    const conflictResolutionTime = Date.now() - conflictStartTime;

    // Synthesize final response
    const synthesisStartTime = Date.now();
    const finalResponse = await this.synthesizeParallelResponse(responses, resolutions);
    const synthesisTime = Date.now() - synthesisStartTime;

    return {
      strategy: 'parallel',
      responses,
      conflicts,
      resolutions,
      finalResponse,
      performance: {
        totalTime: Date.now() - startTime,
        coordinationTime: 0, // No coordination overhead for parallel
        conflictResolutionTime,
        synthesisTime
      },
      metadata: {
        participatingAgents: agents.map(a => a.id),
        coordinationOverhead: 0.05, // 5% overhead for parallel
        qualityScore: this.calculateQualityScore(responses, finalResponse)
      }
    };
  }

  /**
   * Execute hierarchical coordination strategy
   */
  private   async executeHierarchicalStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    const startTime = Date.now();

    // Select master coordinator (highest tier agent)
    const masterAgent = agents.reduce((master, agent) => 
      agent.tier < master.tier ? agent : master
    );

    // Group other agents by specialization
    const specialistGroups = this.groupAgentsBySpecialization(
      agents.filter(a => a.id !== masterAgent.id)
    );

    // Master agent coordinates specialists
    const coordinationResults = await Promise.all(
      specialistGroups.map(async (group) => {
        const groupResponses = await Promise.all(
          group.map(agent => 
            this.executeAgent(agent, query, context).catch(error => {
              console.error(`❌ Specialist ${agent.name} failed:`, error);
              return null;
            })
          )
        );
        return groupResponses.filter(Boolean) as AgentResponse[];
      })
    );

    const allResponses = coordinationResults.flat();
    const masterResponse = await this.executeAgent(masterAgent, query, {
      ...context,
      specialistResponses: allResponses
    });

    const responses = [...allResponses, masterResponse];

    // Detect and resolve conflicts
    const conflicts = agentConflictResolver.detectConflicts(
      agents,
      responses,
      query,
      context
    );
    const resolutions = await agentConflictResolver.resolveConflicts(conflicts);

    // Master agent synthesizes final response
    const finalResponse = await this.synthesizeHierarchicalResponse(
      masterResponse,
      allResponses,
      resolutions
    );

    return {
      strategy: 'hierarchical',
      responses,
      conflicts,
      resolutions,
      finalResponse,
      performance: {
        totalTime: Date.now() - startTime,
        coordinationTime: Date.now() - startTime,
        conflictResolutionTime: 0,
        synthesisTime: 0
      },
      metadata: {
        participatingAgents: agents.map(a => a.id),
        coordinationOverhead: 0.15, // 15% overhead for hierarchical
        qualityScore: this.calculateQualityScore(responses, finalResponse)
      }
    };
  }

  /**
   * Execute consensus coordination strategy
   */
  private   async executeConsensusStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    const startTime = Date.now();

    // All agents work on the same query
    const responses = await Promise.all(
      agents.map(agent => 
        this.executeAgent(agent, query, context).catch(error => {
          console.error(`❌ Agent ${agent.name} failed:`, error);
          return null;
        })
      )
    );

    const validResponses = responses.filter(Boolean) as AgentResponse[];

    // Build consensus through iterative refinement
    let consensusResponse = await this.buildConsensus(validResponses, query, context);

    // Detect and resolve any remaining conflicts
    const conflicts = agentConflictResolver.detectConflicts(
      agents,
      validResponses,
      query,
      context
    );
    const resolutions = await agentConflictResolver.resolveConflicts(conflicts);

    // Final consensus synthesis
    const finalResponse = await this.synthesizeConsensusResponse(
      validResponses,
      consensusResponse,
      resolutions
    );

    return {
      strategy: 'consensus',
      responses: validResponses,
      conflicts,
      resolutions,
      finalResponse,
      performance: {
        totalTime: Date.now() - startTime,
        coordinationTime: Date.now() - startTime,
        conflictResolutionTime: 0,
        synthesisTime: 0
      },
      metadata: {
        participatingAgents: agents.map(a => a.id),
        coordinationOverhead: 0.2, // 20% overhead for consensus
        qualityScore: this.calculateQualityScore(validResponses, finalResponse)
      }
    };
  }

  /**
   * Execute adaptive coordination strategy
   */
  private   async executeAdaptiveStrategy(
    agents: DigitalHealthAgent[],
    query: string,
    context: any
  ): Promise<CoordinationResult> {
    const startTime = Date.now();

    // Analyze query complexity and agent capabilities
    const queryComplexity = this.analyzeQueryComplexity(query);
    const agentCapabilities = this.analyzeAgentCapabilities(agents);

    // Select strategy based on analysis
    let selectedStrategy: CoordinationStrategy;
    
    if (queryComplexity < 0.3 && agents.length <= 3) {
      selectedStrategy = this.strategies.get('parallel')!;
    } else if (queryComplexity > 0.7 && agentCapabilities.has('consensus')) {
      selectedStrategy = this.strategies.get('consensus')!;
    } else if (agents.length > 5 && agentCapabilities.has('coordination')) {
      selectedStrategy = this.strategies.get('hierarchical')!;
    } else {
      selectedStrategy = this.strategies.get('sequential')!;
    }

    console.log(`🔄 Adaptive strategy selected: ${selectedStrategy.name}`);

    // Execute selected strategy
    return selectedStrategy.execute(agents, query, context);
  }

  // Helper methods
  private hasRequiredCapabilities(agents: AgentInfo[], requiredCapabilities: string[]): boolean {
    const availableCapabilities = new Set(
      agents.flatMap(agent => agent.capabilities)
    );
    
    return requiredCapabilities.every(capability => 
      availableCapabilities.has(capability)
    );
  }

  private calculateStrategyScore(
    strategy: CoordinationStrategy,
    agents: AgentInfo[],
    query: string,
    context: any
  ): number {
    let score = 0;

    // Base score from strategy requirements match
    const capabilityMatch = this.hasRequiredCapabilities(agents, strategy.requirements.capabilities);
    score += capabilityMatch ? 50 : 0;

    // Agent count optimization
    const agentCount = agents.length;
    const optimalCount = (strategy.requirements.minAgents + strategy.requirements.maxAgents) / 2;
    const countScore = 30 - Math.abs(agentCount - optimalCount) * 2;
    score += Math.max(0, countScore);

    // Query complexity match
    const queryComplexity = this.analyzeQueryComplexity(query);
    if (strategy.name === 'consensus' && queryComplexity > 0.7) score += 20;
    if (strategy.name === 'parallel' && queryComplexity < 0.3) score += 20;

    return score;
  }

  private analyzeQueryComplexity(query: string): number {
    // Simple complexity analysis based on query length and keywords
    const length = query.length;
    const keywords = ['analyze', 'compare', 'evaluate', 'synthesize', 'complex', 'multiple'];
    const keywordCount = keywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    ).length;

    return Math.min(1, (length / 1000) + (keywordCount * 0.2));
  }

  private analyzeAgentCapabilities(agents: AgentInfo[]): Set<string> {
    return new Set(agents.flatMap(agent => agent.capabilities));
  }

  private sortAgentsByRelevance(agents: AgentInfo[], query: string): AgentInfo[] {
    return agents.sort((a, b) => {
      // Sort by tier first (lower tier = higher priority)
      if (a.tier !== b.tier) return a.tier - b.tier;
      
      // Then by specialization relevance
      const aRelevance = this.calculateSpecializationRelevance(a, query);
      const bRelevance = this.calculateSpecializationRelevance(b, query);
      
      return bRelevance - aRelevance;
    });
  }

  private calculateSpecializationRelevance(agent: AgentInfo, query: string): number {
    const queryLower = query.toLowerCase();
    return agent.specialization.reduce((score, spec) => {
      if (queryLower.includes(spec.toLowerCase())) {
        return score + 1;
      }
      return score;
    }, 0);
  }

  private async executeAgent(agent: DigitalHealthAgent, query: string, context: any): Promise<AgentResponse> {
    // Simulate agent execution
    // In production, this would call the actual agent service
    return {
      id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId: agent.id,
      content: `Response from ${agent.name} for query: ${query.substring(0, 50)}...`,
      confidence: agent.config.confidence || 0.8,
      metadata: {
        agentName: agent.name,
        capabilities: agent.capabilities,
        responseTime: agent.performance.responseTime
      },
      timestamp: new Date()
    };
  }

  private updateContextWithResponse(context: any, response: AgentResponse): any {
    return {
      ...context,
      previousResponses: [...(context.previousResponses || []), response],
      lastAgentId: response.agentId
    };
  }

  private groupAgentsBySpecialization(agents: AgentInfo[]): AgentInfo[][] {
    const groups: Map<string, AgentInfo[]> = new Map();
    
    agents.forEach(agent => {
      agent.specialization.forEach(spec => {
        if (!groups.has(spec)) {
          groups.set(spec, []);
        }
        groups.get(spec)!.push(agent);
      });
    });

    return Array.from(groups.values());
  }

  private async buildConsensus(responses: AgentResponse[], query: string, context: any): Promise<AgentResponse> {
    // Simple consensus building - in production, this would be more sophisticated
    const consensusContent = responses
      .map(r => r.content)
      .join('\n\n---\n\n');

    return {
      id: `consensus-${Date.now()}`,
      agentId: 'consensus-builder',
      content: `Consensus Response:\n\n${consensusContent}`,
      confidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
      metadata: {
        consensusType: 'iterative',
        participantCount: responses.length
      },
      timestamp: new Date()
    };
  }

  private async synthesizeSequentialResponse(responses: AgentResponse[], resolutions: any[]): Promise<AgentResponse> {
    // Synthesize responses from sequential execution
    const content = responses
      .map((r, i) => `Step ${i + 1} (${r.metadata?.agentName}): ${r.content}`)
      .join('\n\n');

    return {
      id: `synthesized-sequential-${Date.now()}`,
      agentId: 'sequential-synthesizer',
      content: `Sequential Analysis:\n\n${content}`,
      confidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
      metadata: {
        synthesisType: 'sequential',
        stepCount: responses.length
      },
      timestamp: new Date()
    };
  }

  private async synthesizeParallelResponse(responses: AgentResponse[], resolutions: any[]): Promise<AgentResponse> {
    // Synthesize responses from parallel execution
    const content = responses
      .map(r => `• ${r.metadata?.agentName}: ${r.content}`)
      .join('\n\n');

    return {
      id: `synthesized-parallel-${Date.now()}`,
      agentId: 'parallel-synthesizer',
      content: `Parallel Analysis:\n\n${content}`,
      confidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
      metadata: {
        synthesisType: 'parallel',
        participantCount: responses.length
      },
      timestamp: new Date()
    };
  }

  private async synthesizeHierarchicalResponse(
    masterResponse: AgentResponse,
    specialistResponses: AgentResponse[],
    resolutions: any[]
  ): Promise<AgentResponse> {
    const content = `Master Analysis: ${masterResponse.content}\n\nSpecialist Inputs:\n${specialistResponses
      .map(r => `• ${r.metadata?.agentName}: ${r.content}`)
      .join('\n')}`;

    return {
      id: `synthesized-hierarchical-${Date.now()}`,
      agentId: 'hierarchical-synthesizer',
      content,
      confidence: (masterResponse.confidence + specialistResponses.reduce((sum, r) => sum + r.confidence, 0) / specialistResponses.length) / 2,
      metadata: {
        synthesisType: 'hierarchical',
        masterAgent: masterResponse.agentId,
        specialistCount: specialistResponses.length
      },
      timestamp: new Date()
    };
  }

  private async synthesizeConsensusResponse(
    responses: AgentResponse[],
    consensusResponse: AgentResponse,
    resolutions: any[]
  ): Promise<AgentResponse> {
    return {
      ...consensusResponse,
      id: `final-consensus-${Date.now()}`,
      metadata: {
        ...consensusResponse.metadata,
        finalConsensus: true,
        resolutionCount: resolutions.length
      }
    };
  }

  private calculateQualityScore(responses: AgentResponse[], finalResponse: AgentResponse): number {
    // Simple quality score based on response confidence and consistency
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    const finalConfidence = finalResponse.confidence;
    
    return (avgConfidence + finalConfidence) / 2;
  }

  private recordPerformanceMetrics(strategy: string, time: number): void {
    if (!this.performanceMetrics.has(strategy)) {
      this.performanceMetrics.set(strategy, []);
    }
    
    const metrics = this.performanceMetrics.get(strategy)!;
    metrics.push(time);
    
    // Keep only last 100 metrics per strategy
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
  }

  /**
   * Get performance metrics for strategies
   */
  getPerformanceMetrics(): Map<string, { average: number; count: number; min: number; max: number }> {
    const result = new Map();
    
    for (const [strategy, times] of this.performanceMetrics.entries()) {
      if (times.length === 0) continue;
      
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      
      result.set(strategy, { average, count: times.length, min, max });
    }
    
    return result;
  }
}

export const multiAgentCoordinator = new MultiAgentCoordinator();

import {
  EnhancedWorkflowStep,
  AgentSelectionStrategy,
  AgentSelectionCriteria,
  ConsensusConfiguration,
  AgentPerformanceMetrics
} from '@/types/workflow-enhanced';
import { Agent } from '@/lib/agents/agent-service';
import { workflowService } from './workflow-service';

export interface AgentAssignmentResult {
  selectedAgents: Agent[];
  confidence: number;
  reasoning: string;
  fallbackOptions?: Agent[];
  costEstimate?: number;
  timeEstimate?: number;
}

export interface ConsensusResult {
  agents: Agent[];
  consensusScore: number;
  agreements: Record<string, number>;
  finalDecision: any;
  conflictResolution?: string;
}

export interface AgentWorkload {
  agentId: string;
  currentTasks: number;
  estimatedCompletionTime: number;
  capacityUtilization: number;
  queueLength: number;
}

export class DynamicAgentAssignmentEngine {
  private performanceCache = new Map<string, AgentPerformanceMetrics[]>();
  private workloadCache = new Map<string, AgentWorkload>();
  private lastCacheUpdate = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Main entry point for agent assignment
   */
  async assignAgent(
    step: EnhancedWorkflowStep,
    availableAgents: Agent[],
    context?: {
      workflowId: string;
      executionId: string;
      previousStepResults?: Record<string, any>;
      urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
      budgetConstraints?: { maxCostPerStep: number; totalBudget: number };
    }
  ): Promise<AgentAssignmentResult> {

    // Validate inputs
    if (!availableAgents.length) {
      throw new Error('No available agents for assignment');
    }

    // Filter agents by basic requirements
    const eligibleAgents = await this.filterEligibleAgents(step, availableAgents);

    if (!eligibleAgents.length) {
      throw new Error(`No agents meet the requirements for step: ${step.step_name}`);
    }

    // Get or create assignment strategy
    const strategy = step.agent_selection || this.getDefaultStrategy(step, context);

    // Execute assignment based on strategy
    switch (strategy.strategy) {
      case 'capability_based':
        return this.assignByCapabilities(step, eligibleAgents, strategy.criteria, context);

      case 'automatic':
        return this.assignByPerformance(step, eligibleAgents, strategy.criteria, context);

      case 'load_balanced':
        return this.assignByLoadBalancing(step, eligibleAgents, strategy.criteria, context);

      case 'consensus':
        return this.assignByConsensus(step, eligibleAgents, strategy, context);

      case 'manual':
        return this.prepareForManualAssignment(step, eligibleAgents, strategy.criteria, context);

      default:
        return this.assignByPerformance(step, eligibleAgents, strategy.criteria, context);
    }
  }

  /**
   * Filter agents based on basic requirements
   */
  private async filterEligibleAgents(
    step: EnhancedWorkflowStep,
    agents: Agent[]
  ): Promise<Agent[]> {
    return agents.filter(agent => {
      // Check required capabilities
      const hasRequiredCapabilities = step.required_capabilities.every(
        capability => agent.capabilities?.includes(capability)
      );

      if (!hasRequiredCapabilities) {
        return false;
      }

      // Check agent availability (simplified - could be enhanced with real-time data)
      // For now, assume all agents are available
      return true;
    });
  }

  /**
   * Get default assignment strategy based on step and context
   */
  private getDefaultStrategy(
    step: EnhancedWorkflowStep,
    context?: any
  ): AgentSelectionStrategy {
    // Determine strategy based on step complexity and context
    let strategy: AgentSelectionStrategy['strategy'] = 'automatic';

    if (context?.urgencyLevel === 'critical') {
      strategy = 'automatic'; // Fast assignment for critical tasks
    } else if (step.required_capabilities.length > 3) {
      strategy = 'capability_based'; // Complex tasks need careful capability matching
    } else if (context?.budgetConstraints) {
      strategy = 'load_balanced'; // Cost-conscious assignment
    }

    return {
      strategy,
      criteria: {
        min_success_rate: 0.8,
        min_quality_score: 0.75,
        performance_weight: 0.4,
        cost_weight: 0.3,
        availability_weight: 0.3
      }
    };
  }

  /**
   * Assign agent based on capabilities
   */
  private async assignByCapabilities(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    criteria?: AgentSelectionCriteria,
    context?: any
  ): Promise<AgentAssignmentResult> {

    const scoredAgents = await this.scoreAgentsByCapabilities(step, agents, criteria);
    const bestAgent = scoredAgents[0];

    if (!bestAgent) {
      throw new Error('No suitable agent found for capability-based assignment');
    }

    const costEstimate = await this.estimateCost(bestAgent.agent, step);
    const timeEstimate = step.estimated_duration || 30;

    return {
      selectedAgents: [bestAgent.agent],
      confidence: bestAgent.score,
      reasoning: `Selected based on capability match score: ${(bestAgent.score * 100).toFixed(1)}%. ` +
                `Agent has required capabilities: ${step.required_capabilities.join(', ')}`,
      fallbackOptions: scoredAgents.slice(1, 4).map(s => s.agent),
      costEstimate,
      timeEstimate
    };
  }

  /**
   * Assign agent based on performance metrics
   */
  private async assignByPerformance(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    criteria?: AgentSelectionCriteria,
    context?: any
  ): Promise<AgentAssignmentResult> {

    const performanceData = await this.getAgentPerformanceData(agents, step.id.toString());
    const scoredAgents = await this.scoreAgentsByPerformance(
      agents,
      performanceData,
      criteria,
      context
    );

    const bestAgent = scoredAgents[0];
    if (!bestAgent) {
      throw new Error('No suitable agent found for performance-based assignment');
    }

    const performance = performanceData.find(p => p.agent_id === bestAgent.agent.id);
    const costEstimate = await this.estimateCost(bestAgent.agent, step);
    const timeEstimate = performance?.execution_time
      ? performance.execution_time / 1000 / 60 // Convert to minutes
      : step.estimated_duration || 30;

    return {
      selectedAgents: [bestAgent.agent],
      confidence: bestAgent.score,
      reasoning: this.generatePerformanceReasoning(bestAgent.agent, performance, bestAgent.score),
      fallbackOptions: scoredAgents.slice(1, 4).map(s => s.agent),
      costEstimate,
      timeEstimate
    };
  }

  /**
   * Assign agent based on load balancing
   */
  private async assignByLoadBalancing(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    criteria?: AgentSelectionCriteria,
    context?: any
  ): Promise<AgentAssignmentResult> {

    const workloads = await this.getAgentWorkloads(agents);
    const performanceData = await this.getAgentPerformanceData(agents, step.id.toString());

    // Score agents based on workload and performance
    const scoredAgents = agents.map(agent => {
      const workload = workloads.find(w => w.agentId === agent.id);
      const performance = performanceData.find(p => p.agent_id === agent.id);

      // Calculate load balance score (lower workload = higher score)
      const workloadScore = workload
        ? Math.max(0, 1 - (workload.capacityUtilization / 100))
        : 1.0;

      // Calculate performance score
      const performanceScore = performance
        ? (performance.success_rate + performance.quality_score) / 2
        : 0.5;

      // Weighted combination
      const finalScore = (workloadScore * 0.6) + (performanceScore * 0.4);

      return {
        agent,
        score: finalScore,
        workload: workload?.capacityUtilization || 0,
        performance
      };
    }).sort((a, b) => b.score - a.score);

    const bestAgent = scoredAgents[0];
    const costEstimate = await this.estimateCost(bestAgent.agent, step);
    const timeEstimate = bestAgent.workload > 80
      ? (step.estimated_duration || 30) * 1.5 // Add delay for high workload
      : step.estimated_duration || 30;

    return {
      selectedAgents: [bestAgent.agent],
      confidence: bestAgent.score,
      reasoning: `Selected for optimal load balancing. Current utilization: ${bestAgent.workload.toFixed(1)}%. ` +
                `Performance score: ${((bestAgent.performance?.success_rate || 0.5) * 100).toFixed(1)}%`,
      fallbackOptions: scoredAgents.slice(1, 4).map(s => s.agent),
      costEstimate,
      timeEstimate
    };
  }

  /**
   * Assign multiple agents for consensus-based execution
   */
  private async assignByConsensus(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    strategy: AgentSelectionStrategy,
    context?: any
  ): Promise<AgentAssignmentResult> {

    const consensusConfig = strategy.consensus_config;
    if (!consensusConfig) {
      throw new Error('Consensus configuration required for consensus strategy');
    }

    const performanceData = await this.getAgentPerformanceData(agents, step.id.toString());
    const scoredAgents = await this.scoreAgentsByPerformance(
      agents,
      performanceData,
      strategy.criteria,
      context
    );

    // Select top agents for consensus
    const selectedCount = Math.min(
      Math.max(consensusConfig.min_agents, 2),
      Math.min(consensusConfig.max_agents, scoredAgents.length)
    );

    const selectedAgents = scoredAgents.slice(0, selectedCount).map(s => s.agent);
    const avgScore = scoredAgents.slice(0, selectedCount)
      .reduce((sum, s) => sum + s.score, 0) / selectedCount;

    const totalCost = await Promise.all(
      selectedAgents.map(agent => this.estimateCost(agent, step))
    ).then(costs => costs.reduce((sum, cost) => sum + cost, 0));

    return {
      selectedAgents,
      confidence: avgScore,
      reasoning: `Selected ${selectedAgents.length} agents for consensus execution. ` +
                `Agreement threshold: ${(consensusConfig.agreement_threshold * 100).toFixed(0)}%. ` +
                `Agents: ${selectedAgents.map(a => a.name).join(', ')}`,
      fallbackOptions: scoredAgents.slice(selectedCount, selectedCount + 3).map(s => s.agent),
      costEstimate: totalCost,
      timeEstimate: step.estimated_duration || 30
    };
  }

  /**
   * Prepare options for manual assignment
   */
  private async prepareForManualAssignment(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    criteria?: AgentSelectionCriteria,
    context?: any
  ): Promise<AgentAssignmentResult> {

    const performanceData = await this.getAgentPerformanceData(agents, step.id.toString());
    const workloads = await this.getAgentWorkloads(agents);

    // Provide comprehensive information for manual decision
    const agentOptions = await Promise.all(
      agents.map(async (agent) => {
        const performance = performanceData.find(p => p.agent_id === agent.id);
        const workload = workloads.find(w => w.agentId === agent.id);
        const cost = await this.estimateCost(agent, step);

        return {
          agent,
          performance,
          workload: workload?.capacityUtilization || 0,
          cost,
          recommendation: this.generateAgentRecommendation(agent, performance, workload)
        };
      })
    );

    // Sort by a balanced score for initial recommendation
    const sorted = agentOptions.sort((a, b) => {
      const scoreA = this.calculateBalancedScore(a.performance, a.workload);
      const scoreB = this.calculateBalancedScore(b.performance, b.workload);
      return scoreB - scoreA;
    });

    return {
      selectedAgents: [], // Will be selected manually
      confidence: 0,
      reasoning: `Manual assignment required. ${agents.length} eligible agents available. ` +
                `Recommended: ${sorted[0].agent.name} (${sorted[0].recommendation})`,
      fallbackOptions: sorted.map(o => o.agent),
      costEstimate: sorted[0].cost,
      timeEstimate: step.estimated_duration || 30
    };
  }

  /**
   * Execute consensus-based task execution
   */
  async executeConsensusTask(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    config: ConsensusConfiguration,
    inputData: any
  ): Promise<ConsensusResult> {

    const results = await Promise.all(
      agents.map(async (agent) => {
        try {
          // Execute step with each agent
          const result = await this.executeStepWithAgent(agent, step, inputData);
          return {
            agentId: agent.id,
            result,
            success: true
          };
        } catch (error) {
          return {
            agentId: agent.id,
            result: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    // Analyze consensus
    const successfulResults = results.filter(r => r.success);
    const consensus = this.analyzeConsensus(successfulResults, config);

    return {
      agents,
      consensusScore: consensus.score,
      agreements: consensus.agreements,
      finalDecision: consensus.finalResult,
      conflictResolution: consensus.conflictResolution
    };
  }

  /**
   * Monitor and update agent performance metrics
   */
  async updateAgentPerformance(
    agentId: string,
    stepId: string,
    metrics: {
      executionTime: number;
      success: boolean;
      qualityScore: number;
      cost: number;
      userFeedback?: number;
      errorDetails?: string;
    }
  ): Promise<void> {

    const performanceMetrics: Omit<AgentPerformanceMetrics, 'id' | 'recorded_at'> = {
      agent_id: agentId,
      step_id: stepId,
      jtbd_id: '', // Would be passed from context
      execution_time: metrics.executionTime,
      success_rate: metrics.success ? 1 : 0,
      quality_score: metrics.qualityScore,
      cost_per_token: metrics.cost,
      user_satisfaction: metrics.userFeedback || 0,
      error_count: metrics.success ? 0 : 1,
      capability_scores: {},
      metadata: {
        error_details: metrics.errorDetails,
        timestamp: new Date().toISOString()
      }
    };

    await workflowService.recordAgentPerformance(performanceMetrics);

    // Clear cache to ensure fresh data on next assignment
    this.performanceCache.delete(agentId);
  }

  // Private helper methods

  private async scoreAgentsByCapabilities(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    criteria?: AgentSelectionCriteria
  ): Promise<Array<{ agent: Agent; score: number }>> {

    return agents.map(agent => {
      let score = 0;
      let totalWeight = 0;

      // Required capabilities (must have all)
      const hasAllRequired = step.required_capabilities.every(
        cap => agent.capabilities?.includes(cap)
      );

      if (!hasAllRequired) {
        return { agent, score: 0 };
      }

      // Base score for having all required capabilities
      score += 0.5;
      totalWeight += 0.5;

      // Preferred capabilities bonus
      if (criteria?.preferred_capabilities) {
        const preferredMatch = criteria.preferred_capabilities.filter(
          cap => agent.capabilities?.includes(cap)
        ).length / criteria.preferred_capabilities.length;

        score += preferredMatch * 0.3;
        totalWeight += 0.3;
      }

      // Capability breadth (having more capabilities can be beneficial)
      const capabilityBreadth = Math.min(1, (agent.capabilities?.length || 0) / 10);
      score += capabilityBreadth * 0.2;
      totalWeight += 0.2;

      return { agent, score: score / totalWeight };
    }).sort((a, b) => b.score - a.score);
  }

  private async scoreAgentsByPerformance(
    agents: Agent[],
    performanceData: AgentPerformanceMetrics[],
    criteria?: AgentSelectionCriteria,
    context?: any
  ): Promise<Array<{ agent: Agent; score: number }>> {

    return agents.map(agent => {
      const performance = performanceData.find(p => p.agent_id === agent.id);

      if (!performance) {
        // No performance data - give neutral score
        return { agent, score: 0.5 };
      }

      let score = 0;
      let totalWeight = 0;

      // Success rate
      if (criteria?.min_success_rate !== undefined) {
        const successWeight = criteria.performance_weight || 0.4;
        const successScore = performance.success_rate >= criteria.min_success_rate
          ? performance.success_rate
          : performance.success_rate * 0.5; // Penalty for below threshold

        score += successScore * successWeight;
        totalWeight += successWeight;
      }

      // Quality score
      if (performance.quality_score !== undefined) {
        const qualityWeight = 0.3;
        score += performance.quality_score * qualityWeight;
        totalWeight += qualityWeight;
      }

      // Cost efficiency
      if (criteria?.max_cost_per_token !== undefined && performance.cost_per_token > 0) {
        const costWeight = criteria.cost_weight || 0.2;
        const costScore = Math.max(0, 1 - (performance.cost_per_token / criteria.max_cost_per_token));
        score += costScore * costWeight;
        totalWeight += costWeight;
      }

      // User satisfaction
      if (performance.user_satisfaction > 0) {
        const satisfactionWeight = 0.1;
        score += (performance.user_satisfaction / 5) * satisfactionWeight;
        totalWeight += satisfactionWeight;
      }

      return { agent, score: totalWeight > 0 ? score / totalWeight : 0.5 };
    }).sort((a, b) => b.score - a.score);
  }

  private async getAgentPerformanceData(
    agents: Agent[],
    stepId?: string
  ): Promise<AgentPerformanceMetrics[]> {

    // Check cache first
    const cacheKey = `${agents.map(a => a.id).join(',')}-${stepId || 'all'}`;
    if (this.performanceCache.has(cacheKey) && Date.now() - this.lastCacheUpdate < this.CACHE_TTL) {
      return this.performanceCache.get(cacheKey)!;
    }

    // Fetch fresh data
    const agentIds = agents.map(a => a.id);
    const timeRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      end: new Date().toISOString()
    };

    const performanceData = await workflowService.getAgentPerformanceMetrics(
      agentIds,
      stepId,
      timeRange
    );

    // Cache the results
    this.performanceCache.set(cacheKey, performanceData);
    this.lastCacheUpdate = Date.now();

    return performanceData;
  }

  private async getAgentWorkloads(agents: Agent[]): Promise<AgentWorkload[]> {
    // This would typically fetch real-time workload data
    // For now, return simulated data
    return agents.map(agent => ({
      agentId: agent.id,
      currentTasks: Math.floor(Math.random() * 5),
      estimatedCompletionTime: Math.floor(Math.random() * 120) + 30,
      capacityUtilization: Math.floor(Math.random() * 100),
      queueLength: Math.floor(Math.random() * 10)
    }));
  }

  private async estimateCost(agent: Agent, step: EnhancedWorkflowStep): Promise<number> {
    // Cost estimation based on agent characteristics and step complexity
    const baseCost = 0.01; // Base cost per minute
    const complexityMultiplier = step.required_capabilities.length * 0.1 + 1;
    const durationMinutes = step.estimated_duration || 30;

    return baseCost * complexityMultiplier * durationMinutes;
  }

  private generatePerformanceReasoning(
    agent: Agent,
    performance?: AgentPerformanceMetrics,
    score?: number
  ): string {
    if (!performance) {
      return `Selected ${agent.name} based on capabilities match. No performance history available.`;
    }

    return `Selected ${agent.name} with ${(score! * 100).toFixed(1)}% confidence. ` +
           `Success rate: ${(performance.success_rate * 100).toFixed(1)}%, ` +
           `Quality score: ${(performance.quality_score * 100).toFixed(1)}%, ` +
           `Avg execution time: ${(performance.execution_time / 1000 / 60).toFixed(1)} minutes`;
  }

  private generateAgentRecommendation(
    agent: Agent,
    performance?: AgentPerformanceMetrics,
    workload?: AgentWorkload
  ): string {
    const parts = [];

    if (performance) {
      parts.push(`${(performance.success_rate * 100).toFixed(0)}% success rate`);
    }

    if (workload) {
      parts.push(`${workload.capacityUtilization.toFixed(0)}% utilization`);
    }

    if (parts.length === 0) {
      parts.push('No performance data');
    }

    return parts.join(', ');
  }

  private calculateBalancedScore(
    performance?: AgentPerformanceMetrics,
    workload?: number
  ): number {
    const performanceScore = performance
      ? (performance.success_rate + performance.quality_score) / 2
      : 0.5;

    const workloadScore = workload !== undefined
      ? Math.max(0, 1 - (workload / 100))
      : 0.5;

    return (performanceScore * 0.7) + (workloadScore * 0.3);
  }

  private async executeStepWithAgent(
    agent: Agent,
    step: EnhancedWorkflowStep,
    inputData: any
  ): Promise<any> {
    // This would integrate with your actual execution engine
    // For now, return a simulated result
    return {
      agentId: agent.id,
      stepId: step.id,
      result: `Executed by ${agent.name}`,
      confidence: Math.random() * 0.3 + 0.7,
      timestamp: new Date().toISOString()
    };
  }

  private analyzeConsensus(
    results: Array<{ agentId: string; result: any; success: boolean }>,
    config: ConsensusConfiguration
  ): {
    score: number;
    agreements: Record<string, number>;
    finalResult: any;
    conflictResolution?: string;
  } {
    // Simplified consensus analysis
    const successCount = results.filter(r => r.success).length;
    const consensusScore = successCount / results.length;

    if (consensusScore >= config.agreement_threshold) {
      return {
        score: consensusScore,
        agreements: { consensus: consensusScore },
        finalResult: results.find(r => r.success)?.result,
        conflictResolution: 'Consensus achieved'
      };
    } else {
      return {
        score: consensusScore,
        agreements: { consensus: consensusScore },
        finalResult: results.find(r => r.success)?.result,
        conflictResolution: `Tie-breaker used: ${config.tie_breaker_strategy}`
      };
    }
  }
}

// Export singleton instance
export const agentAssignmentEngine = new DynamicAgentAssignmentEngine();
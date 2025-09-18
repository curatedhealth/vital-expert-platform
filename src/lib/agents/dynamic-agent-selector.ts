// Dynamic Agent Selection Service for Enhanced JTBD Workflows

import { Agent, AgentWithCapabilities } from '@/types/agent';
import {
  EnhancedWorkflowStep,
  AgentSelectionStrategy,
  AgentSelectionCriteria,
  ConsensusConfiguration,
  AgentScoringResult,
  AgentSelectionDecision,
  AgentPerformanceMetrics
} from '@/types/workflow-enhanced';
import { ExecutionContext } from '@/lib/jtbd/execution-engine';
import { createClient } from '@supabase/supabase-js';

export class DynamicAgentSelector {
  private supabase: any;
  private performanceCache: Map<string, AgentPerformanceData> = new Map();
  private loadCache: Map<string, LoadData> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Select optimal agent(s) for a workflow step
   */
  async selectOptimalAgent(
    step: EnhancedWorkflowStep,
    context: ExecutionContext,
    availableAgents: Agent[],
    strategy?: AgentSelectionStrategy
  ): Promise<Agent | Agent[]> {
    const selectionStrategy = strategy || step.agent_selection || {
      strategy: 'automatic',
      criteria: {}
    };

    console.log(`🤖 Selecting agent for step: ${step.step_name} using strategy: ${selectionStrategy.strategy}`);

    try {
      switch (selectionStrategy.strategy) {
        case 'manual':
          return await this.manualSelection(step, selectionStrategy.criteria);

        case 'automatic':
          return await this.automaticSelection(step, availableAgents, context);

        case 'consensus':
          return await this.consensusSelection(step, availableAgents, selectionStrategy.consensus_config);

        case 'load_balanced':
          return await this.loadBalancedSelection(step, availableAgents);

        case 'capability_based':
          return await this.capabilityBasedSelection(step, availableAgents);

        default:
          return await this.automaticSelection(step, availableAgents, context);
      }
    } catch (error) {
      console.error(`Agent selection failed for step ${step.step_name}:`, error);

      // Fallback to best available agent
      if (selectionStrategy.fallback_agents && selectionStrategy.fallback_agents.length > 0) {
        return await this.fallbackSelection(selectionStrategy.fallback_agents, availableAgents);
      }

      throw error;
    }
  }

  /**
   * Automatic agent selection using multi-factor scoring
   */
  private async automaticSelection(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    context: ExecutionContext
  ): Promise<Agent> {
    // Score each agent based on multiple criteria
    const scoredAgents = await Promise.all(
      agents.map(async agent => {
        const score = await this.calculateAgentScore(agent, step, context);
        return {
          agent,
          score,
          scoring_breakdown: await this.getDetailedScoring(agent, step, context)
        };
      })
    );

    // Sort by score (highest first)
    scoredAgents.sort((a, b) => b.score - a.score);

    if (scoredAgents.length === 0 || scoredAgents[0].score < 0.3) {
      throw new Error(`No suitable agent found for step: ${step.step_name}`);
    }

    // Log selection decision for analytics
    await this.logSelectionDecision(step, scoredAgents[0].agent, scoredAgents, 'automatic');

    return scoredAgents[0].agent;
  }

  /**
   * Calculate comprehensive agent score
   */
  private async calculateAgentScore(
    agent: Agent,
    step: EnhancedWorkflowStep,
    context: ExecutionContext
  ): Promise<number> {
    let score = 0;

    // 1. Capability Matching (40% weight)
    const capabilityScore = this.calculateCapabilityMatch(
      agent.capabilities as string[] || [],
      step.required_capabilities || []
    );
    score += capabilityScore * 0.4;

    // 2. Historical Performance (30% weight)
    const performanceScore = await this.getAgentPerformanceScore(
      agent.id,
      step.jtbd_id,
      step.step_number
    );
    score += performanceScore * 0.3;

    // 3. Current Load (20% weight)
    const loadScore = await this.calculateLoadScore(agent.id);
    score += loadScore * 0.2;

    // 4. Cost Efficiency (10% weight)
    const costScore = this.calculateCostScore(agent);
    score += costScore * 0.1;

    // 5. Specialization Bonus (up to 20% bonus)
    if (this.hasSpecialization(agent, step)) {
      score *= 1.2;
    }

    // 6. Tier Priority Bonus
    const tierBonus = (6 - (agent.tier || 3)) * 0.05;
    score += tierBonus;

    // 7. Recent Success Bonus
    const recentSuccessBonus = await this.getRecentSuccessBonus(agent.id);
    score += recentSuccessBonus;

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Get detailed scoring breakdown for transparency
   */
  private async getDetailedScoring(
    agent: Agent,
    step: EnhancedWorkflowStep,
    context: ExecutionContext
  ): Promise<AgentScoringResult['scoring_breakdown']> {
    return {
      capability_match: this.calculateCapabilityMatch(
        agent.capabilities as string[] || [],
        step.required_capabilities || []
      ),
      performance_history: await this.getAgentPerformanceScore(
        agent.id,
        step.jtbd_id,
        step.step_number
      ),
      current_load: await this.calculateLoadScore(agent.id),
      cost_efficiency: this.calculateCostScore(agent),
      specialization_bonus: this.hasSpecialization(agent, step) ? 0.2 : 0
    };
  }

  /**
   * Calculate capability matching score with fuzzy matching
   */
  private calculateCapabilityMatch(
    agentCapabilities: string[],
    requiredCapabilities: string[]
  ): number {
    if (requiredCapabilities.length === 0) return 1.0;

    const matches = requiredCapabilities.filter(required =>
      agentCapabilities.some(capability =>
        this.isCapabilityMatch(capability, required)
      )
    );

    // Exact matches get full score, partial matches get partial score
    const exactMatches = matches.filter(required =>
      agentCapabilities.some(capability =>
        capability.toLowerCase() === required.toLowerCase()
      )
    );

    const exactScore = exactMatches.length / requiredCapabilities.length;
    const partialScore = (matches.length - exactMatches.length) / requiredCapabilities.length * 0.7;

    return exactScore + partialScore;
  }

  /**
   * Check if agent capability matches required capability
   */
  private isCapabilityMatch(agentCapability: string, requiredCapability: string): boolean {
    // Direct match
    if (agentCapability.toLowerCase() === requiredCapability.toLowerCase()) {
      return true;
    }

    // Synonym matching for pharmaceutical capabilities
    const synonyms: Record<string, string[]> = {
      'regulatory_analysis': ['regulatory_guidance', 'compliance_analysis', 'regulatory_review', 'fda_expertise'],
      'clinical_design': ['clinical_trial_design', 'study_design', 'protocol_development', 'clinical_research'],
      'market_analysis': ['market_research', 'competitive_analysis', 'market_assessment', 'commercial_analysis'],
      'data_analysis': ['statistical_analysis', 'data_processing', 'analytics', 'biostatistics'],
      'report_generation': ['report_writing', 'documentation', 'report_creation', 'medical_writing'],
      'literature_review': ['literature_search', 'evidence_review', 'publication_analysis'],
      'safety_assessment': ['risk_analysis', 'safety_monitoring', 'adverse_event_analysis'],
      'hta_analysis': ['health_technology_assessment', 'reimbursement_analysis', 'payer_strategy']
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if (
        (key === requiredCapability.toLowerCase() && values.includes(agentCapability.toLowerCase())) ||
        (values.includes(requiredCapability.toLowerCase()) && key === agentCapability.toLowerCase()) ||
        (values.includes(agentCapability.toLowerCase()) && values.includes(requiredCapability.toLowerCase()))
      ) {
        return true;
      }
    }

    // Partial match (contains keyword)
    return agentCapability.toLowerCase().includes(requiredCapability.toLowerCase()) ||
           requiredCapability.toLowerCase().includes(agentCapability.toLowerCase());
  }

  /**
   * Get agent performance score from historical data
   */
  private async getAgentPerformanceScore(
    agentId: string,
    jtbdId: string,
    stepNumber: number
  ): Promise<number> {
    // Check cache first
    const cacheKey = `${agentId}-${jtbdId}-${stepNumber}`;
    if (this.performanceCache.has(cacheKey)) {
      const cached = this.performanceCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.score;
      }
    }

    try {
      // Query performance metrics from database
      const { data, error } = await this.supabase
        .from('agent_performance_metrics')
        .select('success_rate, quality_score, execution_time, user_satisfaction')
        .eq('agent_id', agentId)
        .order('recorded_at', { ascending: false })
        .limit(20); // Use more recent data

      if (error || !data || data.length === 0) {
        return 0.5; // Default neutral score for new agents
      }

      // Calculate weighted average with recent bias
      let weightedSum = 0;
      let totalWeight = 0;

      data.forEach((metric, index) => {
        const weight = Math.exp(-index * 0.1); // Exponential decay for older data
        const metricScore = (
          (metric.success_rate || 0) * 0.4 +
          (metric.quality_score || 0) * 0.3 +
          (this.normalizeExecutionTime(metric.execution_time || 0)) * 0.2 +
          (metric.user_satisfaction || 0.5) * 0.1
        );

        weightedSum += metricScore * weight;
        totalWeight += weight;
      });

      const performanceScore = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

      // Cache the result
      this.performanceCache.set(cacheKey, {
        score: performanceScore,
        timestamp: Date.now()
      });

      return performanceScore;
    } catch (error) {
      console.error('Error getting agent performance score:', error);
      return 0.5;
    }
  }

  /**
   * Normalize execution time to 0-1 score (faster is better)
   */
  private normalizeExecutionTime(executionTime: number): number {
    // Assume 5 minutes (300 seconds) is baseline good performance
    const baselineSeconds = 300;
    return Math.min(1, baselineSeconds / Math.max(executionTime, 1));
  }

  /**
   * Calculate current agent load score
   */
  private async calculateLoadScore(agentId: string): Promise<number> {
    const cacheKey = agentId;
    if (this.loadCache.has(cacheKey)) {
      const cached = this.loadCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached.score;
      }
    }

    try {
      // Query current active executions using this agent
      const { data, error } = await this.supabase
        .from('jtbd_executions')
        .select('id, agents_used')
        .in('status', ['Running', 'Initializing'])
        .contains('agents_used', [agentId]);

      if (error) {
        console.error('Error calculating load score:', error);
        return 0.5;
      }

      const activeCount = data?.length || 0;

      // Score decreases as load increases
      // 0 active = 1.0, 3 active = 0.7, 5 active = 0.5, 10+ active = 0.0
      const loadScore = Math.max(0, 1 - (activeCount / 10));

      // Cache the result
      this.loadCache.set(cacheKey, {
        score: loadScore,
        timestamp: Date.now()
      });

      return loadScore;
    } catch (error) {
      console.error('Error calculating load score:', error);
      return 0.5;
    }
  }

  /**
   * Calculate cost efficiency score
   */
  private calculateCostScore(agent: Agent): number {
    // Model cost mapping (cost per 1K tokens)
    const costMap: Record<string, number> = {
      'gpt-4-turbo-preview': 0.03,
      'gpt-4': 0.06,
      'gpt-3.5-turbo': 0.002,
      'claude-3-opus-20240229': 0.075,
      'claude-3-sonnet-20240229': 0.003,
      'claude-3-haiku-20240307': 0.00025
    };

    const modelCost = costMap[agent.model as string] || 0.01;

    // Inverse score - cheaper is better
    // Normalize: $0.00025 = 1.0, $0.075 = 0.0
    return Math.max(0, 1 - (modelCost / 0.075));
  }

  /**
   * Check if agent has specialization matching the step
   */
  private hasSpecialization(agent: Agent, step: EnhancedWorkflowStep): boolean {
    const stepSpecializations: Record<string, string[]> = {
      'regulatory': ['FDA', 'EMA', 'regulatory', 'compliance', '510k', 'de novo'],
      'clinical': ['clinical', 'trial', 'study', 'protocol', 'biostatistics'],
      'market': ['market', 'HTA', 'reimbursement', 'payer', 'commercial'],
      'medical': ['medical', 'KOL', 'publication', 'scientific', 'literature'],
      'safety': ['safety', 'pharmacovigilance', 'adverse', 'risk'],
      'quality': ['quality', 'GMP', 'validation', 'compliance']
    };

    const agentSpecs = (agent.specializations as string[] || []).map(s => s.toLowerCase());
    const stepName = step.step_name.toLowerCase();
    const stepDesc = step.step_description.toLowerCase();

    for (const [category, keywords] of Object.entries(stepSpecializations)) {
      const hasStepKeyword = keywords.some(kw =>
        stepName.includes(kw) || stepDesc.includes(kw)
      );
      const hasAgentSpec = agentSpecs.some(spec =>
        keywords.some(kw => spec.includes(kw))
      );

      if (hasStepKeyword && hasAgentSpec) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get recent success bonus for agents with good recent performance
   */
  private async getRecentSuccessBonus(agentId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('agent_performance_metrics')
        .select('success_rate')
        .eq('agent_id', agentId)
        .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .limit(10);

      if (error || !data || data.length === 0) {
        return 0;
      }

      const avgSuccessRate = data.reduce((sum, m) => sum + (m.success_rate || 0), 0) / data.length;

      // Bonus for high recent success rate
      return avgSuccessRate > 0.9 ? 0.05 : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Consensus selection with multiple agents
   */
  private async consensusSelection(
    step: EnhancedWorkflowStep,
    agents: Agent[],
    consensusConfig?: ConsensusConfiguration
  ): Promise<Agent[]> {
    const agentCount = consensusConfig?.agent_count || 3;
    const strategy = consensusConfig?.selection_strategy || 'top_scored';

    console.log(`🤝 Selecting ${agentCount} agents for consensus using ${strategy} strategy`);

    let selectedAgents: Agent[] = [];

    switch (strategy) {
      case 'top_scored':
        // Select top N agents by score
        const scoredAgents = await Promise.all(
          agents.map(async agent => ({
            agent,
            score: await this.calculateAgentScore(agent, step, {} as ExecutionContext)
          }))
        );
        scoredAgents.sort((a, b) => b.score - a.score);
        selectedAgents = scoredAgents.slice(0, agentCount).map(s => s.agent);
        break;

      case 'diverse':
        // Select agents with different specializations
        selectedAgents = this.selectDiverseAgents(agents, agentCount);
        break;

      case 'tiered':
        // Select one agent from each tier
        selectedAgents = this.selectTieredAgents(agents, agentCount);
        break;
    }

    if (selectedAgents.length === 0) {
      throw new Error('No agents available for consensus selection');
    }

    await this.logSelectionDecision(step, selectedAgents[0],
      selectedAgents.map(a => ({ agent: a, score: 1 })), 'consensus');

    return selectedAgents;
  }

  /**
   * Select diverse agents with different specializations
   */
  private selectDiverseAgents(agents: Agent[], count: number): Agent[] {
    const selected: Agent[] = [];
    const usedSpecializations = new Set<string>();

    for (const agent of agents) {
      const agentSpecs = agent.specializations as string[] || [];

      // Check if this agent brings new specializations
      const newSpecs = agentSpecs.filter(spec => !usedSpecializations.has(spec));

      if (newSpecs.length > 0 || selected.length === 0) {
        selected.push(agent);
        agentSpecs.forEach(spec => usedSpecializations.add(spec));

        if (selected.length >= count) break;
      }
    }

    return selected;
  }

  /**
   * Select agents from different tiers
   */
  private selectTieredAgents(agents: Agent[], count: number): Agent[] {
    const selected: Agent[] = [];
    const tiers = [1, 2, 3];

    for (const tier of tiers) {
      const tierAgents = agents.filter(a => a.tier === tier);
      if (tierAgents.length > 0) {
        // Sort by priority within tier
        tierAgents.sort((a, b) => (a.priority || 999) - (b.priority || 999));
        selected.push(tierAgents[0]);

        if (selected.length >= count) break;
      }
    }

    return selected;
  }

  /**
   * Capability-based selection (strict capability matching)
   */
  private async capabilityBasedSelection(
    step: EnhancedWorkflowStep,
    agents: Agent[]
  ): Promise<Agent> {
    // Filter agents by required capabilities
    const capableAgents = agents.filter(agent => {
      const agentCaps = agent.capabilities as string[] || [];
      const requiredCaps = step.required_capabilities || [];

      return requiredCaps.every(required =>
        agentCaps.some(cap => this.isCapabilityMatch(cap, required))
      );
    });

    if (capableAgents.length === 0) {
      throw new Error(`No agent with required capabilities for step: ${step.step_name}`);
    }

    // Among capable agents, select by tier and priority
    capableAgents.sort((a, b) => {
      const tierDiff = (a.tier || 999) - (b.tier || 999);
      if (tierDiff !== 0) return tierDiff;
      return (a.priority || 999) - (b.priority || 999);
    });

    await this.logSelectionDecision(step, capableAgents[0],
      capableAgents.slice(0, 3).map(a => ({ agent: a, score: 1 })), 'capability_based');

    return capableAgents[0];
  }

  /**
   * Load-balanced selection
   */
  private async loadBalancedSelection(
    step: EnhancedWorkflowStep,
    agents: Agent[]
  ): Promise<Agent> {
    // Get load scores for all agents
    const agentLoads = await Promise.all(
      agents.map(async agent => ({
        agent,
        loadScore: await this.calculateLoadScore(agent.id),
        capabilityScore: this.calculateCapabilityMatch(
          agent.capabilities as string[] || [],
          step.required_capabilities || []
        )
      }))
    );

    // Filter by minimum capability match (at least 50%)
    const capableAgents = agentLoads.filter(({ capabilityScore }) => capabilityScore >= 0.5);

    if (capableAgents.length === 0) {
      throw new Error('No capable agent available for load balancing');
    }

    // Select agent with best load score among capable agents
    capableAgents.sort((a, b) => b.loadScore - a.loadScore);

    await this.logSelectionDecision(step, capableAgents[0].agent,
      capableAgents.slice(0, 3).map(a => ({ agent: a.agent, score: a.loadScore })), 'load_balanced');

    return capableAgents[0].agent;
  }

  /**
   * Manual selection using preferred agent
   */
  private async manualSelection(
    step: EnhancedWorkflowStep,
    criteria: AgentSelectionCriteria
  ): Promise<Agent> {
    if (!criteria.preferred_agent_id) {
      throw new Error('Manual selection requires preferred_agent_id');
    }

    const { data, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('id', criteria.preferred_agent_id)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      throw new Error(`Agent not found or inactive: ${criteria.preferred_agent_id}`);
    }

    await this.logSelectionDecision(step, data, [{ agent: data, score: 1 }], 'manual');

    return data;
  }

  /**
   * Fallback selection using predefined fallback agents
   */
  private async fallbackSelection(
    fallbackAgentIds: string[],
    availableAgents: Agent[]
  ): Promise<Agent> {
    for (const agentId of fallbackAgentIds) {
      const agent = availableAgents.find(a => a.id === agentId && a.status === 'active');
      if (agent) {
        console.log(`🔄 Using fallback agent: ${agent.name}`);
        return agent;
      }
    }

    // If no fallback agents available, use any available agent
    const activeAgents = availableAgents.filter(a => a.status === 'active');
    if (activeAgents.length > 0) {
      console.log(`⚠️ Using any available agent: ${activeAgents[0].name}`);
      return activeAgents[0];
    }

    throw new Error('No agents available for execution');
  }

  /**
   * Log agent selection decision for analytics
   */
  private async logSelectionDecision(
    step: EnhancedWorkflowStep,
    selectedAgent: Agent,
    scoredAgents: { agent: Agent; score: number }[],
    strategy: string
  ): Promise<void> {
    const decision: AgentSelectionDecision = {
      step_id: step.id,
      step_name: step.step_name,
      selected_agent_id: selectedAgent.id,
      selected_agent_name: selectedAgent.name,
      selection_scores: scoredAgents.slice(0, 5).map(s => ({
        agent_id: s.agent.id,
        agent_name: s.agent.name,
        score: s.score
      })),
      selection_strategy: strategy,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Agent selected: ${selectedAgent.name} (${strategy}) for step: ${step.step_name}`);

    try {
      // Store decision in database for analytics
      await this.supabase
        .from('agent_selection_logs')
        .insert([{
          step_id: decision.step_id,
          step_name: decision.step_name,
          selected_agent_id: decision.selected_agent_id,
          selection_data: decision,
          strategy: strategy,
          recorded_at: decision.timestamp
        }]);
    } catch (error) {
      console.error('Failed to log selection decision:', error);
      // Don't throw - logging failure shouldn't stop execution
    }
  }

  /**
   * Record agent performance metrics
   */
  async recordAgentPerformance(
    agentId: string,
    stepId: string,
    jtbdId: string,
    performance: {
      executionTime: number;
      success: boolean;
      qualityScore?: number;
      errorCount: number;
      userSatisfaction?: number;
      capabilityScores?: Record<string, number>;
    }
  ): Promise<void> {
    const metrics: AgentPerformanceMetrics = {
      agent_id: agentId,
      step_id: stepId,
      jtbd_id: jtbdId,
      execution_time: performance.executionTime,
      success_rate: performance.success ? 1.0 : 0.0,
      quality_score: performance.qualityScore || null,
      error_count: performance.errorCount,
      user_satisfaction: performance.userSatisfaction || null,
      capability_scores: performance.capabilityScores || null,
      recorded_at: new Date().toISOString()
    };

    try {
      await this.supabase
        .from('agent_performance_metrics')
        .insert([metrics]);

      // Clear performance cache for this agent
      this.clearAgentCache(agentId);

      console.log(`📊 Recorded performance for agent ${agentId}: success=${performance.success}, time=${performance.executionTime}s`);
    } catch (error) {
      console.error('Failed to record agent performance:', error);
    }
  }

  /**
   * Clear cached data for an agent
   */
  private clearAgentCache(agentId: string): void {
    // Clear performance cache
    for (const key of this.performanceCache.keys()) {
      if (key.startsWith(agentId)) {
        this.performanceCache.delete(key);
      }
    }

    // Clear load cache
    this.loadCache.delete(agentId);
  }

  /**
   * Get agent analytics for optimization
   */
  async getAgentAnalytics(
    agentId: string,
    timeRange: { start: string; end: string }
  ): Promise<{
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    averageQualityScore: number;
    capabilityPerformance: Record<string, number>;
    trends: {
      period: string;
      executions: number;
      successRate: number;
    }[];
  }> {
    try {
      const { data, error } = await this.supabase
        .from('agent_performance_metrics')
        .select('*')
        .eq('agent_id', agentId)
        .gte('recorded_at', timeRange.start)
        .lte('recorded_at', timeRange.end);

      if (error || !data) {
        throw error;
      }

      const totalExecutions = data.length;
      const successRate = data.filter(m => m.success_rate > 0).length / totalExecutions;
      const averageExecutionTime = data.reduce((sum, m) => sum + m.execution_time, 0) / totalExecutions;
      const averageQualityScore = data.reduce((sum, m) => sum + (m.quality_score || 0), 0) / totalExecutions;

      // Calculate capability performance
      const capabilityPerformance: Record<string, number> = {};
      data.forEach(metric => {
        if (metric.capability_scores) {
          Object.entries(metric.capability_scores).forEach(([capability, score]) => {
            if (!capabilityPerformance[capability]) {
              capabilityPerformance[capability] = 0;
            }
            capabilityPerformance[capability] += score as number;
          });
        }
      });

      // Normalize capability scores
      Object.keys(capabilityPerformance).forEach(capability => {
        capabilityPerformance[capability] /= totalExecutions;
      });

      return {
        totalExecutions,
        successRate,
        averageExecutionTime,
        averageQualityScore,
        capabilityPerformance,
        trends: [] // TODO: Implement trend analysis
      };
    } catch (error) {
      console.error('Failed to get agent analytics:', error);
      throw error;
    }
  }
}

// Helper interfaces
interface AgentPerformanceData {
  score: number;
  timestamp: number;
}

interface LoadData {
  score: number;
  timestamp: number;
}

// Export singleton instance
export const dynamicAgentSelector = new DynamicAgentSelector(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);